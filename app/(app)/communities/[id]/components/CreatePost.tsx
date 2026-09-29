"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { createClient } from "../../../../../lib/client";

type Props = {
  communityId: string;
};

export default function CreatePost({ communityId }: Props) {
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [checkingMembership, setCheckingMembership] = useState(true);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkMembership();
  }, [communityId]);

  async function checkMembership() {
    setCheckingMembership(true);
    setMessage("");

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setMessage(userError.message);
      setCheckingMembership(false);
      return;
    }

    if (!user) {
      setUserId("");
      setIsMember(false);
      setCheckingMembership(false);
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase
      .from("community_members")
      .select("community_id")
      .eq("community_id", communityId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      setMessage(error.message);
      setIsMember(false);
    } else {
      setIsMember(!!data);
    }

    setCheckingMembership(false);
  }

  async function createPost() {
    const cleanContent = content.trim();

    if (!cleanContent) {
      setMessage("Write something before posting.");
      return;
    }

    if (!userId) {
      setMessage("Please log in.");
      return;
    }

    if (!isMember) {
      setMessage("Join this community before posting.");
      return;
    }

    setPosting(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.from("posts").insert({
      community_id: communityId,
      user_id: userId,
      content: cleanContent,
    });

    setPosting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setContent("");
    setMessage("Post published successfully!");

    window.dispatchEvent(
      new CustomEvent("community-post-created", {
        detail: {
          communityId,
        },
      })
    );
  }

  if (checkingMembership) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-gray-400">
          Checking community membership...
        </p>
      </section>
    );
  }

  if (!userId) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-2xl font-black">Create a Post</h2>

        <p className="mt-3 text-gray-400">
          Please log in to participate in this community.
        </p>
      </section>
    );
  }

  if (!isMember) {
    return (
      <section className="rounded-3xl border border-purple-500/20 bg-purple-500/10 p-8">
        <h2 className="text-2xl font-black">Join to post</h2>

        <p className="mt-3 text-purple-100">
          Join this community using the button above before creating posts.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <h2 className="text-2xl font-black">Create a Post</h2>

      <p className="mt-2 text-gray-400">
        Share an update, question, opportunity, or idea with the community.
      </p>

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Share something with your community..."
        maxLength={1000}
        className="mt-6 min-h-40 w-full rounded-2xl bg-black/30 p-5 outline-none"
      />

      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          {content.length}/1000 characters
        </p>

        {message && (
          <p className="text-sm font-semibold text-purple-200">
            {message}
          </p>
        )}
      </div>

      <button
        onClick={createPost}
        disabled={posting || !content.trim()}
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-bold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send size={18} />
        {posting ? "Posting..." : "Post"}
      </button>
    </section>
  );
}