"use client";

import { useEffect, useState } from "react";
import { Check, LogOut, Users, Crown } from "lucide-react";
import { createClient } from "../../../../../lib/client";

type Props = {
  communityId: string;
};

type Community = {
  id: string;
  name: string;
  category: string;
  description: string;
  created_by: string;
};

export default function CommunityHeader({
  communityId,
}: Props) {
  const [community, setCommunity] =
    useState<Community | null>(null);

  const [userId, setUserId] = useState("");

  const [memberCount, setMemberCount] = useState(0);

  const [joined, setJoined] = useState(false);

  const [loading, setLoading] = useState(true);

  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadCommunity();
  }, [communityId]);

  async function loadCommunity() {
    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUserId(user.id);
    }

    const { data: communityData, error } = await supabase
      .from("communities")
      .select(`
        id,
        name,
        category,
        description,
        created_by
      `)
      .eq("id", communityId)
      .single();

    if (error) {
      console.error(error.message);
      setLoading(false);
      return;
    }

    setCommunity(communityData);

    const { count } = await supabase
      .from("community_members")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("community_id", communityId);

    setMemberCount(count || 0);

    if (user) {
      const { data } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("community_id", communityId)
        .eq("user_id", user.id)
        .maybeSingle();

      setJoined(!!data);
    }

    setLoading(false);
  }

  async function joinCommunity() {
    if (!userId) {
      alert("Please log in.");
      return;
    }

    setUpdating(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("community_members")
      .insert({
        community_id: communityId,
        user_id: userId,
      });

    setUpdating(false);

    if (error) {
      if (error.code !== "23505") {
        alert(error.message);
      }

      return;
    }

    setJoined(true);
    setMemberCount((current) => current + 1);
  }

  async function leaveCommunity() {
    if (!userId) return;

    const confirmed = confirm(
      "Leave this community?"
    );

    if (!confirmed) return;

    setUpdating(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("community_members")
      .delete()
      .eq("community_id", communityId)
      .eq("user_id", userId);

    setUpdating(false);

    if (error) {
      alert(error.message);
      return;
    }

    setJoined(false);

    setMemberCount((current) =>
      Math.max(current - 1, 0)
    );
  }

  if (loading || !community) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <p className="text-gray-400">
          Loading community...
        </p>
      </section>
    );
  }

  const isCreator =
    userId === community.created_by;

  return (
    <section className="rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-10 shadow-2xl">
      <p className="uppercase tracking-[0.35em] text-purple-200">
        {community.category}
      </p>

      <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-5xl font-black">
              {community.name}
            </h1>

            {isCreator && (
              <span className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-black">
                <Crown size={16} />
                Creator
              </span>
            )}
          </div>

          <p className="mt-5 max-w-3xl text-lg text-purple-100">
            {community.description}
          </p>

          <div className="mt-6 flex items-center gap-3 text-purple-100">
            <Users size={20} />

            <span className="font-semibold">
              {memberCount} Members
            </span>
          </div>
        </div>

        <div>
          {joined ? (
            <button
              onClick={leaveCommunity}
              disabled={updating}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-7 py-4 font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              <LogOut size={18} />

              {updating
                ? "Leaving..."
                : "Leave Community"}
            </button>
          ) : (
            <button
              onClick={joinCommunity}
              disabled={updating}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 font-bold text-black transition hover:bg-gray-200 disabled:opacity-50"
            >
              <Check size={18} />

              {updating
                ? "Joining..."
                : "Join Community"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}