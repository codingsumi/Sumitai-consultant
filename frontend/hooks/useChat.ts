import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getConsultants } from "@/services/consultant.service";
import { createChat, streamMessage, getChats, getChatMessages } from "@/services/chat.service";

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
  const [activeNav, setActiveNavState] = useState<string>("home");

  const abortRef = useRef<AbortController | null>(null);
  const tokenBufferRef = useRef("");
  const rafRef = useRef<number | null>(null);
  // Keep refs in sync for use inside async callbacks
  const selectedConsultantRef = useRef(selectedConsultant);
  const selectedChatRef = useRef<Chat | null>(null);
  const initialLoadDoneRef = useRef(false);

  useEffect(() => {
    selectedConsultantRef.current = selectedConsultant;
  }, [selectedConsultant]);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

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

  const loadConversation = useCallback(async (chat: Chat) => {
    try {
      setConversationLoading(true);
      setSelectedChat(chat);
      setConversationId(chat.id);
      setSelectedConsultant(chat.consultant.slug);
      const data = await getChatMessages(chat.id);
      setMessages(data.map((m: Omit<Message, "id">, i: number) => ({ ...m, id: `loaded-${i}` })));
    } catch (error) {
      console.error(error);
    } finally {
      setConversationLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;

    const initialize = async () => {
      try {
        const [fetchedConsultants, fetchedChats] = await Promise.all([
          getConsultants(),
          loadChats(),
        ]);
        setConsultants(fetchedConsultants);

        // Set default selected consultant to first from DB if no initial slug
        if (!initialConsultantSlug && fetchedConsultants.length > 0) {
          setSelectedConsultant(fetchedConsultants[0].slug);
        }

        if (initialChatId) {
          const match = (fetchedChats as Chat[]).find((c) => c.id === initialChatId);
          if (match) {
            await loadConversation(match);
            setActiveNavState("chats");
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    initialize();
  }, [initialChatId, initialConsultantSlug, loadChats, loadConversation]);

  const handleSelectChat = useCallback(async (chat: Chat) => {
    router.replace(`/chat/${chat.consultant.slug}/${chat.id}`, { scroll: false });
    await loadConversation(chat);
    setActiveNavState("chats");
  }, [router, loadConversation]);

  const handleNewChat = useCallback(() => {
    abortRef.current?.abort();
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    tokenBufferRef.current = "";
    setSelectedChat(null);
    setMessages([]);
    setConversationId(null);
    setIsStreaming(false);
    setActiveNavState("home");
    router.push("/", { scroll: false });
  }, [router]);

  const setActiveNav = (nav: string) => setActiveNavState(nav);

  // Accept optional overrides so callers can pass fresh values without relying on state timing
  const handleSendMessage = useCallback(async (overrideText?: string, overrideConsultant?: string) => {
    const userText = (overrideText ?? message).trim();
    const consultantSlug = overrideConsultant ?? selectedConsultantRef.current;

    if (!userText || isStreaming) return;

    setMessage("");

    let currentChat = selectedChatRef.current;
    if (!currentChat) {
      const chat = await createChat(consultantSlug);
      currentChat = chat;
      // Update URL first so the route matches before we touch any state.
      // history.replaceState avoids a Next.js navigation entirely — no remount.
      window.history.replaceState(null, "", `/chat/${chat.consultant.slug}/${chat.id}`);
      setSelectedChat(chat);
      setConversationId(chat.id);
    }

    const chatId = currentChat!.id;
    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = `ai-${Date.now()}`;
    tokenBufferRef.current = "";

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "human", content: userText },
      { id: aiMsgId, role: "ai", content: "", streaming: true },
    ]);

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
        prev.map((m) =>
          m.id === aiMsgId ? { ...m, content: m.content + pending } : m
        )
      );
      rafRef.current = requestAnimationFrame(flushBuffer);
    };
    rafRef.current = requestAnimationFrame(flushBuffer);

    await streamMessage(
      chatId,
      userText,
      {
        onToken: (token) => {
          tokenBufferRef.current += token;
        },
        onTitle: (title) => {
          setSelectedChat((prev) => prev ? { ...prev, title } : prev);
          setChats((prev) =>
            prev.map((c) => (c.id === chatId ? { ...c, title } : c))
          );
        },
        onDone: () => {
          if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
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
          tokenBufferRef.current = "";
          console.error("Stream error:", msg);
          setMessages((prev) =>
            prev.map((m) => m.id === aiMsgId ? { ...m, streaming: false, error: true } : m)
          );
          setIsStreaming(false);
        },
      },
      abortRef.current.signal
    );
  }, [message, isStreaming, loadChats]);

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
    conversationId,
    handleSendMessage,
    handleNewChat,
    activeNav,
    setActiveNav,
  };
};
