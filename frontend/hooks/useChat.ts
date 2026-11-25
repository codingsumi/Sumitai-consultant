import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getConsultants } from "@/services/consultant.service";
import {
  createChat,
  streamMessage,
  getChats,
  getChatMessages,
  truncateMessages,
} from "@/services/chat.service";

// Module-level consultant cache
let consultantCache: Consultant[] | null = null;

export interface Consultant {
  id: string;
  name: string;
  slug: string;
}

export interface Message {
  id: string;
  role: "human" | "ai";
  content: string;
  streaming?: boolean;
  error?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  consultant: {
    name: string;
    slug: string;
  };
}

interface UseChatOptions {
  initialChatId?: string;
  initialConsultantSlug?: string;
}

interface StreamOptions {
  /** When true, append a human message before the AI placeholder (normal send / edit). */
  appendUser?: boolean;
  /** If set, restore this draft into the input on stream error. */
  restoreDraftOnError?: string;
}

export const useChat = (options: UseChatOptions = {}) => {
  const { initialChatId, initialConsultantSlug } = options;
  const router = useRouter();

  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedConsultant, setSelectedConsultant] = useState(
    initialConsultantSlug ?? "homeopathy"
  );
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(
    initialChatId ?? null
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [chatSwitching, setChatSwitching] = useState(!!initialChatId);
  const [chatStarted, setChatStarted] = useState(!!initialChatId);

  const abortRef = useRef<AbortController | null>(null);
  const tokenBufferRef = useRef("");
  const rafRef = useRef<number | null>(null);
  const selectedConsultantRef = useRef(selectedConsultant);
  const selectedChatRef = useRef<Chat | null>(null);
  const isStreamingRef = useRef(false);
  const initialLoadDoneRef = useRef(false);

  useEffect(() => {
    selectedConsultantRef.current = selectedConsultant;
  }, [selectedConsultant]);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    tokenBufferRef.current = "";
    setIsStreaming(false);
  }, []);

  // Cleanup streaming on unmount
  useEffect(() => () => stopStream(), [stopStream]);

  const loadChats = useCallback(async () => {
    try {
      const data = await getChats();
      setChats(data);
      return data as Chat[];
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  const loadConversation = useCallback(async (chat: Chat, switching = false) => {
    try {
      stopStream();
      if (switching) setChatSwitching(true);
      setConversationLoading(true);
      setMessages([]);
      setSelectedChat(chat);
      setConversationId(chat.id);
      setSelectedConsultant(chat.consultant.slug);
      const data = await getChatMessages(chat.id);
      setMessages(data.map((m: Omit<Message, "id">, i: number) => ({ ...m, id: `loaded-${i}` })));
    } catch (error) {
      console.error(error);
    } finally {
      setConversationLoading(false);
      if (switching) setChatSwitching(false);
    }
  }, [stopStream]);

  useEffect(() => {
    if (initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;

    const initialize = async () => {
      try {
        const [fetchedConsultants, fetchedChats] = await Promise.all([
          consultantCache
            ? Promise.resolve(consultantCache)
            : getConsultants().then((d) => {
                consultantCache = d;
                return d;
              }),
          loadChats(),
        ]);
        setConsultants(fetchedConsultants);

        if (!initialConsultantSlug && fetchedConsultants.length > 0) {
          setSelectedConsultant(fetchedConsultants[0].slug);
        }

        if (initialChatId) {
          const match = (fetchedChats as Chat[]).find((c) => c.id === initialChatId);
          if (match) {
            await loadConversation(match, true);
          } else {
            setChatSwitching(false);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    initialize();
  }, [initialChatId, initialConsultantSlug, loadChats, loadConversation]);

  const handleSelectChat = useCallback(
    async (chat: Chat) => {
      window.history.replaceState(null, "", `/chat/${chat.consultant.slug}/${chat.id}`);
      await loadConversation(chat, true);
      setChatStarted(true);
    },
    [loadConversation]
  );

  const handleNewChat = useCallback(() => {
    stopStream();
    setSelectedChat(null);
    setMessages([]);
    setConversationId(null);
    setChatStarted(false);
    router.push("/", { scroll: false });
  }, [router, stopStream]);

  const runStream = useCallback(
    async (chatId: string, userText: string, opts: StreamOptions = {}) => {
      const { appendUser = true, restoreDraftOnError } = opts;
      const userMsgId = `user-${Date.now()}`;
      const aiMsgId = `ai-${Date.now()}`;
      tokenBufferRef.current = "";

      setMessages((prev) => {
        const next = [...prev];
        if (appendUser) {
          next.push({ id: userMsgId, role: "human", content: userText });
        }
        next.push({ id: aiMsgId, role: "ai", content: "", streaming: true });
        return next;
      });

      setIsStreaming(true);
      abortRef.current = new AbortController();

      const flushBuffer = () => {
        if (tokenBufferRef.current === "") {
          rafRef.current = requestAnimationFrame(flushBuffer);
          return;
        }
        const pending = tokenBufferRef.current;
        tokenBufferRef.current = "";
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, content: m.content + pending } : m))
        );
        rafRef.current = requestAnimationFrame(flushBuffer);
      };
      rafRef.current = requestAnimationFrame(flushBuffer);

      try {
        await streamMessage(
          chatId,
          userText,
          {
            onToken: (token) => {
              tokenBufferRef.current += token;
            },
            onTitle: (title) => {
              setSelectedChat((prev) => (prev ? { ...prev, title } : prev));
              setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, title } : c)));
            },
            onDone: () => {
              if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
              rafRef.current = null;
              const remaining = tokenBufferRef.current;
              tokenBufferRef.current = "";
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id !== aiMsgId) return m;
                  return { ...m, content: m.content + remaining, streaming: false };
                })
              );
              setIsStreaming(false);
              loadChats();
            },
            onError: (msg) => {
              if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
              rafRef.current = null;
              tokenBufferRef.current = "";
              console.error("Stream error:", msg);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId ? { ...m, streaming: false, error: true } : m
                )
              );
              if (restoreDraftOnError) setMessage(restoreDraftOnError);
              setIsStreaming(false);
            },
          },
          abortRef.current.signal
        );
      } catch (err) {
        // Abort during chat switch / new chat / unmount — ignore
        if (err instanceof Error && err.name === "AbortError") return;
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        tokenBufferRef.current = "";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, streaming: false, error: true } : m
          )
        );
        if (restoreDraftOnError) setMessage(restoreDraftOnError);
        setIsStreaming(false);
      }
    },
    [loadChats]
  );

  const ensureChat = useCallback(async (consultantSlug: string) => {
    let currentChat = selectedChatRef.current;
    if (!currentChat) {
      const chat = await createChat(consultantSlug);
      currentChat = chat;
      window.history.replaceState(null, "", `/chat/${chat.consultant.slug}/${chat.id}`);
      setSelectedChat(chat);
      setConversationId(chat.id);
      setChatStarted(true);
    }
    return currentChat!;
  }, []);

  const handleSendMessage = useCallback(
    async (overrideText?: string, overrideConsultant?: string) => {
      const userText = (overrideText ?? message).trim();
      const consultantSlug = overrideConsultant ?? selectedConsultantRef.current;

      if (!userText || isStreamingRef.current) return;

      const draft = userText;
      setMessage("");

      try {
        const chat = await ensureChat(consultantSlug);
        await runStream(chat.id, userText, {
          appendUser: true,
          restoreDraftOnError: draft,
        });
      } catch (error) {
        console.error(error);
        setMessage(draft);
        setIsStreaming(false);
      }
    },
    [message, ensureChat, runStream]
  );

  /** Start a brand-new chat and immediately submit the given question. */
  const startQuestionAsNewChat = useCallback(
    async (text: string, overrideConsultant?: string) => {
      const userText = text.trim();
      if (!userText || isStreamingRef.current) return;

      stopStream();
      selectedChatRef.current = null;
      setSelectedChat(null);
      setMessages([]);
      setConversationId(null);
      setChatStarted(false);

      if (overrideConsultant) {
        selectedConsultantRef.current = overrideConsultant;
        setSelectedConsultant(overrideConsultant);
      }

      const consultantSlug = overrideConsultant ?? selectedConsultantRef.current;
      setMessage("");

      try {
        const chat = await ensureChat(consultantSlug);
        await runStream(chat.id, userText, {
          appendUser: true,
          restoreDraftOnError: userText,
        });
      } catch (error) {
        console.error(error);
        setMessage(userText);
        setIsStreaming(false);
      }
    },
    [stopStream, ensureChat, runStream]
  );

  const editMessage = useCallback(
    async (messageId: string, newText: string) => {
      const text = newText.trim();
      if (!text || isStreamingRef.current) return;

      const chat = selectedChatRef.current;
      if (!chat) return;

      const idx = messages.findIndex((m) => m.id === messageId);
      if (idx < 0 || messages[idx].role !== "human") return;

      try {
        stopStream();
        await truncateMessages(chat.id, idx);
        setMessages((prev) => prev.slice(0, idx));
        await runStream(chat.id, text, {
          appendUser: true,
          restoreDraftOnError: text,
        });
      } catch (error) {
        console.error(error);
        setIsStreaming(false);
      }
    },
    [messages, stopStream, runStream]
  );

  const regenerateMessage = useCallback(
    async (aiMessageId: string) => {
      if (isStreamingRef.current) return;

      const chat = selectedChatRef.current;
      if (!chat) return;

      const idx = messages.findIndex((m) => m.id === aiMessageId);
      if (idx < 0 || messages[idx].role !== "ai") return;

      // Prefer the human message immediately before this AI turn
      let humanIdx = idx - 1;
      while (humanIdx >= 0 && messages[humanIdx].role !== "human") humanIdx--;
      if (humanIdx < 0) return;

      const userText = messages[humanIdx].content;

      try {
        stopStream();
        // Stream endpoint always appends a new human message, so truncate from
        // the preceding human turn and re-send (same path as edit).
        await truncateMessages(chat.id, humanIdx);
        setMessages((prev) => prev.slice(0, humanIdx));
        await runStream(chat.id, userText, { appendUser: true });
      } catch (error) {
        console.error(error);
        setIsStreaming(false);
      }
    },
    [messages, stopStream, runStream]
  );

  return {
    consultants,
    selectedConsultant,
    setSelectedConsultant,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    loadConversation,
    handleSelectChat,
    message,
    setMessage,
    messages,
    setMessages,
    isStreaming,
    conversationLoading,
    chatSwitching,
    conversationId,
    handleSendMessage,
    startQuestionAsNewChat,
    handleNewChat,
    chatStarted,
    editMessage,
    regenerateMessage,
  };
};
