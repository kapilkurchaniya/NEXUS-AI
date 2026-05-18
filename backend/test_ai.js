import dotenv from "dotenv";
dotenv.config();

import { generateResponse, buildHumanMessage } from "./src/services/ai.service.js";
import { searchWeb } from "./src/services/internet.services.js";

async function test() {
  console.log("=== AI Service Test ===");
  console.log("GOOGLE_API_KEY :", process.env.GOOGLE_API_KEY ? "✅" : "❌ MISSING");
  console.log("MISTRAL_API_KEY:", process.env.MISTRAL_API_KEY?.trim() ? "✅" : "❌ MISSING");
  console.log("TAVILY_API_KEY :", process.env.TAVILY_API_KEY?.trim() ? "✅" : "❌ MISSING");
  console.log("");

  // ── Test 1: Raw Tavily search ──
  console.log("── Test 1: Tavily web search ──");
  try {
    const results = await searchWeb("IPL 2026 winner", 3);
    console.log(results.slice(0, 400));
    console.log("✅ Tavily OK\n");
  } catch (e) {
    console.error("❌ Tavily failed:", e.message, "\n");
  }

  // ── Test 2: Real-time query ──
  console.log("── Test 2: Real-time query (web search injected) ──");
  try {
    const messages = [buildHumanMessage("Who won IPL 2026?")];
    const response = await generateResponse(messages);
    console.log("\nResponse:", response.slice(0, 500));
    console.log("\n✅ SUCCESS\n");
  } catch (err) {
    console.error("❌ FAILED:", err.message, "\n");
  }

  // ── Test 3: Simple offline query (no search needed) ──
  console.log("── Test 3: Offline query (skip web search) ──");
  try {
    const messages = [buildHumanMessage("What is 25 * 4?")];
    const response = await generateResponse(messages);
    console.log("Response:", response);
    console.log("✅ SUCCESS\n");
  } catch (err) {
    console.error("❌ FAILED:", err.message, "\n");
  }
}

test();
