import { SupabaseClient } from "@supabase/supabase-js";
import {
  SearchFilters,
  SearchModuleResult,
  SearchResult,
} from "../types";

export async function searchHousing(
  supabase: SupabaseClient,
  filters: SearchFilters
): Promise<SearchModuleResult> {
  try {
    let query = supabase
      .from("housing_listings")
      .select(`
        id,
        title,
        description,
        rent,
        location,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      })
      .limit(filters.limit);

    if (filters.maxPrice !== null) {
      query = query.lte("rent", filters.maxPrice);
    }

    if (filters.minPrice !== null) {
      query = query.gte("rent", filters.minPrice);
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
        module: "housing",
        results: [],
        warning: error.message,
      };
    }

    let results: SearchResult[] = (data || []).map(
      (listing) => ({
        id: listing.id,
        type: "housing",
        title: listing.title,
        subtitle: [
          listing.location,
          listing.rent != null
            ? `$${listing.rent}/month`
            : null,
        ]
          .filter(Boolean)
          .join(" • "),
        description:
          listing.description ?? "",
        href: `/housing/${listing.id}`,
        price: listing.rent,
        date: listing.created_at,
      })
    );

    if (filters.keywords.length > 0) {
      const keywords = filters.keywords.map((k) =>
        k.toLowerCase()
      );

      results = results.filter((item) => {
        const text = [
          item.title,
          item.subtitle,
          item.description,
        ]
          .join(" ")
          .toLowerCase();

        return keywords.some((keyword) =>
          text.includes(keyword)
        );
      });
    }

    return {
      module: "housing",
      results,
      warning: null,
    };
  } catch (error) {
    return {
      module: "housing",
      results: [],
      warning:
        error instanceof Error
          ? error.message
          : "Unknown housing search error.",
    };
  }
}