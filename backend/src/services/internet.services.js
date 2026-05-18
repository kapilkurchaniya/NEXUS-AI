import { tavily } from "@tavily/core";

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY?.trim(),
});

/**
 * Search the web using Tavily and return a readable text block.
 * The result is formatted so any LLM can understand and cite the sources.
 */
export const searchWeb = async (query, limit = 5) => {
  try {
    const response = await tvly.search(query.trim(), {
      max_results: limit,
      include_answer: true,       // Tavily's AI summary at the top
      search_depth: "advanced",   // deeper, more accurate
      include_raw_content: false, // keep payload small
      include_images: false,
    });

    const lines = [];

    // Tavily's own synthesized answer (very helpful)
    if (response.answer) {
      lines.push(`SUMMARY: ${response.answer}`);
      lines.push("");
    }

    // Individual sources
    if (response.results?.length) {
      response.results.forEach((r, i) => {
        lines.push(`[${i + 1}] ${r.title}`);
        lines.push(`    URL: ${r.url}`);
        if (r.published_date) lines.push(`    Date: ${r.published_date}`);
        lines.push(`    ${r.content}`);
        lines.push("");
      });
    }

    return lines.length > 0
      ? lines.join("\n")
      : "No relevant results found for this query.";

  } catch (error) {
    console.error("Tavily search error:", error.message);
    return "Web search temporarily unavailable.";
  }
};