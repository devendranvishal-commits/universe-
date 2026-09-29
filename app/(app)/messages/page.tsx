"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { createClient } from "../../../lib/client";

type ConversationRow = {
  id: string;
  created_at: string;
  updated_at: string;
};

type ConversationMember = {
  conversation_id: string;
  user_id: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  university: string | null;
  major: string | null;
  avatar_url: string | null;
};

type DisplayProfile = {
  id: string;
  fullName: string;
  university: string;
  major: string;
  avatarUrl: string;
};

type ConversationPreview = {
  id: string;
  updatedAt: string;
  otherUser: DisplayProfile;
  latestMessage: MessageRow | null;
  unreadCount: number;
};

export default function MessagesPage() {
  const [userId, setUserId] = useState("");
  const [conversations, setConversations] = useState<
    ConversationPreview[]
  >([]);

  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [realtimeConnected, setRealtimeConnected] =
    useState(false);

  useEffect(() => {
    const supabase = createClient();

    let mounted = true;
    let activeChannel:
      | ReturnType<typeof supabase.channel>
      | undefined;

    async function initializeMessenger() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (userError) {
        setErrorMessage(userError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        setErrorMessage(
          "Please log in to view your messages."
        );
        setLoading(false);
        return;
      }

      setUserId(user.id);

      await loadConversations(user.id, true);

      if (!mounted) return;

      const channel = supabase
        .channel(`messenger-inbox-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
          },
          async () => {
            if (!mounted) return;

            await loadConversations(user.id, false);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "conversation_members",
          },
          async () => {
            if (!mounted) return;

            await loadConversations(user.id, false);
          }
        )
        .subscribe((status, error) => {
          if (!mounted) return;

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
            console.error(
              "Messenger realtime error:",
              error
            );
          }
        });

      activeChannel = channel;
    }

    initializeMessenger();

    return () => {
      mounted = false;

      if (activeChannel) {
        supabase.removeChannel(activeChannel);
      }
    };
  }, []);

  const filteredConversations = useMemo(() => {
    const cleanSearch = searchText
      .trim()
      .toLowerCase();

    if (!cleanSearch) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const searchableText = [
        conversation.otherUser.fullName,
        conversation.otherUser.university,
        conversation.otherUser.major,
        conversation.latestMessage?.content || "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(cleanSearch);
    });
  }, [conversations, searchText]);

  const totalUnread = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) =>
          total + conversation.unreadCount,
        0
      ),
    [conversations]
  );

  async function createAvatarDisplayUrl(
    avatarValue: string
  ) {
    if (!avatarValue) {
      return "";
    }

    if (
      avatarValue.startsWith("http://") ||
      avatarValue.startsWith("https://")
    ) {
      return avatarValue;
    }

    const supabase = createClient();

    const { data, error } = await supabase.storage
      .from("profile-images")
      .createSignedUrl(
        avatarValue,
        60 * 60 * 24 * 7
      );

    if (error) {
      console.error(
        "Could not create messenger avatar URL:",
        error.message
      );

      return "";
    }

    return data.signedUrl;
  }

  async function loadConversations(
    currentUserId: string,
    showMainLoading: boolean
  ) {
    if (showMainLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setErrorMessage("");

    const supabase = createClient();

    const {
      data: ownMembershipsData,
      error: ownMembershipsError,
    } = await supabase
      .from("conversation_members")
      .select("conversation_id, user_id")
      .eq("user_id", currentUserId);

    if (ownMembershipsError) {
      setErrorMessage(
        ownMembershipsError.message
      );

      setLoading(false);
      setRefreshing(false);
      return;
    }

    const ownMemberships =
      (ownMembershipsData as ConversationMember[]) ||
      [];

    const conversationIds = ownMemberships.map(
      (membership) => membership.conversation_id
    );

    if (conversationIds.length === 0) {
      setConversations([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const [
      conversationResult,
      memberResult,
      messageResult,
    ] = await Promise.all([
      supabase
        .from("conversations")
        .select("id, created_at, updated_at")
        .in("id", conversationIds),

      supabase
        .from("conversation_members")
        .select("conversation_id, user_id")
        .in("conversation_id", conversationIds),

      supabase
        .from("messages")
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          is_read,
          created_at
        `)
        .in("conversation_id", conversationIds)
        .order("created_at", {
          ascending: true,
        }),
    ]);

    if (conversationResult.error) {
      setErrorMessage(
        conversationResult.error.message
      );
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (memberResult.error) {
      setErrorMessage(memberResult.error.message);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (messageResult.error) {
      setErrorMessage(messageResult.error.message);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const conversationRows =
      (conversationResult.data as ConversationRow[]) ||
      [];

    const memberRows =
      (memberResult.data as ConversationMember[]) ||
      [];

    const messageRows =
      (messageResult.data as MessageRow[]) || [];

    const otherUserIds = Array.from(
      new Set(
        memberRows
          .filter(
            (membership) =>
              membership.user_id !== currentUserId
          )
          .map((membership) => membership.user_id)
      )
    );

    const profileMap: Record<
      string,
      DisplayProfile
    > = {};

    if (otherUserIds.length > 0) {
      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            university,
            major,
            avatar_url
          `)
          .in("id", otherUserIds);

      if (profileError) {
        console.error(
          "Could not load conversation profiles:",
          profileError.message
        );
      } else {
        const loadedProfiles =
          (profileData as ProfileRow[]) || [];

        const profileEntries = await Promise.all(
          loadedProfiles.map(async (profile) => {
            const avatarUrl =
              await createAvatarDisplayUrl(
                profile.avatar_url || ""
              );

            return [
              profile.id,
              {
                id: profile.id,
                fullName:
                  profile.full_name?.trim() ||
                  "Student",
                university:
                  profile.university?.trim() || "",
                major: profile.major?.trim() || "",
                avatarUrl,
              },
            ] as const;
          })
        );

        Object.assign(
          profileMap,
          Object.fromEntries(profileEntries)
        );
      }
    }

    const previews: ConversationPreview[] =
      conversationRows.map((conversation) => {
        const conversationMembers =
          memberRows.filter(
            (membership) =>
              membership.conversation_id ===
              conversation.id
          );

        const otherMember =
          conversationMembers.find(
            (membership) =>
              membership.user_id !== currentUserId
          );

        const otherUser =
          otherMember &&
          profileMap[otherMember.user_id]
            ? profileMap[otherMember.user_id]
            : {
                id: otherMember?.user_id || "",
                fullName: "Student",
                university: "",
                major: "",
                avatarUrl: "",
              };

        const conversationMessages =
          messageRows.filter(
            (message) =>
              message.conversation_id ===
              conversation.id
          );

        const latestMessage =
          conversationMessages.length > 0
            ? conversationMessages[
                conversationMessages.length - 1
              ]
            : null;

        const unreadCount =
          conversationMessages.filter(
            (message) =>
              message.sender_id !== currentUserId &&
              !message.is_read
          ).length;

        return {
          id: conversation.id,
          updatedAt:
            latestMessage?.created_at ||
            conversation.updated_at ||
            conversation.created_at,
          otherUser,
          latestMessage,
          unreadCount,
        };
      });

    previews.sort(
      (firstConversation, secondConversation) =>
        new Date(
          secondConversation.updatedAt
        ).getTime() -
        new Date(
          firstConversation.updatedAt
        ).getTime()
    );

    setConversations(previews);
    setLoading(false);
    setRefreshing(false);
  }

  async function refreshConversations() {
    if (!userId || refreshing) return;

    await loadConversations(userId, false);
  }

  function formatConversationTime(
    value: string
  ) {
    const date = new Date(value);
    const now = new Date();

    const isToday =
      date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    const yesterday = new Date(now);

    yesterday.setDate(now.getDate() - 1);

    if (
      date.toDateString() ===
      yesterday.toDateString()
    ) {
      return "Yesterday";
    }

    const sameYear =
      date.getFullYear() === now.getFullYear();

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: sameYear ? undefined : "numeric",
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <LoaderCircle
            className="animate-spin"
            size={22}
          />

          Loading conversations...
        </div>
      </div>
    );
  }

  return (
    <main className="min-w-0 space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#10142b] via-[#131433] to-[#271257] p-7 md:p-9">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-purple-500/20" />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-purple-300">
              <MessageCircle size={17} />
              Messenger
            </div>

            <h1 className="mt-3 text-3xl font-black md:text-4xl">
              Your conversations.
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-gray-300">
              Message students about communities,
              marketplace listings, housing, gigs,
              rides, and campus life.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Conversations
              </p>

              <p className="mt-1 text-2xl font-black text-purple-200">
                {conversations.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Unread
              </p>

              <p className="mt-1 text-2xl font-black text-purple-200">
                {totalUnread}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  realtimeConnected
                    ? "bg-green-400"
                    : "bg-yellow-400"
                }`}
              />

              <span className="text-gray-300">
                {realtimeConnected
                  ? "Live"
                  : "Connecting"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#101520] shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between md:px-7">
          <div>
            <h2 className="text-2xl font-black">
              Messages
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Open a conversation to continue chatting.
            </p>
          </div>

          <button
            onClick={refreshConversations}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-bold text-gray-200 transition hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            Refresh
          </button>
        </div>

        <div className="border-b border-white/10 p-5 md:px-7">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-5 focus-within:border-purple-400/50">
            <Search
              size={19}
              className="shrink-0 text-gray-500"
            />

            <input
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              placeholder="Search conversations..."
              className="min-w-0 flex-1 bg-transparent py-4 outline-none"
            />
          </div>
        </div>

        {errorMessage ? (
          <div className="p-10 text-center">
            <h2 className="text-xl font-black text-red-200">
              Could not load messages
            </h2>

            <p className="mt-2 text-red-200/70">
              {errorMessage}
            </p>

            <button
              onClick={refreshConversations}
              className="mt-5 rounded-xl bg-white px-5 py-3 font-bold text-black"
            >
              Try Again
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
              <Users size={30} />
            </div>

            <h2 className="mt-5 text-2xl font-black">
              No conversations yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-400">
              Open another student’s profile and click
              Message to begin a private conversation.
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-10 text-center">
            <Search
              size={36}
              className="mx-auto text-gray-600"
            />

            <h2 className="mt-4 text-xl font-black">
              No matching conversations
            </h2>

            <p className="mt-2 text-gray-400">
              Try searching for another name,
              university, major, or message.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredConversations.map(
              (conversation) => {
                const initial =
                  conversation.otherUser.fullName
                    .charAt(0)
                    .toUpperCase() || "S";

                const latestMessage =
                  conversation.latestMessage;

                const latestPreview =
                  latestMessage?.content ||
                  "Start the conversation.";

                const latestIsMine =
                  latestMessage?.sender_id === userId;

                return (
                  <Link
                    key={conversation.id}
                    href={`/messages/${conversation.id}`}
                    className={`flex min-w-0 items-center gap-4 p-5 transition hover:bg-white/[0.04] md:px-7 ${
                      conversation.unreadCount > 0
                        ? "bg-purple-500/[0.06]"
                        : ""
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 ring-2 ring-white/10">
                        {conversation.otherUser
                          .avatarUrl ? (
                          <img
                            src={
                              conversation.otherUser
                                .avatarUrl
                            }
                            alt=""
                            className="block h-full w-full object-cover"
                            style={{
                              width: "100%",
                              height: "100%",
                              maxWidth: "none",
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xl font-black text-white">
                            {initial}
                          </div>
                        )}
                      </div>

                      <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-[#101520] bg-green-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-black">
                            {
                              conversation.otherUser
                                .fullName
                            }
                          </h3>

                          {(conversation.otherUser
                            .major ||
                            conversation.otherUser
                              .university) && (
                            <p className="mt-0.5 truncate text-xs text-gray-500">
                              {[
                                conversation.otherUser
                                  .major,
                                conversation.otherUser
                                  .university,
                              ]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          )}
                        </div>

                        <p className="shrink-0 text-xs text-gray-500">
                          {formatConversationTime(
                            conversation.updatedAt
                          )}
                        </p>
                      </div>

                      <div className="mt-2 flex min-w-0 items-center justify-between gap-3">
                        <p
                          className={`truncate text-sm ${
                            conversation.unreadCount > 0
                              ? "font-bold text-white"
                              : "text-gray-400"
                          }`}
                        >
                          {latestIsMine ? "You: " : ""}
                          {latestPreview}
                        </p>

                        {conversation.unreadCount > 0 && (
                          <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-purple-500 px-2 text-xs font-black text-white">
                            {conversation.unreadCount >
                            99
                              ? "99+"
                              : conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        )}
      </section>
    </main>
  );
}