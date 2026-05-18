import dotenv from "dotenv";
dotenv.config();

import { generateResponse, buildHumanMessage } from "./src/services/ai.service.js";

async function test() {
  console.log("=== AI Service Test ===");
  console.log("GOOGLE_API_KEY present:", !!process.env.GOOGLE_API_KEY);
  console.log("MISTRAL_API_KEY present:", !!process.env.MISTRAL_API_KEY);
  console.log("");

  try {
    console.log("Sending 'Hello, how are you?' ...");
    console.log("(Will try Gemini first, then fallback to Mistral if rate-limited)\n");

    const messages = [buildHumanMessage("Hello, how are you?")];
    const response = await generateResponse(messages);

    console.log("\n=== SUCCESS ===");
    console.log("Response:", response);
  } catch (error) {
    console.error("\n=== FAILED ===");
    console.error("Error:", error.message);
    console.error("Status:", error.statusCode || error.status || "N/A");
  }
}

test();
