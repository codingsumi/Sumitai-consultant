import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { AppError } from "../utils/errors";
import { resolveSession } from "../services/session.service";
import { asyncHandler } from "../utils/asyncHandler";

export const attachUser = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.[env.sessionCookieName] as string | undefined;
  const resolved = await resolveSession(token);
  if (resolved) {
    req.user = resolved.user;
    req.sessionId = resolved.sessionId;
  }
  next();
});

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError("Authentication required", 401));
  }
  next();
};

export const requireGuest = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError("Authentication required", 401));
  }
  if (req.user.accountType !== "GUEST") {
    return next(new AppError("Only guest accounts can perform this action", 400));
  }
  next();
};

export const csrfOriginCheck = (req: Request, _res: Response, next: NextFunction) => {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next();
  }

  const origin = req.get("origin");
  if (!origin) return next();

  const allowed = env.frontendOrigin.split(",").map((o) => o.trim());
  if (!allowed.includes(origin)) {
    return next(new AppError("Invalid request origin", 403));
  }
  next();
};
