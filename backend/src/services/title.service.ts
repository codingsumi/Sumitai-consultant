import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { prompt } from "../ai/chatTitlePrompt";

const titleChain = prompt
    .pipe(new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 }))
    .pipe(new StringOutputParser());

export const generateChatTitle = (firstMessage: string): Promise<string> =>
    titleChain.invoke({ message: firstMessage });