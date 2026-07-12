import api from "./api";

export const createChat = async (consultant: string) => {
  const { data } = await api.post("/chat", {
    consultant,
  });

  return data.data;
};

export const sendMessage = async (chatId: string, message: string) => {
  const { data } = await api.post(`/chat/${chatId}/messages`,
    {
      message,
    }
  );

  return data.data;
};