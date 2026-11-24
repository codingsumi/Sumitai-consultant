import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/apiResponse";
import { env } from "../config/env";
import {
  sendLoginOtp,
  verifyLoginOtp,
  createGuest,
  logout,
  claimGuest,
} from "../services/auth.service";
import { publicUser } from "../services/session.service";
import { AppError } from "../utils/errors";

export const sendOtpSchema = z.object({
  email: z.string().email("Valid email required"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Valid email required"),
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});

export const guestSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export const claimGuestSchema = z.object({
  email: z.string().email("Valid email required"),
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});

export const sendOtp = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { email } = req.body as z.infer<typeof sendOtpSchema>;
  const result = await sendLoginOtp(email);
  return successResponse(res, result, "Verification code sent");
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { email, code } = req.body as z.infer<typeof verifyOtpSchema>;
  const user = await verifyLoginOtp(email, code, res);
  return successResponse(res, { user }, "Signed in successfully");
});

export const guest = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { name } = req.body as z.infer<typeof guestSchema>;
  const user = await createGuest(name, res);
  return successResponse(res, { user }, "Guest session created", 201);
});

export const me = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  return successResponse(res, { user: publicUser(req.user) }, "OK");
});

export const logoutHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const token = req.cookies?.[env.sessionCookieName] as string | undefined;
  await logout(token, res);
  return successResponse(res, null, "Logged out");
});

export const claimGuestHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { email, code } = req.body as z.infer<typeof claimGuestSchema>;
  const user = await claimGuest(req.user!, email, code, res);
  return successResponse(res, { user }, "Account claimed successfully");
});
