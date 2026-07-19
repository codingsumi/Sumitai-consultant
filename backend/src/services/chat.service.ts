import prisma from "../config/prisma"
import { createConsultantChain, createStreamingConsultantChain } from "../ai/chain.factory"
import { isQueryRelevant, buildRedirectResponse } from "../ai/domainGuard"
import { BaseMessage, HumanMessage } from "@langchain/core/messages"
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

const getLastUserQuery = (history: BaseMessage[]): string => {
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i] instanceof HumanMessage) {
            return history[i].content as string;
        }
    }
    return "";
};

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

    const allowedTopics = consultant.allowedTopics as string[];
    const userQuery = getLastUserQuery(history);

    const relevant = await isQueryRelevant(userQuery, consultant.name, allowedTopics);
    if (!relevant) {
        const redirectText = buildRedirectResponse(consultant.name, allowedTopics);
        return { answer: redirectText, disclaimer: "", followUpQuestions: [] };
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
    const stream = await chain.stream({ messages: history });

    let fullText = "";
    for await (const chunk of stream) {
        const token = chunk.content as string;
        if (token) {
            fullText += token;
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
    }

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
