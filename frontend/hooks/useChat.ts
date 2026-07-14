import { useCallback, useEffect, useRef, useState } from "react";
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

export const useChat = () => {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedConsultant, setSelectedConsultant] = useState("homeopathy");
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [activeNav, setActiveNavState] = useState<string>("home");

  const abortRef = useRef<AbortController | null>(null);

  // Buffer for incoming tokens — flushed to React state via rAF, not on every token
  const tokenBufferRef = useRef("");
  const rafRef = useRef<number | null>(null);
  const streamingIdRef = useRef<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const [consultants] = await Promise.all([getConsultants(), loadChats()]);
        setConsultants(consultants);
      } catch (error) {
        console.error(error);
      }
    };
    initialize();
  }, []);

  const loadChats = async () => {
    try {
      const data = await getChats();
      setChats(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadConversation = async (chat: Chat) => {
    try {
      setConversationLoading(true);
      setSelectedChat(chat);
      const data = await getChatMessages(chat.id);
      setMessages(data.map((m: Omit<Message, "id">, i: number) => ({ ...m, id: `loaded-${i}` })));
      setConversationId(chat.id);
    } catch (error) {
      console.error(error);
    } finally {
      setConversationLoading(false);
    }
  };

  const handleNewChat = () => {
    abortRef.current?.abort();
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    tokenBufferRef.current = "";
    setSelectedChat(null);
    setMessages([]);
    setConversationId(null);
    setActiveNavState("home");
  };

  const setActiveNav = (nav: string) => setActiveNavState(nav);

  const updateStreamingMessage = useCallback((id: string, patch: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || isStreaming) return;

    const userText = message;
    setMessage("");

    let currentChat = selectedChat;
    if (!currentChat) {
      const chat = await createChat(selectedConsultant);
      currentChat = chat;
      setSelectedChat(chat);
      setConversationId(chat.id);
    }

    const chatId = currentChat!.id;
    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = `ai-${Date.now()}`;
    streamingIdRef.current = aiMsgId;
    tokenBufferRef.current = "";

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "human", content: userText },
      { id: aiMsgId, role: "ai", content: "", streaming: true },
    ]);

    setIsStreaming(true);
    abortRef.current = new AbortController();

    // Schedule a rAF loop that drains the token buffer into React state.
    // This decouples the network token rate from the React render rate —
    // tokens accumulate in the ref between frames and are committed once per frame.
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
        // Tokens go into the ref only — zero setState calls here
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
          // Cancel the rAF loop, flush any remaining buffer synchronously
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
          updateStreamingMessage(aiMsgId, { streaming: false, error: true });
          setIsStreaming(false);
        },
      },
      abortRef.current.signal
    );
  };

  return {
    consultants,
    selectedConsultant,
    setSelectedConsultant,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    loadConversation,
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
