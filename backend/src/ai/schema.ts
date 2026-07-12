import {z} from "zod";

export const chatSchema = z.object({
    answer: z.string(),
    disclaimer: z.string(),
    followUpQuestions: z.array(z.string()),
});