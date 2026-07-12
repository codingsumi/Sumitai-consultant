import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts"
import { llm } from "./model";

export const createConsultantChain = async(systemPrompt: string) => {
 const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
     new MessagesPlaceholder("messages"),
 ]);

 return prompt.pipe(llm);
}