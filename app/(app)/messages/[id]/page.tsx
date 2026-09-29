"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  Send,
  UserRound,
} from "lucide-react";
import { createClient } from "../../../../lib/client";

type Conversation = {
  id: string;
  created_at: string;
  updated_at: string;
};

type ConversationMember = {
  conversation_id: string;
  user_id: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  university: string | null;
  major: string | null;
  avatar_url: string | null;
};

type OtherStudent = {
  id: string;
  fullName: string;
  university: string;
  major: string;
  avatarUrl: string;
};

type TypingStatus = {
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
};

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");

  const [otherStudent, setOtherStudent] =
    useState<OtherStudent | null>(null);

  const [otherUserId, setOtherUserId] = useState("");
  const [otherUserTyping, setOtherUserTyping] =
    useState(false);

  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [realtimeConnected, setRealtimeConnected] =
    useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const typingStopTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const remoteTypingTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const lastTypingBroadcastRef = useRef(0);
  const typingActiveRef = useRef(false);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      window.requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior,
          block: "end",
        });
      });
    },
    []
  );

  const createAvatarDisplayUrl = useCallback(
    async (avatarValue: string) => {
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
          "Could not create chat avatar URL:",
          error.message
        );

        return "";
      }

      return data.signedUrl;
    },
    []
  );

  const updateTypingStatus = useCallback(
    async (isTyping: boolean) => {
      if (!conversationId || !currentUserId) {
        return;
      }

      const supabase = createClient();

      const { error } = await supabase
        .from("conversation_typing")
        .upsert(
          {
            conversation_id: conversationId,
            user_id: currentUserId,
            is_typing: isTyping,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "conversation_id,user_id",
          }
        );

      if (error) {
        console.error(
          "Could not update typing status:",
          error.message
        );

        return;
      }

      typingActiveRef.current = isTyping;
    },
    [conversationId, currentUserId]
  );

  const stopTyping = useCallback(async () => {
    if (typingStopTimeoutRef.current) {
      clearTimeout(typingStopTimeoutRef.current);
      typingStopTimeoutRef.current = null;
    }

    if (!typingActiveRef.current) {
      return;
    }

    await updateTypingStatus(false);
  }, [updateTypingStatus]);

  const broadcastTyping = useCallback(() => {
    if (!conversationId || !currentUserId) {
      return;
    }

    const now = Date.now();

    if (
      !typingActiveRef.current ||
      now - lastTypingBroadcastRef.current > 1200
    ) {
      lastTypingBroadcastRef.current = now;
      void updateTypingStatus(true);
    }

    if (typingStopTimeoutRef.current) {
      clearTimeout(typingStopTimeoutRef.current);
    }

    typingStopTimeoutRef.current = setTimeout(() => {
      void stopTyping();
    }, 1800);
  }, [
    conversationId,
    currentUserId,
    stopTyping,
    updateTypingStatus,
  ]);

  const markReceivedMessagesRead = useCallback(
    async (loggedInUserId: string) => {
      if (!conversationId || !loggedInUserId) {
        return;
      }

      const supabase = createClient();

      const { error } = await supabase
        .from("messages")
        .update({
          is_read: true,
        })
        .eq("conversation_id", conversationId)
        .neq("sender_id", loggedInUserId)
        .eq("is_read", false);

      if (error) {
        console.error(
          "Could not mark messages as read:",
          error.message
        );

        return;
      }

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.sender_id !== loggedInUserId
            ? {
                ...message,
                is_read: true,
              }
            : message
        )
      );
    },
    [conversationId]
  );

  const loadMessages = useCallback(
    async (
      loggedInUserId: string,
      showRefreshing = false
    ) => {
      if (!conversationId) {
        return;
      }

      if (showRefreshing) {
        setRefreshing(true);
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          is_read,
          created_at
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        setErrorMessage(error.message);
        setRefreshing(false);
        return;
      }

      setMessages((data as Message[]) || []);
      setRefreshing(false);

      await markReceivedMessagesRead(loggedInUserId);
    },
    [conversationId, markReceivedMessagesRead]
  );

  const loadInitialTypingStatus = useCallback(
    async (studentUserId: string) => {
      if (!conversationId || !studentUserId) {
        return;
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from("conversation_typing")
        .select(`
          conversation_id,
          user_id,
          is_typing,
          updated_at
        `)
        .eq("conversation_id", conversationId)
        .eq("user_id", studentUserId)
        .maybeSingle();

      if (error) {
        console.error(
          "Could not load typing status:",
          error.message
        );

        return;
      }

      if (!data) {
        setOtherUserTyping(false);
        return;
      }

      const typingStatus = data as TypingStatus;

      const statusAge =
        Date.now() -
        new Date(typingStatus.updated_at).getTime();

      const isStillTyping =
        typingStatus.is_typing && statusAge < 5000;

      setOtherUserTyping(isStillTyping);
    },
    [conversationId]
  );

  const loadConversation = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    setOtherUserTyping(false);

    if (!conversationId) {
      setErrorMessage(
        "A conversation ID was not provided."
      );

      setLoading(false);
      return;
    }

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setErrorMessage(userError.message);
      setLoading(false);
      return;
    }

    if (!user) {
      setErrorMessage(
        "Please log in to view this conversation."
      );

      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    const {
      data: conversationData,
      error: conversationError,
    } = await supabase
      .from("conversations")
      .select(`
        id,
        created_at,
        updated_at
      `)
      .eq("id", conversationId)
      .maybeSingle();

    if (conversationError) {
      setErrorMessage(conversationError.message);
      setLoading(false);
      return;
    }

    if (!conversationData) {
      setErrorMessage(
        "This conversation could not be found."
      );

      setLoading(false);
      return;
    }

    setConversation(conversationData as Conversation);

    const {
      data: membershipData,
      error: membershipError,
    } = await supabase
      .from("conversation_members")
      .select(`
        conversation_id,
        user_id
      `)
      .eq("conversation_id", conversationId);

    if (membershipError) {
      setErrorMessage(membershipError.message);
      setLoading(false);
      return;
    }

    const memberships =
      (membershipData as ConversationMember[]) || [];

    const currentMembership = memberships.find(
      (membership) => membership.user_id === user.id
    );

    if (!currentMembership) {
      setErrorMessage(
        "You do not have access to this conversation."
      );

      setLoading(false);
      return;
    }

    const otherMembership = memberships.find(
      (membership) => membership.user_id !== user.id
    );

    if (otherMembership) {
      setOtherUserId(otherMembership.user_id);

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          university,
          major,
          avatar_url
        `)
        .eq("id", otherMembership.user_id)
        .maybeSingle();

      if (profileError) {
        console.error(
          "Could not load student profile:",
          profileError.message
        );
      } else if (profileData) {
        const profile = profileData as Profile;

        const avatarUrl =
          await createAvatarDisplayUrl(
            profile.avatar_url || ""
          );

        setOtherStudent({
          id: profile.id,
          fullName:
            profile.full_name?.trim() || "Student",
          university:
            profile.university?.trim() || "",
          major: profile.major?.trim() || "",
          avatarUrl,
        });
      }

      await loadInitialTypingStatus(
        otherMembership.user_id
      );
    } else {
      setOtherUserId("");
      setOtherStudent(null);
    }

    await loadMessages(user.id);

    setLoading(false);

    window.setTimeout(() => {
      scrollToBottom("auto");
      inputRef.current?.focus();
    }, 100);
  }, [
    conversationId,
    createAvatarDisplayUrl,
    loadInitialTypingStatus,
    loadMessages,
    scrollToBottom,
  ]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    if (!conversationId || !currentUserId) {
      return;
    }

    const supabase = createClient();
    let mounted = true;

    const channel = supabase
      .channel(
        `conversation-${conversationId}-${currentUserId}`
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          if (!mounted) {
            return;
          }

          const newMessage = payload.new as Message;

          setMessages((currentMessages) => {
            const alreadyExists = currentMessages.some(
              (message) => message.id === newMessage.id
            );

            if (alreadyExists) {
              return currentMessages;
            }

            return [...currentMessages, newMessage].sort(
              (firstMessage, secondMessage) =>
                new Date(
                  firstMessage.created_at
                ).getTime() -
                new Date(
                  secondMessage.created_at
                ).getTime()
            );
          });

          if (newMessage.sender_id !== currentUserId) {
            setOtherUserTyping(false);

            if (remoteTypingTimeoutRef.current) {
              clearTimeout(
                remoteTypingTimeoutRef.current
              );

              remoteTypingTimeoutRef.current = null;
            }

            await markReceivedMessagesRead(
              currentUserId
            );
          }

          scrollToBottom();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (!mounted) {
            return;
          }

          const updatedMessage =
            payload.new as Message;

          setMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.id === updatedMessage.id
                ? updatedMessage
                : message
            )
          );
        }
      )
      .subscribe((status, error) => {
        if (!mounted) {
          return;
        }

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
            "Conversation realtime error:",
            error
          );
        }
      });

    return () => {
      mounted = false;
      setRealtimeConnected(false);
      supabase.removeChannel(channel);
    };
  }, [
    conversationId,
    currentUserId,
    markReceivedMessagesRead,
    scrollToBottom,
  ]);

  useEffect(() => {
    if (
      !conversationId ||
      !currentUserId ||
      !otherUserId
    ) {
      return;
    }

    const supabase = createClient();
    let mounted = true;

    const typingChannel = supabase
      .channel(
        `typing-${conversationId}-${currentUserId}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_typing",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (!mounted) {
            return;
          }

          const typingStatus =
            payload.new as TypingStatus;

          if (
            typingStatus.user_id !== otherUserId
          ) {
            return;
          }

          if (remoteTypingTimeoutRef.current) {
            clearTimeout(
              remoteTypingTimeoutRef.current
            );
          }

          if (typingStatus.is_typing) {
            setOtherUserTyping(true);

            remoteTypingTimeoutRef.current =
              setTimeout(() => {
                setOtherUserTyping(false);
              }, 4000);
          } else {
            setOtherUserTyping(false);
            remoteTypingTimeoutRef.current = null;
          }
        }
      )
      .subscribe((status, error) => {
        if (error) {
          console.error(
            "Typing realtime error:",
            error
          );
        }

        if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT"
        ) {
          setOtherUserTyping(false);
        }
      });

    return () => {
      mounted = false;

      if (remoteTypingTimeoutRef.current) {
        clearTimeout(
          remoteTypingTimeoutRef.current
        );

        remoteTypingTimeoutRef.current = null;
      }

      supabase.removeChannel(typingChannel);
    };
  }, [
    conversationId,
    currentUserId,
    otherUserId,
  ]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("auto");
    }
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void stopTyping();
      }
    };

    const handleBeforeUnload = () => {
      void stopTyping();
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );

      if (typingStopTimeoutRef.current) {
        clearTimeout(
          typingStopTimeoutRef.current
        );

        typingStopTimeoutRef.current = null;
      }

      void stopTyping();
    };
  }, [stopTyping]);

  async function sendMessage(
    event?: FormEvent<HTMLFormElement>
  ) {
    event?.preventDefault();

    const cleanMessage = messageText.trim();

    if (
      !cleanMessage ||
      !currentUserId ||
      !conversationId ||
      sending
    ) {
      return;
    }

    if (cleanMessage.length > 5000) {
      alert(
        "Messages cannot be longer than 5,000 characters."
      );

      return;
    }

    setSending(true);
    setErrorMessage("");

    await stopTyping();

    const supabase = createClient();

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: cleanMessage,
        is_read: false,
      })
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        is_read,
        created_at
      `)
      .single();

    setSending(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const insertedMessage = data as Message;

    setMessages((currentMessages) => {
      const alreadyExists = currentMessages.some(
        (message) =>
          message.id === insertedMessage.id
      );

      if (alreadyExists) {
        return currentMessages;
      }

      return [...currentMessages, insertedMessage];
    });

    setMessageText("");
    scrollToBottom();

    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }

  async function refreshConversation() {
    if (!currentUserId || refreshing) {
      return;
    }

    setErrorMessage("");

    await Promise.all([
      loadMessages(currentUserId, true),
      otherUserId
        ? loadInitialTypingStatus(otherUserId)
        : Promise.resolve(),
    ]);

    scrollToBottom("auto");
  }

  function handleMessageTextChange(
    value: string
  ) {
    setMessageText(value);

    if (value.trim()) {
      broadcastTyping();
    } else {
      void stopTyping();
    }
  }

  function formatMessageTime(value: string) {
    return new Date(value).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatMessageDate(value: string) {
    const date = new Date(value);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (
      date.toDateString() ===
      yesterday.toDateString()
    ) {
      return "Yesterday";
    }

    return date.toLocaleDateString([], {
      month: "long",
      day: "numeric",
      year:
        date.getFullYear() === today.getFullYear()
          ? undefined
          : "numeric",
    });
  }

  function shouldShowDateDivider(
    message: Message,
    index: number
  ) {
    if (index === 0) {
      return true;
    }

    const previousMessage = messages[index - 1];

    return (
      new Date(
        previousMessage.created_at
      ).toDateString() !==
      new Date(message.created_at).toDateString()
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <LoaderCircle
            className="animate-spin"
            size={22}
          />

          Loading conversation...
        </div>
      </div>
    );
  }

  if (errorMessage && !conversation) {
    return (
      <main className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 md:p-10">
        <h1 className="text-3xl font-black text-red-200">
          Could not open conversation
        </h1>

        <p className="mt-3 text-red-200/80">
          {errorMessage}
        </p>

        <Link
          href="/messages"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-black"
        >
          <ArrowLeft size={18} />
          Back to messages
        </Link>
      </main>
    );
  }

  const studentName =
    otherStudent?.fullName || "Student";

  const studentInitial =
    studentName.charAt(0).toUpperCase() || "S";

  return (
    <main className="min-w-0">
      <section className="flex h-[calc(100vh-3rem)] min-h-[650px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#101520] shadow-2xl shadow-black/30">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/messages"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Back to messages"
            >
              <ArrowLeft size={20} />
            </Link>

            {otherStudent ? (
              <Link
                href={`/users/${otherStudent.id}`}
                className="flex min-w-0 items-center gap-3"
              >
                <div className="relative shrink-0">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 ring-2 ring-white/10">
                    {otherStudent.avatarUrl ? (
                      <img
                        src={otherStudent.avatarUrl}
                        alt=""
                        className="block h-full w-full object-cover"
                        style={{
                          width: "100%",
                          height: "100%",
                          maxWidth: "none",
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-black text-white">
                        {studentInitial}
                      </div>
                    )}
                  </div>

                  <span
                    className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#101520] ${
                      realtimeConnected
                        ? "bg-green-400"
                        : "bg-yellow-400"
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate font-black text-white">
                    {studentName}
                  </h1>

                  <p
                    className={`truncate text-xs ${
                      otherUserTyping
                        ? "font-semibold text-purple-300"
                        : "text-gray-400"
                    }`}
                  >
                    {otherUserTyping
                      ? `${studentName} is typing...`
                      : [
                          otherStudent.major,
                          otherStudent.university,
                        ]
                          .filter(Boolean)
                          .join(" • ") ||
                        (realtimeConnected
                          ? "Live conversation"
                          : "Connecting...")}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/15 text-purple-300">
                  <UserRound size={22} />
                </div>

                <div>
                  <h1 className="font-black">
                    Conversation
                  </h1>

                  <p className="text-xs text-gray-400">
                    Private messages
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-gray-400 sm:flex">
              <span
                className={`h-2 w-2 rounded-full ${
                  realtimeConnected
                    ? "bg-green-400"
                    : "bg-yellow-400"
                }`}
              />

              {realtimeConnected
                ? "Live"
                : "Connecting"}
            </div>

            <button
              onClick={refreshConversation}
              disabled={refreshing}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              aria-label="Refresh conversation"
            >
              <RefreshCw
                size={18}
                className={
                  refreshing ? "animate-spin" : ""
                }
              />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-[#0d111c] to-[#0a0e18] px-4 py-6 md:px-7">
          {errorMessage && (
            <div className="mx-auto mb-5 max-w-2xl rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
              {errorMessage}
            </div>
          )}

          {messages.length === 0 ? (
            <div className="flex min-h-full items-center justify-center py-12">
              <div className="max-w-md text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-500/10 text-purple-300">
                  <MessageCircle size={36} />
                </div>

                <h2 className="mt-6 text-2xl font-black">
                  Start the conversation
                </h2>

                <p className="mt-3 leading-7 text-gray-400">
                  Send a private message to{" "}
                  {studentName}. Your conversation will
                  appear here in real time.
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl space-y-3">
              {messages.map((message, index) => {
                const isMine =
                  message.sender_id === currentUserId;

                return (
                  <div key={message.id}>
                    {shouldShowDateDivider(
                      message,
                      index
                    ) && (
                      <div className="my-6 flex items-center gap-4">
                        <div className="h-px flex-1 bg-white/10" />

                        <span className="shrink-0 rounded-full border border-white/10 bg-[#101520] px-4 py-1.5 text-xs font-bold text-gray-500">
                          {formatMessageDate(
                            message.created_at
                          )}
                        </span>

                        <div className="h-px flex-1 bg-white/10" />
                      </div>
                    )}

                    <div
                      className={`flex ${
                        isMine
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex max-w-[85%] flex-col sm:max-w-[72%] ${
                          isMine
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-lg ${
                            isMine
                              ? "rounded-br-md bg-gradient-to-br from-indigo-600 to-purple-600 text-white"
                              : "rounded-bl-md border border-white/10 bg-[#171c29] text-gray-100"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words leading-6">
                            {message.content}
                          </p>
                        </div>

                        <div
                          className={`mt-1.5 flex items-center gap-1.5 px-1 text-[11px] text-gray-500 ${
                            isMine
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <span>
                            {formatMessageTime(
                              message.created_at
                            )}
                          </span>

                          {isMine &&
                            (message.is_read ? (
                              <CheckCheck
                                size={14}
                                className="text-blue-400"
                                aria-label="Read"
                              />
                            ) : (
                              <Check
                                size={14}
                                aria-label="Sent"
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {otherUserTyping && (
                <div className="flex justify-start pt-1">
                  <div className="rounded-2xl rounded-bl-md border border-white/10 bg-[#171c29] px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-purple-300 [animation-delay:-0.3s]" />

                      <span className="h-2 w-2 animate-bounce rounded-full bg-purple-300 [animation-delay:-0.15s]" />

                      <span className="h-2 w-2 animate-bounce rounded-full bg-purple-300" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form
          onSubmit={sendMessage}
          className="shrink-0 border-t border-white/10 bg-[#101520] p-4 md:px-6"
        >
          <div className="mx-auto flex max-w-4xl items-end gap-3">
            <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/25 px-4 py-2 transition focus-within:border-purple-400/50">
              <textarea
                ref={inputRef}
                value={messageText}
                onChange={(event) =>
                  handleMessageTextChange(
                    event.target.value
                  )
                }
                onBlur={() => {
                  void stopTyping();
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder={`Message ${studentName}...`}
                maxLength={5000}
                rows={1}
                className="max-h-36 min-h-11 w-full resize-none bg-transparent py-2 outline-none placeholder:text-gray-600"
              />

              <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-2 text-xs text-gray-600">
                <span>
                  Enter to send • Shift + Enter for a
                  new line
                </span>

                <span>
                  {messageText.length}/5000
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                sending || !messageText.trim()
              }
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              {sending ? (
                <LoaderCircle
                  size={21}
                  className="animate-spin"
                />
              ) : (
                <Send size={21} />
              )}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}