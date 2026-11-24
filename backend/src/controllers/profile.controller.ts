import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import {
  getProfile,
  updateProfile,
  updateAvatar,
  deleteAccount,
} from "../services/profile.service";
import { clearSessionCookie } from "../services/session.service";
import { AppError } from "../utils/errors";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export const get = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const profile = await getProfile(req.user!.id);
  return successResponse(res, { user: profile }, "OK");
});

export const patch = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { name } = req.body as z.infer<typeof updateProfileSchema>;
  const profile = await updateProfile(req.user!.id, name);
  return successResponse(res, { user: profile }, "Profile updated");
});

export const uploadAvatar = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const file = req.file;
  if (!file) {
    throw new AppError("Avatar file is required", 400);
  }
  const profile = await updateAvatar(req.user!.id, file.mimetype, file.buffer);
  return successResponse(res, { user: profile }, "Avatar updated");
});

export const remove = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  await deleteAccount(req.user!);
  clearSessionCookie(res);
  return successResponse(res, null, "Account deleted");
});
