"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { createClient } from "../../../../../lib/client";

type Props = {
  postId: string;
};

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  profiles:
    | {
        full_name: string | null;
      }[]
    | null;
};

export default function Comments({ postId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    let active = true;
    let refreshInProgress = false;

    async function refreshComments(showLoading = false) {
      if (refreshInProgress) return;

      refreshInProgress = true;

      if (showLoading) {
        setLoading(true);
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!active) {
        refreshInProgress = false;
        return;
      }

      if (userError) {
        console.error("Could not load user:", userError.message);
      }

      setUserId(user?.id || "");

      const { data, error } = await supabase
        .from("post_comments")
        .select(`
          id,
          post_id,
          user_id,
          comment,
          created_at,
          profiles (
            full_name
          )
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (!active) {
        refreshInProgress = false;
        return;
      }

      if (error) {
        console.error("Could not load comments:", error.message);
        setErrorMessage(error.message);

        if (showLoading) {
          setLoading(false);
        }

        refreshInProgress = false;
        return;
      }

      setComments((data as Comment[]) || []);
      setErrorMessage("");

      if (showLoading) {
        setLoading(false);
      }

      refreshInProgress = false;
    }

    refreshComments(true);

    const channelName = [
      "post-comments",
      postId,
      Date.now(),
      Math.random().toString(36).slice(2),
    ].join("-");

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "post_comments",
          filter: `post_id=eq.${postId}`,
        },
        async () => {
          if (!active) return;
          await refreshComments(false);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "post_comments",
          filter: `post_id=eq.${postId}`,
        },
        async () => {
          if (!active) return;
          await refreshComments(false);
        }
      )
      .subscribe((status, error) => {
        if (!active) return;

        if (status === "SUBSCRIBED") {
          setRealtimeConnected(true);
        }

        if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          setRealtimeConnected(false);
        }

        if (error) {
          console.error("Comment realtime error:", error);
        }
      });

    const pollingInterval = window.setInterval(() => {
      if (active) {
        refreshComments(false);
      }
    }, 3000);

    return () => {
      active = false;
      window.clearInterval(pollingInterval);
      supabase.removeChannel(channel);
    };
  }, [postId]);

  async function createComment() {
    const cleanComment = commentText.trim();

    if (!cleanComment) return;

    if (!userId) {
      alert("Please log in to comment.");
      return;
    }

    setPosting(true);
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId,
        user_id: userId,
        comment: cleanComment,
      });

    setPosting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setCommentText("");

    const { data, error: refreshError } = await supabase
      .from("post_comments")
      .select(`
        id,
        post_id,
        user_id,
        comment,
        created_at,
        profiles (
          full_name
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (refreshError) {
      console.error(refreshError.message);
    } else {
      setComments((data as Comment[]) || []);
    }
  }

  async function deleteComment(commentId: string) {
    if (!userId) return;

    const confirmed = confirm("Delete this comment?");

    if (!confirmed) return;

    setDeletingId(commentId);

    const supabase = createClient();

    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", userId);

    setDeletingId("");

    if (error) {
      alert(error.message);
      return;
    }

    setComments((current) =>
      current.filter((comment) => comment.id !== commentId)
    );
  }

  return (
    <div className="mt-6 border-t border-white/10 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-purple-300" />

          <h4 className="font-black">
            {comments.length} Comment
            {comments.length === 1 ? "" : "s"}
          </h4>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span
            className={`h-2 w-2 rounded-full ${
              realtimeConnected ? "bg-green-400" : "bg-yellow-400"
            }`}
          />

          <span>
            {realtimeConnected ? "Live" : "Auto-refreshing"}
          </span>
        </div>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-gray-400">
          Loading comments...
        </p>
      ) : comments.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          No comments yet.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {comments.map((comment) => {
            const author =
              comment.profiles?.[0]?.full_name?.trim() || "Student";

            const isMine = comment.user_id === userId;

            return (
              <div
                key={comment.id}
                className="rounded-2xl bg-black/25 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold">{author}</p>

                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>

                  {isMine && (
                    <button
                      onClick={() => deleteComment(comment.id)}
                      disabled={deletingId === comment.id}
                      className="rounded-xl p-2 text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                      aria-label="Delete comment"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <p className="mt-3 whitespace-pre-wrap break-words text-gray-300">
                  {comment.comment}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {errorMessage && (
        <p className="mt-4 text-sm font-semibold text-red-300">
          {errorMessage}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              createComment();
            }
          }}
          placeholder="Write a comment..."
          maxLength={500}
          className="flex-1 rounded-2xl bg-black/30 px-5 py-3 outline-none"
        />

        <button
          onClick={createComment}
          disabled={posting || !commentText.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-black transition hover:bg-gray-200 disabled:opacity-50"
        >
          <Send size={17} />
          {posting ? "Posting..." : "Comment"}
        </button>
      </div>
    </div>
  );
}