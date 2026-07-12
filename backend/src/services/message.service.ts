import prisma from "../config/prisma";

export const createHumanMessage = async (
  chatId: string,
  content: string
) => {
  const chat = await prisma.chat.findUnique({
    where: {
      id: chatId,
    },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  return await prisma.message.create({
    data: {
      chatId,
      role: "human",
      content,
    },
  });
};