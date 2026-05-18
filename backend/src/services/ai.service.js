import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";

import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  ToolMessage,
} from "@langchain/core/messages";

import { tool } from "@langchain/core/tools";
import * as z from "zod";

import { searchWeb } from "./internet.services.js";

// ── Custom error class for rate limits ──
export class RateLimitError extends Error {
  constructor(retryAfterSeconds = 60) {
    super(`Rate limit exceeded. Please wait ${retryAfterSeconds} seconds before trying again.`);
    this.name = "RateLimitError";
    this.retryAfter = retryAfterSeconds;
    this.statusCode = 429;
  }
}

// ── Timeout helper ──
function withTimeout(promise, ms = 30000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI request timed out. Please try again.")), ms)
    ),
  ]);
}

// ── Sleep helper for retry delays ──
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Helper: detect rate-limit errors from various error shapes ──
function isRateLimitError(error) {
  if (error.status === 429 || error.statusCode === 429) return true;
  const msg = String(error.message || "");
  return msg.includes("429") || msg.includes("Too Many Requests") || msg.includes("quota");
}

// ── Extract retry delay from error details ──
function getRetryDelay(error) {
  try {
    if (error.errorDetails) {
      const retryInfo = error.errorDetails.find(
        (d) => d["@type"]?.includes("RetryInfo")
      );
      if (retryInfo?.retryDelay) {
        return parseInt(retryInfo.retryDelay, 10) || 60;
      }
    }
  } catch {
    // ignore parse errors
  }
  return 60;
}

// ── Model initialization ──
// maxRetries: 0 prevents LangChain from automatically retrying 429 errors,
// which was causing it to burn through the entire quota while the user waited.
const geminimodel = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  maxRetries: 0,
});

const mistralmodel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  maxRetries: 0,
});

// Mistral model with tools for fallback
const mistralModelWithTools = mistralmodel.bindTools?.([]) || mistralmodel;

// --- Web search tool definition ---
const webSearchTool = tool(
  async ({ query, limit }) => {
    const result = await searchWeb(query, limit);
    return JSON.stringify(result);
  },
  {
    name: "web_search",
    description:
      "Search the web using Tavily. ONLY use this tool when the user's question requires up-to-date, real-time, or external information such as: current news, today's weather, live scores, stock prices, recent events, or facts you are unsure about. Do NOT call this tool for general knowledge, greetings, opinions, coding help, math, or anything you can answer confidently from your training data.",
    schema: z.object({
      query: z.string().describe("Search query"),
      limit: z.number().default(4).describe("Maximum results"),
    }),
  }
);

const toolsByName = { web_search: webSearchTool };

// Bind the tool to Gemini so it *can* call it, but won't be forced to
const modelWithTools = geminimodel.bindTools([webSearchTool]);

// --- System prompt ---
const SYSTEM_PROMPT = new SystemMessage(
  `You are a helpful, accurate AI assistant. Follow these rules strictly:

1. For general knowledge, greetings, coding help, explanations, math, creative writing, or anything you can confidently answer from your training data — respond DIRECTLY without calling any tools.
2. ONLY call the web_search tool when the user explicitly asks about:
   - Current/recent news or events
   - Today's date, weather, live scores, or stock prices
   - Information that changes frequently or that you are genuinely unsure about
3. When in doubt, answer directly WITHOUT using tools.
4. Always provide well-structured, helpful responses.`
);

// --- Helpers ---
export function buildHumanMessage(text, images = []) {
  if (!images || images.length === 0) {
    return new HumanMessage(text);
  }

  const content = [
    {
      type: "text",
      text: text || "Describe this image.",
    },
  ];

  for (const img of images) {
    content.push({
      type: "image_url",
      image_url: {
        url: `data:${img.mimeType};base64,${img.data}`,
      },
    });
  }

  return new HumanMessage({ content });
}

// ── Gemini call with tool-calling loop ──
async function callGemini(allMessages) {
  // First LLM call — with a 30-second timeout
  let response = await withTimeout(modelWithTools.invoke(allMessages), 30000);

  // If the model decided to call a tool, execute it and call once more
  if (response.tool_calls && response.tool_calls.length > 0) {
    // Add the AI's tool-call message to the conversation
    allMessages.push(response);

    // Execute each tool call (with its own timeout)
    for (const tc of response.tool_calls) {
      const selectedTool = toolsByName[tc.name];
      if (!selectedTool) continue;

      const toolResult = await withTimeout(selectedTool.invoke(tc.args), 15000);
      allMessages.push(
        new ToolMessage({
          content: toolResult,
          tool_call_id: tc.id,
        })
      );
    }

    // Second LLM call — with the search results (30s timeout)
    response = await withTimeout(geminimodel.invoke(allMessages), 30000);
  }

  return response.content;
}

// ── Mistral fallback call (no tool-calling, just plain chat) ──
async function callMistral(messages) {
  console.log("⚡ Falling back to Mistral model...");
  const response = await withTimeout(mistralmodel.invoke(messages), 30000);
  return response.content;
}

// --- Main response generator with automatic Mistral fallback ---
export async function generateResponse(messages) {
  const allMessages = [SYSTEM_PROMPT, ...messages];

  // ── Attempt 1: Try Gemini ──
  try {
    console.log("🔷 Trying Gemini...");
    const content = await callGemini([...allMessages]);
    console.log("✅ Gemini responded successfully");
    return content;
  } catch (geminiError) {
    // If it's NOT a rate limit error, don't bother retrying — throw immediately
    if (!isRateLimitError(geminiError)) {
      // Check for timeout
      if (geminiError.message?.includes("timed out")) {
        const timeoutErr = new Error(geminiError.message);
        timeoutErr.statusCode = 504;
        throw timeoutErr;
      }
      console.error("❌ Gemini failed (non-rate-limit):", geminiError.message);
      throw new Error("Failed to generate AI response. Please try again.");
    }

    const retryDelay = getRetryDelay(geminiError);
    console.warn(`⚠️ Gemini rate-limited (retry after ${retryDelay}s). Falling back to Mistral...`);
  }

  // ── Attempt 2: Fall back to Mistral immediately ──
  try {
    const content = await callMistral([...allMessages]);
    console.log("✅ Mistral responded successfully (fallback)");
    return content;
  } catch (mistralError) {
    console.error("❌ Mistral fallback also failed:", mistralError.message);

    // If Mistral also rate-limited, throw a clean error
    if (isRateLimitError(mistralError)) {
      throw new RateLimitError(60);
    }

    // Check for timeout
    if (mistralError.message?.includes("timed out")) {
      const timeoutErr = new Error(mistralError.message);
      timeoutErr.statusCode = 504;
      throw timeoutErr;
    }

    throw new Error("Both AI models are unavailable. Please try again later.");
  }
}

// --- Chat title generator (uses Mistral) ---
export async function generateChatTitle(message) {
  try {
    const response = await withTimeout(
      mistralmodel.invoke([
        new SystemMessage(
          "Generate a short chat title under 8 words. Return only title."
        ),
        new HumanMessage(message),
      ]),
      10000
    );

    return response.content;
  } catch (error) {
    console.error("Error generating chat title:", error);
    // Don't fail the whole request just because title generation failed
    return "New Chat";
  }
}