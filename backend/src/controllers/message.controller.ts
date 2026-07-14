import { Request, Response, NextFunction } from "express";
import { createMessage, chatHistory } from "../services/message.service";
import { streamMessageToAi } from "../services/chat.service";
import { mapToLangChainMessages } from "../ai/message.mapper";
import { generateChatTitle } from "../services/title.service";
import { successResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../config/prisma";

export const create = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { chatId } = req.params;
  const { message } = req.body;

  const response = await createMessage(chatId, message);

  return successResponse(
    res,
    response,
    "Message created successfully",
    201
  );
});

export const chatMessages = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { chatId } = req.params;

  const response = await chatHistory(chatId);

  return successResponse(res, response, "Messages fetched successfully");
});

export const streamMessage = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { message } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { consultant: true },
    });

    if (!chat) {
      res.write(`data: ${JSON.stringify({ error: "Chat not found" })}\n\n`);
      return res.end();
    }

    // Save user message
    await prisma.message.create({ data: { chatId, role: "human", content: message } });

    // Generate title once
    if (!chat.title) {
      const title = await generateChatTitle(message);
      await prisma.chat.update({ where: { id: chatId }, data: { title } });
      res.write(`data: ${JSON.stringify({ title })}\n\n`);
    }

    // Load history and stream
    const history = await chatHistory(chatId);
    const messages = mapToLangChainMessages(history);
    const fullText = await streamMessageToAi(chat.consultant.slug, messages, res);

    // Persist AI message
    await prisma.message.create({ data: { chatId, role: "ai", content: fullText } });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Streaming failed";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
  } finally {
    res.end();
  }
};