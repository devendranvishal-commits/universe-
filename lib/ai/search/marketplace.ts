import { SupabaseClient } from "@supabase/supabase-js";
import {
  SearchFilters,
  SearchModuleResult,
  SearchResult,
} from "../types";

export async function searchMarketplace(
  supabase: SupabaseClient,
  filters: SearchFilters
): Promise<SearchModuleResult> {
  try {
    let query = supabase
      .from("marketplace_items")
      .select(`
        id,
        title,
        description,
        category,
        price,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      })
      .limit(filters.limit);

    if (filters.maxPrice !== null) {
      query = query.lte("price", filters.maxPrice);
    }

    if (filters.minPrice !== null) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters.category) {
      query = query.ilike(
        "category",
        `%${filters.category}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return {
        module: "marketplace",
        results: [],
        warning: error.message,
      };
    }

    let results: SearchResult[] = (data || []).map(
      (item) => ({
        id: item.id,
        type: "marketplace",
        title: item.title,
        subtitle: [
          item.category,
          item.price != null
            ? `$${item.price}`
            : null,
        ]
          .filter(Boolean)
          .join(" • "),
        description: item.description ?? "",
        href: `/marketplace/${item.id}`,
        price: item.price,
        date: item.created_at,
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
      module: "marketplace",
      results,
      warning: null,
    };
  } catch (error) {
    return {
      module: "marketplace",
      results: [],
      warning:
        error instanceof Error
          ? error.message
          : "Unknown marketplace search error.",
    };
  }
}