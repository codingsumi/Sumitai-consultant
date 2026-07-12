import { ChatPromptTemplate } from "@langchain/core/prompts"
import prisma from "../config/prisma"
import { llm } from "../ai/model"
import { createConsultantChain } from "../ai/chain.factory"

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