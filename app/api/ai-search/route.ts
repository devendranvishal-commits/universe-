import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import { createClient } from "@/lib/server";
import { runAISearch } from "@/lib/ai/orchestrator";
import { buildSearchPrompt } from "@/lib/ai/prompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const query =
      typeof body.query === "string"
        ? body.query.trim()
        : "";

    if (!query) {
      return NextResponse.json(
        {
          error: "Query is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const supabase = await createClient();

    const searchResponse = await runAISearch(
      supabase,
      query
    );

    let answer =
      "I could not find any relevant results for that search.";

    if (searchResponse.results.length > 0) {
      const prompt = buildSearchPrompt(
        query,
        searchResponse.results
      );

      const response = await openai.responses.create({
        model: "gpt-5-mini",
        input: prompt,
      });

      answer =
        response.output_text?.trim() ||
        "I found some results, but I could not generate a summary.";
    }

    return NextResponse.json({
      answer,
      query: searchResponse.query,
      intent: searchResponse.intent,
      results: searchResponse.results,
      warnings: searchResponse.warnings,
    });
  } catch (error) {
    console.error("AI search error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AI search failed.",
      },
      {
        status: 500,
      }
    );
  }
}