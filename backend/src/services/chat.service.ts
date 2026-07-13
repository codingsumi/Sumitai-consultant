import prisma from "../config/prisma"
import { createConsultantChain } from "../ai/chain.factory"
import { BaseMessage } from "@langchain/core/messages"

// create a new chat for a consultant
export const createChat = async(consultantSlug: string) => {
    const consultant = await prisma.consultant.findFirst({
        where: {
            slug: consultantSlug,
            isActive: true
        }
    })

    if(!consultant) {
        throw new Error("Consultant not found")
    }

    return await prisma.chat.create({
        data: {
            consultantId: consultant.id
        },
        select: {
            id: true
        }
    });
}


// send a message to the AI for a specific consultant
export const sendMessageToAi = async(consultantSlug: string, history: BaseMessage[]) => {
    const consultant = await prisma.consultant.findFirst({
        where: {
            slug: consultantSlug,
            isActive: true
        }
    })

    if(!consultant) {
        throw new Error("Consultant not found")
    }

    const chain = await createConsultantChain(consultant.systemPrompt);

    return await chain.invoke({
        messages: history
    });
}

// chat list
export const chatList = async() => {
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
