import prisma from "../config/prisma"
import { createConsultantChain } from "../ai/chain.factory"

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
export const sendMessageToAi = async(consultantSlug: string, message: string) => {
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
        message
    });
}