import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const geminimodel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
});

const mistralmodel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

/**
 * Build a HumanMessage that can contain text + images (multimodal).
 * If no images, returns a plain text HumanMessage.
 */
export function buildHumanMessage(text, images = []) {
  if (!images || images.length === 0) {
    return new HumanMessage(text);
  }

  // Multimodal content array for Gemini
  const content = [
    { type: "text", text: text || "Describe this image." },
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

export async function generateResponse(messages) {

    try {

        console.log("Received message for AI processing:", messages);

        const prompt = Array.isArray(messages)
            ? messages
            : typeof messages === "string"
                ? [new HumanMessage(messages)]
                : [messages];

        const response = await geminimodel.invoke(prompt);

        console.log("Generated AI response:", response.content);

        return response.content;

    } catch (error) {

        console.error("Error generating AI response:", error);

        throw new Error("Internal server error");
    }
}

export async function generateChatTitle(message) {

  try { 

    const response = await mistralmodel.invoke([
      new SystemMessage("You are a helpful assistant that generates a chat title. The title should be concise, ideally less than 8 words, and should capture the essence of the conversation. Please provide only the title without any additional text.  Here is the message: " + message),
      new HumanMessage(message)
    ]);

    return response.content;

  } catch (error) {     
    console.error("Error generating chat title:", error);
    throw new Error("Internal server error");
  }
} 