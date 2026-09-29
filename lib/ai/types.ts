export type SearchResultType =
  | "housing"
  | "gig"
  | "marketplace"
  | "event"
  | "community"
  | "profile";

export type SearchModule =
  | "housing"
  | "gigs"
  | "marketplace"
  | "events"
  | "communities"
  | "profiles";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  price: number | null;
  date: string | null;
}

export interface SearchFilters {
  modules: SearchModule[];
  keywords: string[];
  location: string | null;
  category: string | null;
  major: string | null;
  university: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  limit: number;
}

export interface SearchIntent {
  originalQuery: string;
  filters: Omit<SearchFilters, "limit">;
}

export interface SearchModuleResult {
  module: SearchModule;
  results: SearchResult[];
  warning: string | null;
}

export interface RankedSearchResponse {
  results: SearchResult[];
  warnings: string[];
}

export interface AISearchResponse {
  query: string;
  intent: SearchIntent;
  results: SearchResult[];
  warnings: string[];
}

export interface DatabaseWarning {
  module: SearchModule;
  message: string;
}

export const DEFAULT_SEARCH_LIMIT = 10;

export const MAX_SEARCH_RESULTS = 30;

export const ALL_SEARCH_MODULES: SearchModule[] = [
  "housing",
  "gigs",
  "marketplace",
  "events",
  "communities",
  "profiles",
];