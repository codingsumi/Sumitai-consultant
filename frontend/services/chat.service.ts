import api from "./api";

export const createChat = async (consultant: string) => {
  const { data } = await api.post("/chat", { consultant });
  return data.data;
};

export const sendMessage = async (chatId: string, message: string) => {
  const { data } = await api.post(`/chat/${chatId}/messages`, { message });
  return data.data;
};

export const getChats = async () => {
  const { data } = await api.get("/chat/list");
  return data.data;
};

export const getChatMessages = async (chatId: string) => {
  const { data } = await api.get(`/chat/${chatId}/messages`);
  return data.data;
};

export type StreamCallbacks = {
  onToken: (token: string) => void;
  onTitle: (title: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
};

export const streamMessage = async (
  chatId: string,
  message: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/chat/${chatId}/messages/stream`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      signal,
    }
  );

  if (!res.ok || !res.body) {
    callbacks.onError("Stream request failed");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const payload = JSON.parse(line.slice(6));
        if (payload.token) callbacks.onToken(payload.token);
        else if (payload.title) callbacks.onTitle(payload.title);
        else if (payload.done) callbacks.onDone();
        else if (payload.error) callbacks.onError(payload.error);
      } catch {
        // malformed chunk — skip
      }
    }
  }
};