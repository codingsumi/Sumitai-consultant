import { ChatPromptTemplate } from "@langchain/core/prompts"
import prisma from "../config/prisma"
import { llm } from "../ai/model"

export const sendMessageToAi = async(consultantSlug: string, message: string) => {
    const consultant = await prisma.consultant.findUnique({
        where: {
            slug: consultantSlug
        }
    })

    if(!consultant) {
        throw new Error("Consultant not found")
    }

    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            consultant.systemPrompt
        ],
        [
            "human",
            "{message}"
        ]
    ]);

    const chain = prompt.pipe(llm);

    return await chain.invoke({
        message
    });
}