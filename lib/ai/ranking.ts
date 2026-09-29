import {
  RankedSearchResponse,
  SearchModuleResult,
  SearchResult,
  MAX_SEARCH_RESULTS,
} from "./types";

function calculateScore(result: SearchResult): number {
  let score = 0;

  if (result.title) score += 40;

  if (result.description) {
    score += Math.min(result.description.length / 10, 25);
  }

  if (result.price !== null && result.price !== undefined) {
    score += 10;
  }

  if (result.date) {
    score += 5;
  }

  switch (result.type) {
    case "housing":
      score += 8;
      break;

    case "gig":
      score += 7;
      break;

    case "marketplace":
      score += 6;
      break;

    case "event":
      score += 5;
      break;

    case "community":
      score += 4;
      break;

    case "profile":
      score += 3;
      break;
  }

  return score;
}

export function rankResults(
  modules: SearchModuleResult[]
): RankedSearchResponse {
  const warnings: string[] = [];
  const combined: SearchResult[] = [];

  for (const module of modules) {
    combined.push(...module.results);

    if (module.warning) {
      warnings.push(`${module.module}: ${module.warning}`);
    }
  }

  const ranked = combined
    .map((result) => ({
      result,
      score: calculateScore(result),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SEARCH_RESULTS)
    .map((item) => item.result);

  return {
    results: ranked,
    warnings,
  };
}