import { ChatPromptTemplate } from "@langchain/core/prompts"
import { llm } from "./model";

export const createConsultantChain = async(systemPrompt: string) => {
 const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", "{messages}"]
 ]);

 return prompt.pipe(llm);
}