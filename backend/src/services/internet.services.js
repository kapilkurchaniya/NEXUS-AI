import { tavily } from "@tavily/core";

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

export const searchWeb = async (query, limit = 4) => {
  try {
    const response = await tvly.search(query, {
      max_results: limit,
    });

    return JSON.stringify(response.results);
  } catch (error) {
    console.error("Error searching web:", error);

    return "Failed to search web.";
  }
};