import { SupabaseClient } from "@supabase/supabase-js";
import {
  SearchFilters,
  SearchModuleResult,
  SearchResult,
} from "../types";

export async function searchGigs(
  supabase: SupabaseClient,
  filters: SearchFilters
): Promise<SearchModuleResult> {
  try {
    let query = supabase
      .from("student_gigs")
      .select(`
        id,
        title,
        description,
        pay,
        location,
        deadline,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      })
      .limit(filters.limit);

    if (filters.maxPrice !== null) {
      query = query.lte("pay", filters.maxPrice);
    }

    if (filters.minPrice !== null) {
      query = query.gte("pay", filters.minPrice);
    }

    if (filters.location) {
      query = query.ilike(
        "location",
        `%${filters.location}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return {
        module: "gigs",
        results: [],
        warning: error.message,
      };
    }

    let results: SearchResult[] = (data || []).map(
      (gig) => ({
        id: gig.id,
        type: "gig",
        title: gig.title,
        subtitle: [
          gig.location,
          gig.pay != null
            ? `$${gig.pay}`
            : null,
        ]
          .filter(Boolean)
          .join(" • "),
        description: gig.description ?? "",
        href: `/gigs/${gig.id}`,
        price: gig.pay,
        date: gig.deadline ?? gig.created_at,
      })
    );

    if (filters.keywords.length > 0) {
      const keywords = filters.keywords.map(
        (keyword) => keyword.toLowerCase()
      );

      results = results.filter((item) => {
        const searchableText = [
          item.title,
          item.subtitle,
          item.description,
        ]
          .join(" ")
          .toLowerCase();

        return keywords.some((keyword) =>
          searchableText.includes(keyword)
        );
      });
    }

    return {
      module: "gigs",
      results,
      warning: null,
    };
  } catch (error) {
    return {
      module: "gigs",
      results: [],
      warning:
        error instanceof Error
          ? error.message
          : "Unknown student gigs search error.",
    };
  }
}