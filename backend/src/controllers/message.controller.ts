import { Request, Response, NextFunction } from "express";
import { createMessage, chatHistory } from "../services/message.service";
import { streamMessageToAi } from "../services/chat.service";
import { isQueryRelevant, buildRedirectResponse } from "../ai/domainGuard";
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
  const chatId = req.params.chatId as string;
  const { message } = req.body;

  try {
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });

    if (!chat) {
      res.status(404).json({ error: "Chat not found" });
      return;
    }

    const consultant = await prisma.consultant.findUnique({ where: { id: chat.consultantId } });

    if (!consultant) {
      res.status(404).json({ error: "Consultant not found" });
      return;
    }

    // ── Domain guard runs BEFORE opening the SSE stream ──────────────────
    // Avoids a blocking LLM call after flushHeaders() which causes the
    // browser to receive no bytes until the guard resolves, killing streaming.
    const allowedTopics = consultant.allowedTopics as string[];
    const relevant = await isQueryRelevant(message, consultant.name, allowedTopics);

    // ── Open SSE only after all blocking work is done ──────────────────
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    // Save user message
    await prisma.message.create({ data: { chatId, role: "human", content: message } });

    // Generate title once
    if (!chat.title) {
      const title = await generateChatTitle(message);
      await prisma.chat.update({ where: { id: chatId }, data: { title } });
      res.write(`data: ${JSON.stringify({ title })}\n\n`);
    }

    // ── Out-of-scope: word-by-word stream so the UI still animates ────────
    if (!relevant) {
      const redirectText = buildRedirectResponse(consultant.name, allowedTopics);
      for (const word of redirectText.split(" ")) {
        res.write(`data: ${JSON.stringify({ token: word + " " })}\n\n`);
      }
      await prisma.message.create({ data: { chatId, role: "ai", content: redirectText } });
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return;
    }

    // ── In-scope: stream AI response token by token ─────────────────────
    const history = await chatHistory(chatId);
    const messages = mapToLangChainMessages(history);
    const fullText = await streamMessageToAi(consultant.slug, messages, res);

    await prisma.message.create({ data: { chatId, role: "ai", content: fullText } });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Streaming failed";
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: errMsg })}\n\n`);
    } else {
      res.status(500).json({ error: errMsg });
    }
  } finally {
    res.end();
  }
};