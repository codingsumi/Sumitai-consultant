import {ChatOpenAI} from "@langchain/openai";

export const llm = new ChatOpenAI({
    model: "gpt-5.5",
    temperature: 1,
});