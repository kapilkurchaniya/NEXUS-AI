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
    super(
      `Rate limit exceeded. Please wait ${retryAfterSeconds} seconds before trying again.`
    );
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
      setTimeout(
        () => reject(new Error("AI request timed out. Please try again.")),
        ms
      )
    ),
  ]);
}

// ── Detect rate-limit errors ──
function isRateLimitError(error) {
  if (error.status === 429 || error.statusCode === 429) return true;
  const msg = String(error.message || "");
  return (
    msg.includes("429") ||
    msg.includes("Too Many Requests") ||
    msg.includes("quota")
  );
}

// ── Extract retry delay ──
function getRetryDelay(error) {
  try {
    if (error.errorDetails) {
      const retryInfo = error.errorDetails.find((d) =>
        d["@type"]?.includes("RetryInfo")
      );
      if (retryInfo?.retryDelay) return parseInt(retryInfo.retryDelay, 10) || 60;
    }
  } catch {}
  return 60;
}

// ── Get today's date string ──
function getTodayString() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Queries that are clearly NOT worth searching (pure computation/creative) ──
const SKIP_SEARCH_PATTERNS = [
  /^\s*(?:what is|what's|calculate|compute|solve|simplify)\s+[\d\s+\-*/^()]+\s*[=?]?\s*$/i,
  /^(?:hello|hi|hey|thanks|thank you|bye|goodbye)\b/i,
  /^(?:write me|write a|generate a|create a|make a)\s+(?:poem|story|essay|code|function|class|script)/i,
  /^(?:explain|define|what does|what is the meaning of)\s+\w+\s*$/i,
];

function isDefinitelyOffline(query = "") {
  return SKIP_SEARCH_PATTERNS.some((re) => re.test(query.trim()));
}

// ── Model initialization ──
const geminiModel = new ChatGoogleGenerativeAI({
  // Google model id format expected by @langchain/google-genai
  model: process.env.GOOGLE_GEMINI_MODEL || "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

// ── Web search tool (for Gemini tool-calling) ──
const webSearchTool = tool(
  async ({ query, limit }) => {
    console.log(`🔍 [Gemini tool] Searching: "${query}"`);
    return await searchWeb(query, limit);
  },
  {
    name: "web_search",
    description:
      "Search the internet for real-time or recent information. " +
      "Use this for ANY question about: current events, news, prices, weather, " +
      "sports scores, new releases, recent developments, or any fact that may " +
      "have changed. When uncertain whether info is current, search instead of guessing.",
    schema: z.object({
      query: z.string().describe("The search query"),
      limit: z.number().default(5).describe("Number of results"),
    }),
  }
);

const toolsByName = { web_search: webSearchTool };
const geminiWithTools = geminiModel.bindTools([webSearchTool]);

// ── Build system prompt with today's date + optional live web results ──
function buildSystemPrompt(webContext = null) {
  const today = getTodayString();

  const webSection = webContext
    ? `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIVE WEB SEARCH RESULTS (fetched right now):
${webContext}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT: Use the above search results to answer. Do NOT rely on your training data for facts covered above.`
    : "";

  return new SystemMessage(
    `You are a helpful AI assistant similar to Perplexity AI. Today is ${today}.

KEY RULES:
1. If live web search results are provided below, use them — they are more accurate than your training data.
2. For facts, news, prices, events, or anything time-sensitive, rely on the search results.
3. For pure computation (math), creative tasks, or coding, answer from your own knowledge.
4. Always be accurate. If unsure and no results are provided, say so honestly.
5. Cite the source title or URL from results when helpful.${webSection}`
  );
}

// ── Extract plain text from the last HumanMessage ──
function extractLastUserText(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg instanceof HumanMessage) {
      if (typeof msg.content === "string") return msg.content;
      if (Array.isArray(msg.content)) {
        const textPart = msg.content.find((c) => c.type === "text");
        return textPart?.text || "";
      }
    }
  }
  return "";
}

// ── Pre-fetch web results and return as a plain string ──
async function fetchWebContext(userQuery) {
  try {
    console.log(`🌐 Pre-fetching web results for: "${userQuery}"`);
    const results = await withTimeout(searchWeb(userQuery, 5), 20000);
    if (!results || results.includes("unavailable") || results.includes("No relevant")) {
      return null;
    }
    return results;
  } catch (err) {
    console.warn("⚠️ Web pre-fetch failed:", err.message);
    return null;
  }
}

// ── Helpers ──
export function buildHumanMessage(text, images = []) {
  if (!images || images.length === 0) return new HumanMessage(text);

  const content = [{ type: "text", text: text || "Describe this image." }];
  for (const img of images) {
    content.push({
      type: "image_url",
      image_url: { url: `data:${img.mimeType};base64,${img.data}` },
    });
  }
  return new HumanMessage({ content });
}

// ── Gemini call with tool-calling loop ──
async function callGemini(allMessages) {
  let response = await withTimeout(geminiWithTools.invoke(allMessages), 35000);

  if (response.tool_calls && response.tool_calls.length > 0) {
    allMessages.push(response);
    for (const tc of response.tool_calls) {
      const selectedTool = toolsByName[tc.name];
      if (!selectedTool) continue;
      const toolResult = await withTimeout(selectedTool.invoke(tc.args), 20000);
      allMessages.push(new ToolMessage({ content: toolResult, tool_call_id: tc.id }));
    }
    response = await withTimeout(geminiModel.invoke(allMessages), 35000);
  }

  return response.content;
}

// ── Mistral call (no tool-calling — web context already injected) ──
async function callMistral(messages) {
  console.log("⚡ Falling back to Mistral...");
  const response = await withTimeout(mistralModel.invoke(messages), 35000);
  return response.content;
}

// ── Main response generator ──
export async function generateResponse(messages) {
  const userQuery = extractLastUserText(messages);
  console.log(`📝 User query: "${userQuery.slice(0, 80)}"`);  

  // ── Optionally pre-fetch web results ──
  // Skip only for obvious offline queries (math, greetings, creative writing)
  const skipSearch = isDefinitelyOffline(userQuery);
  let webContext = null;

  if (!skipSearch && userQuery.trim().length > 3) {
    webContext = await fetchWebContext(userQuery);
  } else {
    console.log("⏭️  Skipping web search (offline query detected)");
  }

  // Build ONE system prompt that embeds web results inline (Gemini requires single SystemMessage first)
  const systemPrompt = buildSystemPrompt(webContext);
  const allMessages = [systemPrompt, ...messages];

  // ── Attempt 1: Gemini (with tool-calling for follow-up searches) ──
  try {
    console.log(`🔷 Trying Gemini model: ${geminiModel?.model || "(unknown)"}...`);
    const content = await callGemini([...allMessages]);
    console.log("✅ Gemini responded successfully");
    return content;
  } catch (geminiError) {
    if (!isRateLimitError(geminiError)) {
      if (geminiError.message?.includes("timed out")) {
        const err = new Error(geminiError.message);
        err.statusCode = 504;
        throw err;
      }
      console.error("❌ Gemini failed (non-rate-limit):", geminiError.message);
      throw new Error("Failed to generate AI response. Please try again.");
    }
    const retryDelay = getRetryDelay(geminiError);
    console.warn(`⚠️ Gemini rate-limited (retry after ${retryDelay}s). Falling back to Mistral...`);
  }

  // ── Attempt 2: Mistral — web results already in system prompt ──
  try {
    const content = await callMistral([...allMessages]);
    console.log("✅ Mistral responded successfully (fallback)");
    return content;
  } catch (mistralError) {
    console.error("❌ Mistral fallback also failed:", mistralError.message);
    if (isRateLimitError(mistralError)) throw new RateLimitError(60);
    if (mistralError.message?.includes("timed out")) {
      const err = new Error(mistralError.message);
      err.statusCode = 504;
      throw err;
    }
    throw new Error("Both AI models are unavailable. Please try again later.");
  }
}

// ── Chat title generator ──
export async function generateChatTitle(message) {
  try {
    const response = await withTimeout(
      mistralModel.invoke([
        new SystemMessage(
          "Generate a short, descriptive chat title under 8 words. Return ONLY the title, no quotes."
        ),
        new HumanMessage(message),
      ]),
      10000
    );
    return response.content;
  } catch (error) {
    console.error("Error generating chat title:", error);
    return "New Chat";
  }
}