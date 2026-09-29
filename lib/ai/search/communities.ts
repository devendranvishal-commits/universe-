import { SupabaseClient } from "@supabase/supabase-js";
import {
  SearchFilters,
  SearchModuleResult,
  SearchResult,
} from "../types";

export async function searchCommunities(
  supabase: SupabaseClient,
  filters: SearchFilters
): Promise<SearchModuleResult> {
  try {
    let query = supabase
      .from("communities")
      .select(`
        id,
        name,
        description,
        category,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      })
      .limit(filters.limit);

    if (filters.category) {
      query = query.ilike(
        "category",
        `%${filters.category}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return {
        module: "communities",
        results: [],
        warning: error.message,
      };
    }

    let results: SearchResult[] = (data || []).map(
      (community) => ({
        id: community.id,
        type: "community",
        title: community.name,
        subtitle: community.category || "Community",
        description: community.description ?? "",
        href: `/communities/${community.id}`,
        price: null,
        date: community.created_at,
      })
    );

    if (filters.keywords.length > 0) {
      const keywords = filters.keywords.map((k) =>
        k.toLowerCase()
      );

      results = results.filter((community) => {
        const text = [
          community.title,
          community.subtitle,
          community.description,
        ]
          .join(" ")
          .toLowerCase();

        return keywords.some((keyword) =>
          text.includes(keyword)
        );
      });
    }

    return {
      module: "communities",
      results,
      warning: null,
    };
  } catch (error) {
    return {
      module: "communities",
      results: [],
      warning:
        error instanceof Error
          ? error.message
          : "Unknown communities search error.",
    };
  }
}