import { mapToLangChainMessages } from "../ai/message.mapper";
import prisma from "../config/prisma";
import { sendMessageToAi } from "./chat.service";

export const createMessage = async (
  chatId: string,
  content: string
) => {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      consultant: true,
    },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  // Save user message
  await prisma.message.create({
    data: {
      chatId,
      role: "human",
      content,
    },
  });


  // Load complete history
  const history = await chatHistory(chatId);

  // Convert DB → LangChain Messages
  const messages = mapToLangChainMessages(history);

  // AI Response
  const aiResponse = await sendMessageToAi(
    chat.consultant.slug,
    messages
  );

  // Save AI message
  await prisma.message.create({
    data: {
      chatId,
      role: "ai",
      content: aiResponse.answer,
    },
  });

  return aiResponse;
};

export const chatHistory = async (chatId: string) => {
  return await prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: "asc",
      },
  });
}