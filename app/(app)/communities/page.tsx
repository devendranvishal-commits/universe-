"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  LogOut,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { createClient } from "../../../lib/client";

type Community = {
  id: string;
  name: string;
  category: string;
  description: string;
  created_by: string;
  created_at: string;
};

type CommunityMember = {
  community_id: string;
};

type MemberCountRow = {
  community_id: string;
};

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<string[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [currentUserId, setCurrentUserId] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingCommunityId, setUpdatingCommunityId] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setMessage(userError.message);
      setLoading(false);
      return;
    }

    setCurrentUserId(user?.id || "");

    const { data: communitiesData, error: communitiesError } = await supabase
      .from("communities")
      .select(`
        id,
        name,
        category,
        description,
        created_by,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (communitiesError) {
      setMessage(communitiesError.message);
      setCommunities([]);
      setLoading(false);
      return;
    }

    const loadedCommunities =
      (communitiesData as Community[] | null) || [];

    setCommunities(loadedCommunities);

    const { data: allMemberships, error: membershipCountError } =
      await supabase
        .from("community_members")
        .select("community_id");

    if (membershipCountError) {
      console.error(
        "Could not load community member counts:",
        membershipCountError.message
      );
    } else {
      const countMap: Record<string, number> = {};

      ((allMemberships as MemberCountRow[] | null) || []).forEach(
        (membership) => {
          countMap[membership.community_id] =
            (countMap[membership.community_id] || 0) + 1;
        }
      );

      setMemberCounts(countMap);
    }

    if (user) {
      const { data: memberships, error: membershipsError } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", user.id);

      if (membershipsError) {
        setMessage(membershipsError.message);
      } else {
        setJoinedCommunityIds(
          ((memberships as CommunityMember[] | null) || []).map(
            (membership) => membership.community_id
          )
        );
      }
    } else {
      setJoinedCommunityIds([]);
    }

    setLoading(false);
  }

  async function createCommunity() {
    const cleanName = name.trim();
    const cleanCategory = category.trim();
    const cleanDescription = description.trim();

    if (!cleanName || !cleanCategory || !cleanDescription) {
      setMessage("Please fill in all fields.");
      return;
    }

    setCreating(true);
    setMessage("");

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage(userError?.message || "You must be logged in.");
      setCreating(false);
      return;
    }

    const { data: createdCommunity, error: createError } = await supabase
      .from("communities")
      .insert({
        name: cleanName,
        category: cleanCategory,
        description: cleanDescription,
        created_by: user.id,
      })
      .select(`
        id,
        name,
        category,
        description,
        created_by,
        created_at
      `)
      .single();

    if (createError) {
      setMessage(createError.message);
      setCreating(false);
      return;
    }

    const { error: membershipError } = await supabase
      .from("community_members")
      .insert({
        community_id: createdCommunity.id,
        user_id: user.id,
      });

    if (
      membershipError &&
      membershipError.code !== "23505"
    ) {
      setMessage(
        `Community created, but membership failed: ${membershipError.message}`
      );
      setCreating(false);
      await loadPageData();
      return;
    }

    setName("");
    setCategory("");
    setDescription("");
    setMessage("Community created successfully!");

    setCreating(false);
    await loadPageData();
  }

  async function joinCommunity(communityId: string) {
    setUpdatingCommunityId(communityId);
    setMessage("");

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage(userError?.message || "You must be logged in.");
      setUpdatingCommunityId("");
      return;
    }

    const { error } = await supabase
      .from("community_members")
      .insert({
        community_id: communityId,
        user_id: user.id,
      });

    if (error) {
      if (error.code === "23505") {
        setMessage("You already joined this community.");
      } else {
        setMessage(error.message);
      }

      setUpdatingCommunityId("");
      return;
    }

    setJoinedCommunityIds((current) => [
      ...current,
      communityId,
    ]);

    setMemberCounts((current) => ({
      ...current,
      [communityId]: (current[communityId] || 0) + 1,
    }));

    setMessage("You joined the community!");
    setUpdatingCommunityId("");
  }

  async function leaveCommunity(communityId: string) {
    if (!currentUserId) {
      setMessage("You must be logged in.");
      return;
    }

    const confirmed = confirm(
      "Are you sure you want to leave this community?"
    );

    if (!confirmed) return;

    setUpdatingCommunityId(communityId);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("community_members")
      .delete()
      .eq("community_id", communityId)
      .eq("user_id", currentUserId);

    if (error) {
      setMessage(error.message);
      setUpdatingCommunityId("");
      return;
    }

    setJoinedCommunityIds((current) =>
      current.filter((id) => id !== communityId)
    );

    setMemberCounts((current) => ({
      ...current,
      [communityId]: Math.max(
        0,
        (current[communityId] || 0) - 1
      ),
    }));

    setMessage("You left the community.");
    setUpdatingCommunityId("");
  }

  const filteredCommunities = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return communities;
    }

    return communities.filter((community) => {
      return (
        community.name.toLowerCase().includes(query) ||
        community.category.toLowerCase().includes(query) ||
        community.description.toLowerCase().includes(query)
      );
    });
  }, [communities, searchText]);

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-purple-700/30 to-blue-700/20 p-10">
        <p className="text-sm uppercase tracking-[0.3em] text-purple-300">
          Communities
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Discover your campus.
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-gray-300">
          Join clubs, meet students, share ideas, and build meaningful
          connections.
        </p>
      </section>

      {message && (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold text-purple-200">
          {message}
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-3xl font-black">
          Create a Community
        </h2>

        <p className="mt-2 text-gray-400">
          Start a space for students who share your interests.
        </p>

        <div className="mt-6 grid gap-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Community name"
            className="rounded-2xl bg-black/30 px-5 py-4 outline-none"
          />

          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Category"
            className="rounded-2xl bg-black/30 px-5 py-4 outline-none"
          />

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe your community"
            className="min-h-32 rounded-2xl bg-black/30 px-5 py-4 outline-none"
          />

          <button
            onClick={createCommunity}
            disabled={creating}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-black transition hover:bg-gray-200 disabled:opacity-50"
          >
            <Plus size={18} />
            {creating ? "Creating..." : "Create Community"}
          </button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-black">
              All Communities
            </h2>

            <p className="mt-2 text-gray-400">
              Find communities by name, category, or description.
            </p>
          </div>

          <div className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 md:max-w-md">
            <Search size={20} className="text-gray-400" />

            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search communities..."
              className="w-full bg-transparent py-4 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <p className="py-10 text-center text-gray-400">
            Loading communities...
          </p>
        ) : filteredCommunities.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <Users className="mx-auto mb-4 text-gray-400" size={48} />

            <h2 className="text-2xl font-bold">
              No communities found
            </h2>

            <p className="mt-2 text-gray-400">
              Try another search or create a new community.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredCommunities.map((community) => {
              const joined = joinedCommunityIds.includes(
                community.id
              );

              const isUpdating =
                updatingCommunityId === community.id;

              const isCreator =
                currentUserId === community.created_by;

              return (
                <article
                  key={community.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
                >
                  <Link
                    href={`/communities/${community.id}`}
                    className="block"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-300">
                          {community.category}
                        </p>

                        <h3 className="mt-3 text-2xl font-black">
                          {community.name}
                        </h3>
                      </div>

                      {isCreator && (
                        <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-200">
                          Creator
                        </span>
                      )}
                    </div>

                    <p className="mt-4 text-gray-400">
                      {community.description}
                    </p>

                    <div className="mt-5 flex items-center gap-2 text-sm text-gray-400">
                      <Users size={17} />

                      <span>
                        {memberCounts[community.id] || 0} member
                        {(memberCounts[community.id] || 0) === 1
                          ? ""
                          : "s"}
                      </span>
                    </div>
                  </Link>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/communities/${community.id}`}
                      className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-bold text-white transition hover:bg-white/10"
                    >
                      Open
                    </Link>

                    {joined ? (
                      <button
                        onClick={() =>
                          leaveCommunity(community.id)
                        }
                        disabled={isUpdating}
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-500/15 px-6 py-3 font-bold text-red-300 transition hover:bg-red-500/25 disabled:opacity-50"
                      >
                        <LogOut size={18} />

                        {isUpdating
                          ? "Leaving..."
                          : "Leave"}
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          joinCommunity(community.id)
                        }
                        disabled={isUpdating}
                        className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold text-black transition hover:bg-gray-200 disabled:opacity-50"
                      >
                        {isUpdating ? (
                          "Joining..."
                        ) : (
                          <>
                            <Check size={18} />
                            Join Community
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}