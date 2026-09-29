"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../../lib/client";
import PostCard from "./PostCard";

type Post = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles:
    | {
        full_name: string | null;
        avatar_url: string | null;
      }[]
    | null;
};

type Props = {
  communityId: string;
};

export default function PostList({
  communityId,
}: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUserId, setCurrentUserId] =
    useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    loadPosts();

    function handlePostCreated(event: Event) {
      const customEvent = event as CustomEvent<{
        communityId?: string;
      }>;

      if (
        customEvent.detail?.communityId ===
        communityId
      ) {
        loadPosts();
      }
    }

    window.addEventListener(
      "community-post-created",
      handlePostCreated
    );

    return () => {
      window.removeEventListener(
        "community-post-created",
        handlePostCreated
      );
    };
  }, [communityId]);

  async function loadPosts() {
    setLoading(true);
    setErrorMessage("");

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "Could not load current user:",
        userError.message
      );
    }

    setCurrentUserId(user?.id || "");

    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        user_id,
        content,
        created_at,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq("community_id", communityId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Could not load posts:",
        error.message
      );

      setPosts([]);
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setPosts((data as Post[]) || []);
    setLoading(false);
  }

  function removePost(postId: string) {
    setPosts((currentPosts) =>
      currentPosts.filter(
        (post) => post.id !== postId
      )
    );
  }

  function updatePost(
    postId: string,
    content: string
  ) {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              content,
            }
          : post
      )
    );
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-gray-400">
          Loading posts...
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center">
        <h2 className="text-xl font-bold text-red-200">
          Could not load posts
        </h2>

        <p className="mt-2 text-sm text-red-200/80">
          {errorMessage}
        </p>

        <button
          onClick={loadPosts}
          className="mt-5 rounded-2xl bg-white px-5 py-3 font-bold text-black"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <h2 className="text-2xl font-bold">
          No posts yet
        </h2>

        <p className="mt-3 text-gray-400">
          Be the first student to post in this
          community.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const profile = post.profiles?.[0];

        return (
          <PostCard
            key={post.id}
            postId={post.id}
            authorId={post.user_id}
            author={
              profile?.full_name?.trim() ||
              "Student"
            }
            avatarValue={
              profile?.avatar_url || ""
            }
            content={post.content}
            createdAt={post.created_at}
            isOwner={
              post.user_id === currentUserId
            }
            onDeleted={removePost}
            onUpdated={updatePost}
          />
        );
      })}
    </div>
  );
}