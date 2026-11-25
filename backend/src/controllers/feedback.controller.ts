import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { createFeedback } from "../services/feedback.service";

export const createFeedbackSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  email: z.string().trim().email().max(254).optional(),
  category: z.enum(["GENERAL", "FEATURE", "PROBLEM", "OTHER"]),
  message: z.string().trim().min(10).max(2000),
});

export const create = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const body = req.body as z.infer<typeof createFeedbackSchema>;
    const feedback = await createFeedback({
      ...body,
      userId: req.user?.id,
    });
    return successResponse(res, feedback, "Feedback submitted", 201);
  }
);
