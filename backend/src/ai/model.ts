import {ChatOpenAI} from "@langchain/openai";
import { chatSchema } from "./schema";

export const llm = new ChatOpenAI({
    model: "gpt-5.5",
    temperature: 1,
}).withStructuredOutput(chatSchema);