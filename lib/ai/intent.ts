import OpenAI from "openai";
import {
  ALL_SEARCH_MODULES,
  DEFAULT_SEARCH_LIMIT,
  SearchIntent,
} from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function detectSearchIntent(
  query: string
): Promise<SearchIntent> {
  const response = await openai.responses.create({
    model: "gpt-5-mini",

    instructions: `
You convert natural language into structured search filters.

Return ONLY valid JSON.

Rules:

- Detect which Universe modules should be searched.
- Detect budgets.
- Detect locations.
- Detect keywords.
- Detect categories.
- Detect university.
- Detect major.
- Never invent values.

If uncertain, search every module.

`.trim(),

    input: `
Student Request:

${query}
`,

    text: {
      format: {
        type: "json_schema",
        name: "search_intent",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            modules: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "profiles",
                  "communities",
                  "housing",
                  "gigs",
                  "marketplace",
                  "events",
                ],
              },
            },

            keywords: {
              type: "array",
              items: {
                type: "string",
              },
            },

            location: {
              type: ["string", "null"],
            },

            category: {
              type: ["string", "null"],
            },

            major: {
              type: ["string", "null"],
            },

            university: {
              type: ["string", "null"],
            },

            minPrice: {
              type: ["number", "null"],
            },

            maxPrice: {
              type: ["number", "null"],
            },
          },

          required: [
            "modules",
            "keywords",
            "location",
            "category",
            "major",
            "university",
            "minPrice",
            "maxPrice",
          ],
        },
      },
    },

    store: false,
  });

  const parsed = JSON.parse(
    response.output_text || "{}"
  );

  return {
    originalQuery: query,

    filters: {
      modules:
        parsed.modules?.length > 0
          ? parsed.modules
          : ALL_SEARCH_MODULES,

      keywords: parsed.keywords || [],

      location: parsed.location,

      category: parsed.category,

      major: parsed.major,

      university: parsed.university,

      minPrice: parsed.minPrice,

      maxPrice: parsed.maxPrice,

      startDate: null,

      endDate: null,

      limit: DEFAULT_SEARCH_LIMIT,
    },
  };
}