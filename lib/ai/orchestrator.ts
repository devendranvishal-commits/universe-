import { SupabaseClient } from "@supabase/supabase-js";

import { detectSearchIntent } from "./intent";
import { rankResults } from "./ranking";
import {
  AISearchResponse,
  DEFAULT_SEARCH_LIMIT,
  SearchFilters,
} from "./types";

import { searchHousing } from "./search/housing";
import { searchGigs } from "./search/gigs";
import { searchMarketplace } from "./search/marketplace";
import { searchEvents } from "./search/events";
import { searchCommunities } from "./search/communities";
import { searchProfiles } from "./search/profiles";

export async function runAISearch(
  supabase: SupabaseClient,
  query: string
): Promise<AISearchResponse> {
  const intent = await detectSearchIntent(query);

  const filters: SearchFilters = {
    ...intent.filters,
    limit: DEFAULT_SEARCH_LIMIT,
  };

  const searches: Promise<
    Awaited<ReturnType<typeof searchHousing>>
  >[] = [];

  if (filters.modules.includes("housing")) {
    searches.push(searchHousing(supabase, filters));
  }

  if (filters.modules.includes("gigs")) {
    searches.push(searchGigs(supabase, filters));
  }

  if (filters.modules.includes("marketplace")) {
    searches.push(searchMarketplace(supabase, filters));
  }

  if (filters.modules.includes("events")) {
    searches.push(searchEvents(supabase, filters));
  }

  if (filters.modules.includes("communities")) {
    searches.push(searchCommunities(supabase, filters));
  }

  if (filters.modules.includes("profiles")) {
    searches.push(searchProfiles(supabase, filters));
  }

  const moduleResults = await Promise.all(searches);
  const ranked = rankResults(moduleResults);

  return {
    query,
    intent,
    results: ranked.results,
    warnings: ranked.warnings,
  };
}