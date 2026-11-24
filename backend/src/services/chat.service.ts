import prisma from "../config/prisma"
import { createConsultantChain, createStreamingConsultantChain } from "../ai/chain.factory"
import { BaseMessage } from "@langchain/core/messages"
import { Response } from "express"
import { AppError } from "../utils/errors"

// create a new chat for a consultant owned by the authenticated user
export const createChat = async (consultantSlug: string, userId: string) => {
    const consultant = await prisma.consultant.findFirst({
        where: {
            slug: consultantSlug,
            isActive: true
        }
    })

    if (!consultant) {
        throw new AppError("Consultant not found", 404)
    }

    return await prisma.chat.create({
        data: {
            consultantId: consultant.id,
            userId,
        },
        select: {
            id: true,
            title: true,
            createdAt: true,
            consultant: {
                select: {
                    name: true,
                    slug: true
                }
            }
        }
    });
}

// send a message to the AI for a specific consultant
export const sendMessageToAi = async (consultantSlug: string, history: BaseMessage[]) => {
    const consultant = await prisma.consultant.findFirst({
        where: {
            slug: consultantSlug,
            isActive: true
        }
    })

    if (!consultant) {
        throw new AppError("Consultant not found", 404)
    }

    const chain = await createConsultantChain(consultant.systemPrompt);

    return await chain.invoke({
        messages: history
    });
}

// stream tokens to the client via SSE, returns the full accumulated text
// NOTE: domain guard is handled by the controller BEFORE this is called
export const streamMessageToAi = async (
    consultantSlug: string,
    history: BaseMessage[],
    res: Response
): Promise<string> => {
    const consultant = await prisma.consultant.findFirst({
        where: { slug: consultantSlug, isActive: true }
    });

    if (!consultant) throw new AppError("Consultant not found", 404);

    const chain = createStreamingConsultantChain(consultant.systemPrompt);

    console.log("STREAM START");
    const stream = await chain.stream({ messages: history });

    let fullText = "";
    for await (const chunk of stream) {
        // chunk.content can be a string or an array of content blocks
        const raw = chunk.content;
        const token = typeof raw === "string" ? raw : Array.isArray(raw)
            ? raw.map((b: unknown) => (typeof b === "string" ? b : (b as Record<string, unknown>)?.text ?? "")).join("")
            : "";
        if (token) {
            console.log("CHUNK:", JSON.stringify(token));
            fullText += token;
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
            // Flush immediately so the chunk is not held in a buffer
            if (typeof (res as unknown as { flush?: () => void }).flush === "function") {
                (res as unknown as { flush: () => void }).flush();
            }
        }
    }
    console.log("STREAM END");

    return fullText;
}

// chat list for a specific user
export const chatList = async (userId: string) => {
    return await prisma.chat.findMany({
        where: { userId },
        select: {
            id: true,
            title: true,
            createdAt: true,
            consultant: {
                select: {
                    name: true,
                    slug: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    })
}

export const getOwnedChat = async (chatId: string, userId: string) => {
    const chat = await prisma.chat.findFirst({
        where: { id: chatId, userId },
        include: { consultant: true },
    });

    if (!chat) {
        throw new AppError("Chat not found", 404);
    }

    return chat;
}
