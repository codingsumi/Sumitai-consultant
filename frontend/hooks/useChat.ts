import { useEffect, useState } from "react";
import { getConsultants } from "@/services/consultant.service";
import { createChat, sendMessage } from "@/services/chat.service";

export interface Consultant {
  id: string;
  name: string;
  slug: string;
}

export interface Message {
  role: "human" | "ai";
  content: string;
  followUpQuestions?: string[];
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

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadConsultants = async () => {
      try {
        const data = await getConsultants();
        setConsultants(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadConsultants();
  }, []);


  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);

      let currentChat = selectedChat;

      if (!currentChat) {
        const chat = await createChat(selectedConsultant);
        currentChat = chat;
        setSelectedChat(chat);
      }

      const userMessage = message;

      // Show user message immediately
      setMessages((prev) => [
        ...prev,
        {
          role: "human",
          content: userMessage,
        },
      ]);

      setMessage("");

      // AI Response
      const ai = await sendMessage(currentChat.id, userMessage);

      // Show AI message
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: ai.answer,
          followUpQuestions: ai.followUpQuestions,
        },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    consultants,
    selectedConsultant,
    setSelectedConsultant,

    chats,
    setChats,
    selectedChat,
    setSelectedChat,

    message,
    setMessage,

    messages,
    setMessages,

    loading,
    handleSendMessage,
  };
};