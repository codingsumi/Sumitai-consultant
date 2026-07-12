import api from "./api";

export const createChat = async (consultant: string) => {
  const response = await api.post("/chat", {
    consultant,
  });

  return response.data.data;
};

export const sendMessage = async (
  chatId: string,
  message: string
) => {
  const response = await api.post(
    `/chat/${chatId}/messages`,
    {
      message,
    }
  );

  return response.data.data;
};