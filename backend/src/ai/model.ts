import {ChatOpenAI} from "@langchain/openai";
import { chatSchema } from "./schema";

// Structured output for metadata (disclaimer, followUpQuestions)
export const llm = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 1,
}).withStructuredOutput(chatSchema);

// Plain streaming model for the answer text
export const streamingLlm = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 1,
    streaming: true,
});