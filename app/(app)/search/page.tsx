"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Home,
  LoaderCircle,
  Search,
  ShoppingBag,
  User,
  Users,
} from "lucide-react";

type ProfileResult = {
  id: string;
  full_name: string | null;
  university: string | null;
  major: string | null;
  country: string | null;
  avatar_url: string | null;
};

type CommunityResult = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
};

type MarketplaceResult = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  price: number | null;
  image_url: string | null;
};

type HousingResult = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  price: number | null;
  image_url: string | null;
};

type GigResult = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  budget: number | null;
  location?: string | null;
  deadline?: string | null;
};

type EventResult = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string | null;
};

type SearchResults = {
  profiles: ProfileResult[];
  communities: CommunityResult[];
  marketplace: MarketplaceResult[];
  housing: HousingResult[];
  gigs: GigResult[];
  events: EventResult[];
  errors?: string[];
  error?: string;
};

const emptyResults: SearchResults = {
  profiles: [],
  communities: [],
  marketplace: [],
  housing: [],
  gigs: [],
  events: [],
};

export default function SearchPage() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [results, setResults] =
    useState<SearchResults>(emptyResults);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    setQuery(urlQuery);
  }, [searchParams]);

  useEffect(() => {
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      setResults(emptyResults);
      setErrorMessage("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(cleanQuery)}`,
          {
            method: "GET",
            signal: controller.signal,
          }
        );

        const data = (await response.json()) as SearchResults;

        if (!response.ok) {
          throw new Error(
            data.error || "Search could not be completed."
          );
        }

        setResults({
          profiles: data.profiles || [],
          communities: data.communities || [],
          marketplace: data.marketplace || [],
          housing: data.housing || [],
          gigs: data.gigs || [],
          events: data.events || [],
          errors: data.errors || [],
        });

        if (data.errors && data.errors.length > 0) {
          setErrorMessage(
            `Some sections could not be searched: ${data.errors.join(
              ", "
            )}`
          );
        }
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setResults(emptyResults);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Search failed."
        );
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const totalResults = useMemo(
    () =>
      results.profiles.length +
      results.communities.length +
      results.marketplace.length +
      results.housing.length +
      results.gigs.length +
      results.events.length,
    [results]
  );

  const hasQuery = query.trim().length > 0;

  function clearSearch() {
    setQuery("");

    window.history.replaceState(
      null,
      "",
      "/search"
    );
  }

  return (
    <main className="min-w-0 space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#10142b] via-[#131433] to-[#271257] p-7 md:p-9">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-purple-500/20" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-sm font-bold text-purple-300">
            <Search size={17} />
            Universal search
          </div>

          <h1 className="mt-3 text-3xl font-black md:text-4xl">
            Search the entire Universe.
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-gray-300">
            Find students, communities, marketplace items,
            housing, gigs, and events from one place.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#101520] p-5 shadow-2xl shadow-black/20 md:p-7">
        <label className="block">
          <span className="sr-only">
            Search Universe
          </span>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-5 transition focus-within:border-purple-400/50">
            {loading ? (
              <LoaderCircle
                size={20}
                className="shrink-0 animate-spin text-purple-300"
              />
            ) : (
              <Search
                size={20}
                className="shrink-0 text-gray-500"
              />
            )}

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search students, communities, bikes, apartments, gigs..."
              autoFocus
              className="min-w-0 flex-1 bg-transparent py-5 text-lg outline-none placeholder:text-gray-600"
            />
          </div>
        </label>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-gray-500">
            {hasQuery
              ? loading
                ? "Searching..."
                : `${totalResults} result${
                    totalResults === 1 ? "" : "s"
                  } found`
              : "Start typing to search."}
          </p>

          {hasQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="rounded-xl bg-white/5 px-4 py-2 font-bold text-gray-300 transition hover:bg-white/10"
            >
              Clear search
            </button>
          )}
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 font-semibold text-red-200">
          {errorMessage}
        </div>
      )}

      {!hasQuery ? (
        <SearchEmptyState />
      ) : !loading && totalResults === 0 ? (
        <NoResults query={query.trim()} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <ResultSection
            title="Students"
            description="People across Universe"
            icon={<User size={21} />}
            count={results.profiles.length}
          >
            {results.profiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/users/${profile.id}`}
                className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-purple-400/30 hover:bg-white/[0.06]"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-lg font-black text-white">
                    {profile.full_name
                      ?.trim()
                      .charAt(0)
                      .toUpperCase() || "S"}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-black">
                      {profile.full_name?.trim() ||
                        "Student"}
                    </h3>

                    <p className="mt-1 truncate text-sm text-gray-400">
                      {[
                        profile.major,
                        profile.university,
                      ]
                        .filter(Boolean)
                        .join(" • ") || "Student profile"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </ResultSection>

          <ResultSection
            title="Communities"
            description="Clubs and student groups"
            icon={<Users size={21} />}
            count={results.communities.length}
          >
            {results.communities.map((community) => (
              <ResultLink
                key={community.id}
                href={`/communities/${community.id}`}
                title={community.name}
                subtitle={
                  community.category || "Community"
                }
                description={community.description}
              />
            ))}
          </ResultSection>

          <ResultSection
            title="Marketplace"
            description="Items students are selling"
            icon={<ShoppingBag size={21} />}
            count={results.marketplace.length}
          >
            {results.marketplace.map((item) => (
              <ResultLink
                key={item.id}
                href={`/marketplace/${item.id}`}
                title={item.title}
                subtitle={
                  item.price != null
                    ? `$${item.price}`
                    : item.category || "Marketplace"
                }
                description={item.description}
              />
            ))}
          </ResultSection>

          <ResultSection
            title="Housing"
            description="Rooms, apartments, and subleases"
            icon={<Home size={21} />}
            count={results.housing.length}
          >
            {results.housing.map((item) => (
              <ResultLink
                key={item.id}
                href={`/housing/${item.id}`}
                title={item.title}
                subtitle={
                  [
                    item.location,
                    item.price != null
                      ? `$${item.price}`
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" • ") || "Housing"
                }
                description={item.description}
              />
            ))}
          </ResultSection>

          <ResultSection
            title="Student Gigs"
            description="Jobs and campus opportunities"
            icon={<BriefcaseBusiness size={21} />}
            count={results.gigs.length}
          >
            {results.gigs.map((gig) => (
              <ResultLink
                key={gig.id}
                href={`/gigs/${gig.id}`}
                title={gig.title}
                subtitle={
                  [
                    gig.budget != null
                      ? `$${gig.budget}`
                      : "",
                    gig.location || "",
                  ]
                    .filter(Boolean)
                    .join(" • ") ||
                  gig.category ||
                  "Student gig"
                }
                description={gig.description}
              />
            ))}
          </ResultSection>

          <ResultSection
            title="Events"
            description="Things happening on campus"
            icon={<CalendarDays size={21} />}
            count={results.events.length}
          >
            {results.events.map((event) => (
              <ResultLink
                key={event.id}
                href={`/events/${event.id}`}
                title={event.title}
                subtitle={
                  [
                    event.location,
                    formatEventDate(event.event_date),
                  ]
                    .filter(Boolean)
                    .join(" • ") || "Campus event"
                }
                description={event.description}
              />
            ))}
          </ResultSection>
        </div>
      )}
    </main>
  );
}

type ResultSectionProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
};

function ResultSection({
  title,
  description,
  icon,
  count,
  children,
}: ResultSectionProps) {
  if (count === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#101520] shadow-2xl shadow-black/20">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 md:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
            {icon}
          </div>

          <div>
            <h2 className="text-xl font-black">
              {title}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-black text-gray-300">
          {count}
        </span>
      </div>

      <div className="space-y-3 p-5 md:p-6">
        {children}
      </div>
    </section>
  );
}

type ResultLinkProps = {
  href: string;
  title: string;
  subtitle: string;
  description: string | null;
};

function ResultLink({
  href,
  title,
  subtitle,
  description,
}: ResultLinkProps) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-purple-400/30 hover:bg-white/[0.06]"
    >
      <h3 className="font-black">
        {title}
      </h3>

      <p className="mt-1 text-sm font-semibold text-purple-300">
        {subtitle}
      </p>

      {description && (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-400">
          {description}
        </p>
      )}
    </Link>
  );
}

function SearchEmptyState() {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#101520] p-10 text-center shadow-2xl shadow-black/20">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
        <Search size={30} />
      </div>

      <h2 className="mt-5 text-2xl font-black">
        Search everything
      </h2>

      <p className="mx-auto mt-2 max-w-lg leading-7 text-gray-400">
        Search by student name, university, community,
        marketplace item, apartment location, gig, or
        event.
      </p>
    </section>
  );
}

function NoResults({
  query,
}: {
  query: string;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#101520] p-10 text-center shadow-2xl shadow-black/20">
      <Building2
        size={36}
        className="mx-auto text-gray-600"
      />

      <h2 className="mt-5 text-2xl font-black">
        No results for “{query}”
      </h2>

      <p className="mt-2 text-gray-400">
        Try another name, category, location, or
        keyword.
      </p>
    </section>
  );
}

function formatEventDate(
  value: string | null
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}