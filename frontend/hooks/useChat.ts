import { useEffect, useState } from "react";
import { getConsultants } from "@/services/consultant.service";
import { createChat, sendMessage } from "@/services/chat.service";

export interface Consultant {
  id: string;
  name: string;
  slug: string;
}

export const useChat = () => {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedConsultant, setSelectedConsultant] = useState("homeopathy");
  const [chatId, setChatId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<
    {
      role: "human" | "ai";
      content: string;
    }[]
  >([]);

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

    let currentChatId = chatId;

    if (!currentChatId) {
      const chat = await createChat(selectedConsultant);
      currentChatId = chat.id;
      setChatId(chat.id);
    }

    const userMessage = message;

    setMessages((prev) => [
      ...prev,
      {
        role: "human",
        content: userMessage,
      },
    ]);

    setMessage("");

    const ai = await sendMessage(
      currentChatId,
      userMessage
    );

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        content: ai.answer,
      },
    ]);
  } finally {
    setLoading(false);
  }
};

  return {
    consultants,
    selectedConsultant,
    setSelectedConsultant,
    message,
    setMessage,
    handleSendMessage,
    messages,
    loading
  };
};