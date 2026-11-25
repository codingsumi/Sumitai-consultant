import prisma from "../config/prisma";
import type { FeedbackCategory } from "@prisma/client";

export type CreateFeedbackInput = {
  name?: string;
  email?: string;
  category: FeedbackCategory;
  message: string;
  userId?: string;
};

export function createFeedback(input: CreateFeedbackInput) {
  return prisma.feedback.create({
    data: {
      name: input.name,
      email: input.email,
      category: input.category,
      message: input.message,
      userId: input.userId,
    },
    select: {
      id: true,
      createdAt: true,
    },
  });
}
