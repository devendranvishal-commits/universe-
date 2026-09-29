"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  Bell,
  Search,
} from "lucide-react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchText, setSearchText] =
    useState("");

  useEffect(() => {
    if (pathname === "/search") {
      setSearchText(
        searchParams.get("q") || ""
      );
    }
  }, [pathname, searchParams]);

  function submitSearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanSearch =
      searchText.trim();

    if (!cleanSearch) {
      router.push("/search");
      return;
    }

    router.push(
      `/search?q=${encodeURIComponent(
        cleanSearch
      )}`
    );
  }

  function openNotifications() {
    router.push("/notifications");
  }

  return (
    <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <h1 className="text-3xl font-black text-white">
          Welcome back 👋
        </h1>

        <p className="mt-1 text-gray-400">
          Everything happening on your campus today.
        </p>
      </div>

      <div className="flex w-full items-center gap-3 xl:w-auto">
        <form
          onSubmit={submitSearch}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-purple-400/40 xl:w-80 xl:flex-none"
        >
          <Search
            size={18}
            className="shrink-0 text-gray-400"
          />

          <input
            value={searchText}
            onChange={(event) =>
              setSearchText(
                event.target.value
              )
            }
            placeholder="Search Universe..."
            aria-label="Search Universe"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />

          {searchText.trim() && (
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-white px-3 py-1.5 text-xs font-black text-black transition hover:bg-gray-200"
            >
              Search
            </button>
          )}
        </form>

        <button
          type="button"
          onClick={openNotifications}
          aria-label="Open notifications"
          className="shrink-0 rounded-2xl border border-white/10 bg-white/5 p-3 text-white transition hover:bg-white/10"
        >
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}