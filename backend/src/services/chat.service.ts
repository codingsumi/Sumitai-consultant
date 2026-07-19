import prisma from "../config/prisma"
import { createConsultantChain, createStreamingConsultantChain } from "../ai/chain.factory"
import { BaseMessage } from "@langchain/core/messages"
import { Response } from "express"

// create a new chat for a consultant
export const createChat = async (consultantSlug: string) => {
    const consultant = await prisma.consultant.findFirst({
        where: {
            slug: consultantSlug,
            isActive: true
        }
    })

    if (!consultant) {
        throw new Error("Consultant not found")
    }

    return await prisma.chat.create({
        data: {
            consultantId: consultant.id
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
        throw new Error("Consultant not found")
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

    if (!consultant) throw new Error("Consultant not found");

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

// chat list
export const chatList = async () => {
    return await prisma.chat.findMany({
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
