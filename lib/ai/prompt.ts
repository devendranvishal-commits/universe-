import { SearchResult } from "./types";

export function buildSearchPrompt(
  query: string,
  results: SearchResult[]
) {
  const formattedResults = results
    .map((result, index) => {
      return `
Result ${index + 1}
Type: ${result.type}
Title: ${result.title}
Subtitle: ${result.subtitle}
Description: ${result.description}
URL: ${result.href}
Price: ${result.price ?? "N/A"}
Date: ${result.date ?? "N/A"}
`;
    })
    .join("\n");

  return `
You are Universe AI, an assistant for college students.

The student asked:

"${query}"

Here are the search results:

${formattedResults}

Instructions:

- Answer naturally.
- Recommend the most relevant results first.
- Mention prices when available.
- Mention dates for events.
- Do not invent information.
- If nothing relevant was found, clearly say so.
- Keep the response concise and helpful.
`;
}