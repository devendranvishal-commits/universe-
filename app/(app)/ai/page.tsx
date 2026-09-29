"use client";

import Link from "next/link";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Home,
  LoaderCircle,
  Search,
  Send,
  ShoppingBag,
  Sparkles,
  Trash2,
  User,
  Users,
} from "lucide-react";

type ActiveTab = "chat" | "search";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  createdAt: string;
  isError?: boolean;
};

type ChatResponse = {
  answer?: string;
  error?: string;
  conversationId?: string;
};
type Conversation = {
  id: string;
  title: string | null;
  created_at: string;
  updated_at?: string;
};
type AISearchResultType =
  | "profile"
  | "community"
  | "housing"
  | "gig"
  | "marketplace"
  | "event";

type AISearchResult = {
  id: string;
  type: AISearchResultType;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  price: number | null;
  date: string | null;
};

type AISearchResponse = {
  answer?: string;
  query?: string;
  intent?: unknown;
  results?: AISearchResult[];
  warnings?: string[];
  error?: string;
};

const chatPrompts = [
  "Show me housing under $900.",
  "What student gigs are available?",
  "Recommend AI and startup communities.",
  "What campus events are coming up?",
];

const searchPrompts = [
  "Affordable housing near campus under $900",
  "Technology gigs paying more than $20",
  "Used bikes under $150",
  "AI communities and upcoming tech events",
];

function createMessage(
  role: ChatMessage["role"],
  content: string,
  isError = false
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
    isError,
  };
}

function createWelcomeMessage(): ChatMessage {
  return createMessage(
    "assistant",
    "Hi! I’m Universe AI. I can help you discover housing, gigs, communities, marketplace items, events, and other campus opportunities."
  );
}

export default function UniverseAIPage() {
  const [activeTab, setActiveTab] =
    useState<ActiveTab>("chat");
    const [conversationId, setConversationId] =
  useState<string | null>(null);

  const [messages, setMessages] = useState<
    ChatMessage[]
  >([]);
const [conversations, setConversations] =
  useState<Conversation[]>([]);

const [loadingConversations, setLoadingConversations] =
  useState(true);
  const [chatText, setChatText] = useState("");
  const [chatLoading, setChatLoading] =
    useState(false);

  const [searchText, setSearchText] =
    useState("");

  const [searchSummary, setSearchSummary] =
    useState("");

  const [searchResults, setSearchResults] =
    useState<AISearchResult[]>([]);

  const [searchWarnings, setSearchWarnings] =
    useState<string[]>([]);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [searchError, setSearchError] =
    useState("");

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const chatInputRef =
    useRef<HTMLTextAreaElement | null>(null);

  const searchInputRef =
    useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMessages([createWelcomeMessage()]);
  }, []);

  useEffect(() => {
  void loadConversations();
}, []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, chatLoading]);

  useEffect(() => {
    window.setTimeout(() => {
      if (activeTab === "chat") {
        chatInputRef.current?.focus();
      } else {
        searchInputRef.current?.focus();
      }
    }, 50);
  }, [activeTab]);

  async function sendChatMessage(
    event?: FormEvent<HTMLFormElement>
  ) {
    event?.preventDefault();

    const cleanMessage = chatText.trim();

    if (!cleanMessage || chatLoading) {
      return;
    }

    if (cleanMessage.length > 2000) {
      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          "Your message cannot exceed 2,000 characters.",
          true
        ),
      ]);

      return;
    }

    setMessages((current) => [
      ...current,
      createMessage("user", cleanMessage),
    ]);

    setChatText("");
    setChatLoading(true);
setChatText("");
setChatLoading(true);

const isNewConversation = !conversationId;

try {
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      body: JSON.stringify({
  message: cleanMessage,
  conversationId,
  history: messages.map((message) => ({
    role: message.role,
    content: message.content,
  })),
}),
      });

      const data =
        (await response.json()) as ChatResponse;
        if (data.conversationId) {
  setConversationId(data.conversationId);

  if (isNewConversation) {
    await loadConversations();
  }
}
      if (!response.ok) {
        throw new Error(
          data.error ||
            "Universe AI could not respond."
        );
      }

      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          data.answer?.trim() ||
            "Universe AI returned an empty response."
        ),
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          error instanceof Error
            ? error.message
            : "Universe AI could not respond.",
          true
        ),
      ]);
    } finally {
      setChatLoading(false);

      window.setTimeout(() => {
        chatInputRef.current?.focus();
      }, 50);
    }
  }
async function loadConversations() {
  setLoadingConversations(true);

  try {
    const response = await fetch(
      "/api/ai/conversations"
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Could not load conversations."
      );
    }

    setConversations(
      Array.isArray(data) ? data : []
    );
  } catch (error) {
    console.error(
      "Could not load AI conversations:",
      error
    );

    setConversations([]);
  } finally {
    setLoadingConversations(false);
  }
}

async function openConversation(
  selectedConversationId: string
) {
  if (chatLoading) {
    return;
  }

  setChatLoading(true);

  try {
    const response = await fetch(
      `/api/ai/conversations/${selectedConversationId}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Could not load this conversation."
      );
    }

    const loadedMessages: ChatMessage[] =
      Array.isArray(data)
        ? data.map(
            (message: {
              id: string;
              role: "user" | "assistant";
              content: string;
              created_at: string;
            }) => ({
              id: message.id,
              role: message.role,
              content: message.content,
              createdAt: message.created_at,
            })
          )
        : [];

    setConversationId(selectedConversationId);

    setMessages(
      loadedMessages.length > 0
        ? loadedMessages
        : [createWelcomeMessage()]
    );

    setChatText("");
    setActiveTab("chat");
  } catch (error) {
    console.error(
      "Could not open AI conversation:",
      error
    );

    setMessages((current) => [
      ...current,
      createMessage(
        "assistant",
        error instanceof Error
          ? error.message
          : "Could not open this conversation.",
        true
      ),
    ]);
  } finally {
    setChatLoading(false);
  }
}

function handleChatKeyDown(
  event: KeyboardEvent<HTMLTextAreaElement>
) {
  if (
    event.key === "Enter" &&
    !event.shiftKey
  ) {
    event.preventDefault();
    void sendChatMessage();
  }
}

 function clearConversation() {
  if (chatLoading) {
    return;
  }

  setConversationId(null);
  setMessages([createWelcomeMessage()]);
  setChatText("");
  setActiveTab("chat");

  window.setTimeout(() => {
    chatInputRef.current?.focus();
  }, 50);
}
  async function runAISearch(
    event?: FormEvent<HTMLFormElement>
  ) {
    event?.preventDefault();

    const cleanQuery = searchText.trim();

    if (!cleanQuery || searchLoading) {
      return;
    }

    if (cleanQuery.length > 500) {
      setSearchError(
        "Your search cannot exceed 500 characters."
      );

      return;
    }

    setSearchLoading(true);
    setSearchError("");
    setSearchSummary("");
    setSearchResults([]);
    setSearchWarnings([]);

    try {
      const response = await fetch(
        "/api/ai-search",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            query: cleanQuery,
          }),
        }
      );

      const data =
        (await response.json()) as AISearchResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            "AI Universal Search failed."
        );
      }

      setSearchSummary(
  data.answer?.trim() ||
    "Search completed."
);

      setSearchResults(data.results || []);
      setSearchWarnings(data.warnings || []);
    } catch (error) {
      setSearchError(
        error instanceof Error
          ? error.message
          : "AI Universal Search failed."
      );
    } finally {
      setSearchLoading(false);
    }
  }

  function useChatPrompt(prompt: string) {
    setChatText(prompt);

    window.setTimeout(() => {
      chatInputRef.current?.focus();
    }, 50);
  }

  function useSearchPrompt(prompt: string) {
    setSearchText(prompt);

    window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  }

  function formatTime(value: string) {
    return new Date(value).toLocaleTimeString(
      [],
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  return (
    <main className="min-w-0 space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#10142b] via-[#17133b] to-[#351376] p-7 md:p-10">
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-400/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] text-purple-200">
            <Sparkles size={16} />
            Universe AI
          </div>

          <h1 className="mt-5 text-4xl font-black md:text-5xl">
            Your intelligent campus workspace.
          </h1>

          <p className="mt-4 max-w-3xl leading-8 text-gray-300">
            Chat with your campus assistant or use
            natural-language search to discover real
            results from Universe.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#101520] p-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              setActiveTab("chat")
            }
            className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-4 font-black transition ${
              activeTab === "chat"
                ? "bg-white text-black"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Bot size={19} />
            AI Chat
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("search")
            }
            className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-4 font-black transition ${
              activeTab === "search"
                ? "bg-white text-black"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Search size={19} />
            AI Search
          </button>
        </div>
      </section>

      {activeTab === "chat" ? (
        <section className="grid min-w-0 gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="h-fit rounded-3xl border border-white/10 bg-[#101520] p-5">
           <h2 className="text-xl font-black">
  Conversations
</h2>

<button
  type="button"
  onClick={clearConversation}
  className="mt-4 w-full rounded-2xl bg-purple-600 px-4 py-3 font-bold"
>
  + New Chat
</button>

<div className="mt-5 space-y-2">
  {loadingConversations ? (
    <p className="text-gray-400">
      Loading...
    </p>
  ) : conversations.length === 0 ? (
    <p className="text-gray-400">
      No conversations yet.
    </p>
  ) : (
    conversations.map((conversation) => (
     <button
  key={conversation.id}
  type="button"
  onClick={() =>
    openConversation(conversation.id)
  }
  disabled={chatLoading}
  className={`w-full rounded-xl border p-3 text-left transition disabled:opacity-50 ${
    conversationId === conversation.id
      ? "border-purple-400/40 bg-purple-500/10 text-white"
      : "border-white/10 hover:bg-white/5"
  }`}
>
        {conversation.title || "New Chat"}
      </button>
    ))
  )}
</div>
          </aside>

          <section className="flex h-[calc(100vh-4rem)] min-h-[680px] min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#101520]">
            <header className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600">
                <Bot size={22} />
              </div>

              <div>
                <h2 className="font-black">
                  Universe AI
                </h2>

                <p className="text-xs text-gray-500">
                  Connected to your Universe data
                </p>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-[#0d111c] to-[#090d17] px-4 py-6 md:px-7">
              <div className="mx-auto max-w-4xl space-y-5">
                {messages.map((message) => {
                  const isUser =
                    message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {!isUser && (
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                            message.isError
                              ? "bg-red-500/15 text-red-300"
                              : "bg-purple-500/15 text-purple-300"
                          }`}
                        >
                          <Bot size={20} />
                        </div>
                      )}

                      <div
                        className={`flex max-w-[88%] flex-col md:max-w-[75%] ${
                          isUser
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            isUser
                              ? "rounded-br-md bg-gradient-to-br from-indigo-600 to-purple-600"
                              : message.isError
                                ? "rounded-bl-md border border-red-500/20 bg-red-500/10 text-red-200"
                                : "rounded-bl-md border border-white/10 bg-[#171c29] text-gray-200"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words leading-7">
                            {message.content}
                          </p>
                        </div>

                        <span className="mt-1.5 px-1 text-[11px] text-gray-600">
                          {formatTime(
                            message.createdAt
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {chatLoading && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-300">
                      <Bot size={20} />
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#171c29] px-5 py-4">
                      <LoaderCircle
                        size={19}
                        className="animate-spin text-purple-300"
                      />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <form
              onSubmit={sendChatMessage}
              className="border-t border-white/10 p-4 md:px-6"
            >
              <div className="mx-auto flex max-w-4xl items-end gap-3">
                <textarea
                  ref={chatInputRef}
                  value={chatText}
                  onChange={(event) =>
                    setChatText(
                      event.target.value
                    )
                  }
                  onKeyDown={handleChatKeyDown}
                  placeholder="Ask Universe AI..."
                  rows={2}
                  maxLength={2000}
                  disabled={chatLoading}
                  className="min-h-14 min-w-0 flex-1 resize-none rounded-2xl border border-white/10 bg-black/25 px-5 py-4 outline-none focus:border-purple-400/50"
                />

                <button
                  type="submit"
                  disabled={
                    chatLoading ||
                    !chatText.trim()
                  }
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 disabled:opacity-50"
                >
                  {chatLoading ? (
                    <LoaderCircle
                      size={20}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </form>
          </section>
        </section>
      ) : (
        <section className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#101520] p-6 md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-300">
                <Search size={23} />
              </div>

              <div>
                <h2 className="text-2xl font-black">
                  AI Universal Search
                </h2>

                <p className="text-sm text-gray-500">
                  Search using natural language
                </p>
              </div>
            </div>

            <form
              onSubmit={runAISearch}
              className="mt-6 flex flex-col gap-3 md:flex-row"
            >
              <input
                ref={searchInputRef}
                value={searchText}
                onChange={(event) =>
                  setSearchText(
                    event.target.value
                  )
                }
                placeholder="Example: Find housing near campus under $900"
                maxLength={500}
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/25 px-5 py-4 outline-none focus:border-purple-400/50"
              />

              <button
                type="submit"
                disabled={
                  searchLoading ||
                  !searchText.trim()
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-black disabled:opacity-50"
              >
                {searchLoading ? (
                  <LoaderCircle
                    size={19}
                    className="animate-spin"
                  />
                ) : (
                  <Search size={19} />
                )}

                Search
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-2">
              {searchPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() =>
                    useSearchPrompt(prompt)
                  }
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-white/10"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {searchError && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 font-semibold text-red-200">
              {searchError}
            </div>
          )}

          {searchWarnings.length > 0 && (
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-4 text-sm text-yellow-100">
              Some database sections could not be
              searched.
            </div>
          )}

          {searchSummary && (
            <div className="rounded-3xl border border-purple-400/20 bg-purple-500/10 p-6">
              <div className="flex items-start gap-3">
                <Sparkles
                  size={21}
                  className="mt-1 shrink-0 text-purple-300"
                />

                <p className="leading-7 text-purple-100">
                  {searchSummary}
                </p>
              </div>
            </div>
          )}

          {!searchLoading &&
            searchSummary &&
            searchResults.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-[#101520] p-10 text-center">
                <Building2
                  size={36}
                  className="mx-auto text-gray-600"
                />

                <h3 className="mt-4 text-2xl font-black">
                  No matching results
                </h3>

                <p className="mt-2 text-gray-400">
                  Try changing the price, category,
                  location, or search wording.
                </p>
              </div>
            )}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {searchResults.map((result) => (
              <SearchResultCard
                key={`${result.type}-${result.id}`}
                result={result}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function SearchResultCard({
  result,
}: {
  result: AISearchResult;
}) {
  const Icon = getResultIcon(result.type);
  const label = getResultLabel(result.type);

  return (
    <Link
      href={result.href}
      className="group flex min-h-56 flex-col rounded-3xl border border-white/10 bg-[#101520] p-6 transition hover:-translate-y-1 hover:border-purple-400/30 hover:bg-white/[0.06]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
          <Icon size={21} />
        </div>

        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-wider text-gray-400">
          {label}
        </span>
      </div>

      <h3 className="mt-5 text-xl font-black">
        {result.title}
      </h3>

      <p className="mt-2 text-sm font-semibold text-purple-300">
        {result.subtitle}
      </p>

      {result.description && (
        <p className="mt-3 line-clamp-3 leading-6 text-gray-400">
          {result.description}
        </p>
      )}

      <p className="mt-auto pt-5 text-sm font-black text-white">
        Open result →
      </p>
    </Link>
  );
}

function getResultIcon(
  type: AISearchResultType
) {
  switch (type) {
    case "profile":
      return User;
    case "community":
      return Users;
    case "housing":
      return Home;
    case "gig":
      return BriefcaseBusiness;
    case "marketplace":
      return ShoppingBag;
    case "event":
      return CalendarDays;
    default:
      return Search;
  }
}

function getResultLabel(
  type: AISearchResultType
) {
  switch (type) {
    case "profile":
      return "Student";
    case "community":
      return "Community";
    case "housing":
      return "Housing";
    case "gig":
      return "Gig";
    case "marketplace":
      return "Marketplace";
    case "event":
      return "Event";
    default:
      return "Result";
  }
}