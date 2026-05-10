import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage , SystemMessage  } from "@langchain/core/messages";

const geminimodel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GOOGLE_API_KEY,
});

const mistralmodel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function generateResponse(message) {

    try {

        console.log("Received message for AI processing:", message);

        const response = await geminimodel.invoke([
            new HumanMessage(message)
        ]);

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
      new SystemMessage("You are a helpful assistant that generates a chat title. The title should be concise, ideally less than 5 words, and should capture the essence of the conversation. Please provide only the title without any additional text.  Here is the message: " + message),
      new HumanMessage(message)
    ]);

    return response.content;

  } catch (error) {     
    console.error("Error generating chat title:", error);
    throw new Error("Internal server error");
  }
} 