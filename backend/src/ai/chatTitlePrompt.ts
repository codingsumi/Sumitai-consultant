import { PromptTemplate } from "@langchain/core/prompts";

export const prompt = PromptTemplate.fromTemplate(
    `Generate a concise chat title.

    Rules:
    - 3–6 words.
    - Do not use quotes.
    - No punctuation at the end.
    - Capture the user's intent.
    - Return only the title.

    User message:
    {message}`
);