import { SupabaseClient } from "@supabase/supabase-js";
import {
  SearchFilters,
  SearchModuleResult,
  SearchResult,
} from "../types";

export async function searchProfiles(
  supabase: SupabaseClient,
  filters: SearchFilters
): Promise<SearchModuleResult> {
  try {
    let query = supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        university,
        major,
        country,
        bio
      `)
      .limit(filters.limit);

    if (filters.major) {
      query = query.ilike(
        "major",
        `%${filters.major}%`
      );
    }

    if (filters.university) {
      query = query.ilike(
        "university",
        `%${filters.university}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return {
        module: "profiles",
        results: [],
        warning: error.message,
      };
    }

    let results: SearchResult[] = (data || []).map(
      (profile) => ({
        id: profile.id,
        type: "profile",
        title:
          profile.full_name?.trim() ||
          "Universe student",
        subtitle:
          [profile.major, profile.university]
            .filter(Boolean)
            .join(" • ") || "Student profile",
        description:
          profile.bio?.trim() ||
          [profile.country, profile.university]
            .filter(Boolean)
            .join(" • "),
        href: `/users/${profile.id}`,
        price: null,
        date: null,
      })
    );

    if (filters.keywords.length > 0) {
      const keywords = filters.keywords.map(
        (keyword) => keyword.toLowerCase()
      );

      results = results.filter((profile) => {
        const searchableText = [
          profile.title,
          profile.subtitle,
          profile.description,
        ]
          .join(" ")
          .toLowerCase();

        return keywords.some((keyword) =>
          searchableText.includes(keyword)
        );
      });
    }

    return {
      module: "profiles",
      results,
      warning: null,
    };
  } catch (error) {
    return {
      module: "profiles",
      results: [],
      warning:
        error instanceof Error
          ? error.message
          : "Unknown profiles search error.",
    };
  }
}