"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";
import {
  Check,
  Heart,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "../../../../../lib/client";
import Comments from "./Comments";

type Props = {
  postId: string;
  authorId: string;
  author: string;
  avatarValue: string;
  content: string;
  createdAt: string;
  isOwner: boolean;
  onDeleted: (postId: string) => void;
  onUpdated: (
    postId: string,
    content: string
  ) => void;
};

export default function PostCard({
  postId,
  authorId,
  author,
  avatarValue,
  content,
  createdAt,
  isOwner,
  onDeleted,
  onUpdated,
}: Props) {
  const [userId, setUserId] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] =
    useState(0);
  const [loadingLikes, setLoadingLikes] =
    useState(true);
  const [updatingLike, setUpdatingLike] =
    useState(false);

  const [editing, setEditing] =
    useState(false);
  const [editedContent, setEditedContent] =
    useState(content);
  const [savingEdit, setSavingEdit] =
    useState(false);
  const [deleting, setDeleting] =
    useState(false);

  const [avatarDisplayUrl, setAvatarDisplayUrl] =
    useState("");
  const [avatarFailed, setAvatarFailed] =
    useState(false);

  useEffect(() => {
    loadLikes();
  }, [postId]);

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  useEffect(() => {
    loadAvatar();
  }, [avatarValue]);

  async function loadAvatar() {
    setAvatarFailed(false);

    if (!avatarValue) {
      setAvatarDisplayUrl("");
      return;
    }

    if (
      avatarValue.startsWith("http://") ||
      avatarValue.startsWith("https://")
    ) {
      setAvatarDisplayUrl(avatarValue);
      return;
    }

    const supabase = createClient();

    const { data, error } =
      await supabase.storage
        .from("profile-images")
        .createSignedUrl(
          avatarValue,
          60 * 60 * 24 * 7
        );

    if (error) {
      console.error(
        "Could not load post avatar:",
        error.message
      );

      setAvatarDisplayUrl("");
      setAvatarFailed(true);
      return;
    }

    setAvatarDisplayUrl(data.signedUrl);
  }

  async function loadLikes() {
    setLoadingLikes(true);

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(userError.message);
    }

    setUserId(user?.id || "");

    const { count, error: countError } =
      await supabase
        .from("post_likes")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("post_id", postId);

    if (countError) {
      console.error(countError.message);
    } else {
      setLikeCount(count || 0);
    }

    if (user) {
      const { data, error } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(error.message);
      } else {
        setLiked(Boolean(data));
      }
    } else {
      setLiked(false);
    }

    setLoadingLikes(false);
  }

  async function toggleLike() {
    if (!userId) {
      alert("Please log in to like posts.");
      return;
    }

    setUpdatingLike(true);

    const supabase = createClient();

    if (liked) {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (error) {
        alert(error.message);
        setUpdatingLike(false);
        return;
      }

      setLiked(false);
      setLikeCount((current) =>
        Math.max(0, current - 1)
      );
    } else {
      const { error } = await supabase
        .from("post_likes")
        .insert({
          post_id: postId,
          user_id: userId,
        });

      if (error) {
        if (error.code === "23505") {
          setLiked(true);
        } else {
          alert(error.message);
        }

        setUpdatingLike(false);
        return;
      }

      setLiked(true);
      setLikeCount(
        (current) => current + 1
      );
    }

    setUpdatingLike(false);
  }

  async function saveEdit() {
    const cleanContent =
      editedContent.trim();

    if (!cleanContent) {
      alert(
        "Post content cannot be empty."
      );
      return;
    }

    setSavingEdit(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("posts")
      .update({
        content: cleanContent,
      })
      .eq("id", postId);

    setSavingEdit(false);

    if (error) {
      alert(error.message);
      return;
    }

    onUpdated(postId, cleanContent);
    setEditing(false);
  }

  async function deletePost() {
    const confirmed = confirm(
      "Delete this post? Its likes and comments will also be removed."
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    setDeleting(false);

    if (error) {
      alert(error.message);
      return;
    }

    onDeleted(postId);
  }

  function cancelEdit() {
    setEditedContent(content);
    setEditing(false);
  }

  const initial =
    author.trim().charAt(0).toUpperCase() ||
    "S";

  const showAvatar =
    Boolean(avatarDisplayUrl) &&
    !avatarFailed;

  return (
    <article className="rounded-3xl border border-white/10 bg-[#121522] p-6 shadow-xl shadow-black/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/users/${authorId}`}
            className="shrink-0"
            aria-label={`Open ${author}'s profile`}
          >
            <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 ring-2 ring-white/10 transition hover:scale-105 hover:ring-purple-400/50">
              {showAvatar ? (
                <img
                  src={avatarDisplayUrl}
                  alt=""
                  onError={() =>
                    setAvatarFailed(true)
                  }
                  className="block h-full w-full object-cover"
                  style={{
                    width: "100%",
                    height: "100%",
                    maxWidth: "none",
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-black text-white">
                  {initial}
                </div>
              )}
            </div>
          </Link>

          <div className="min-w-0">
            <Link
              href={`/users/${authorId}`}
              className="block truncate font-black transition hover:text-purple-300"
            >
              {author}
            </Link>

            <p className="text-sm text-gray-500">
              {new Date(
                createdAt
              ).toLocaleString()}
            </p>
          </div>
        </div>

        {isOwner && !editing && (
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() =>
                setEditing(true)
              }
              className="rounded-xl bg-white/5 p-2 text-gray-300 transition hover:bg-white/10"
              aria-label="Edit post"
            >
              <Pencil size={17} />
            </button>

            <button
              onClick={deletePost}
              disabled={deleting}
              className="rounded-xl bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
              aria-label="Delete post"
            >
              <Trash2 size={17} />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-5">
          <textarea
            value={editedContent}
            onChange={(event) =>
              setEditedContent(
                event.target.value
              )
            }
            maxLength={1000}
            className="min-h-36 w-full rounded-2xl border border-white/10 bg-black/30 p-5 outline-none focus:border-purple-400/40"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              {editedContent.length}/1000
              characters
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelEdit}
                disabled={savingEdit}
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 font-bold text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
              >
                <X size={17} />
                Cancel
              </button>

              <button
                onClick={saveEdit}
                disabled={
                  savingEdit ||
                  !editedContent.trim()
                }
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-bold text-black transition hover:bg-gray-200 disabled:opacity-50"
              >
                <Check size={17} />

                {savingEdit
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-5 whitespace-pre-wrap break-words leading-7 text-gray-300">
          {content}
        </p>
      )}

      <div className="mt-6 border-t border-white/10 pt-4">
        <button
          onClick={toggleLike}
          disabled={
            updatingLike || loadingLikes
          }
          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 font-bold transition disabled:opacity-50 ${
            liked
              ? "bg-pink-500/20 text-pink-300"
              : "bg-white/5 text-gray-300 hover:bg-white/10"
          }`}
        >
          <Heart
            size={18}
            className={
              liked ? "fill-current" : ""
            }
          />

          {loadingLikes
            ? "Loading..."
            : `${likeCount} ${
                likeCount === 1
                  ? "Like"
                  : "Likes"
              }`}
        </button>
      </div>

      <Comments postId={postId} />
    </article>
  );
}