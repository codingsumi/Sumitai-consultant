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

  // AI Response
  const aiResponse = await sendMessageToAi(
    chat.consultant.slug,
    content
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