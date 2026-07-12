import {ChatPromptTemplate} from "@langchain/core/prompts";

export const prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        "You are a helpful AI assistant.",
    ],
    [
        "human",
        "{query}",
    ]
]);