import { SupabaseClient } from "@supabase/supabase-js";
import {
  SearchFilters,
  SearchModuleResult,
  SearchResult,
} from "../types";

export async function searchEvents(
  supabase: SupabaseClient,
  filters: SearchFilters
): Promise<SearchModuleResult> {
  try {
    let query = supabase
      .from("events")
      .select(`
        id,
        title,
        description,
        location,
        event_date,
        created_at
      `)
      .order("event_date", {
        ascending: true,
      })
      .limit(filters.limit);

    if (filters.location) {
      query = query.ilike(
        "location",
        `%${filters.location}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return {
        module: "events",
        results: [],
        warning: error.message,
      };
    }

    let results: SearchResult[] = (data || []).map(
      (event) => ({
        id: event.id,
        type: "event",
        title: event.title,
        subtitle: [
          event.location,
          event.event_date,
        ]
          .filter(Boolean)
          .join(" • "),
        description: event.description ?? "",
        href: `/events/${event.id}`,
        price: null,
        date: event.event_date ?? event.created_at,
      })
    );

    if (filters.keywords.length > 0) {
      const keywords = filters.keywords.map((k) =>
        k.toLowerCase()
      );

      results = results.filter((event) => {
        const text = [
          event.title,
          event.subtitle,
          event.description,
        ]
          .join(" ")
          .toLowerCase();

        return keywords.some((keyword) =>
          text.includes(keyword)
        );
      });
    }

    return {
      module: "events",
      results,
      warning: null,
    };
  } catch (error) {
    return {
      module: "events",
      results: [],
      warning:
        error instanceof Error
          ? error.message
          : "Unknown events search error.",
    };
  }
}