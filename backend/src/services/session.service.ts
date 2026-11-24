import type { Response } from "express";
import prisma from "../config/prisma";
import { env } from "../config/env";
import { generateSessionToken, hashToken } from "../utils/crypto";
import type { AuthUser } from "../types/express";

export function setSessionCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(env.sessionCookieName, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSecure ? "none" : "lax",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(env.sessionCookieName, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSecure ? "none" : "lax",
    path: "/",
  });
}

export async function createSession(userId: string, res: Response) {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + env.sessionDays * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: { userId, tokenHash, expiresAt },
  });

  setSessionCookie(res, token, expiresAt);
  return session;
}

export async function revokeSessionByToken(token: string | undefined) {
  if (!token) return;
  const tokenHash = hashToken(token);
  await prisma.session.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllUserSessions(userId: string) {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function resolveSession(token: string | undefined): Promise<{
  user: AuthUser;
  sessionId: string;
} | null> {
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: { guestSession: true },
      },
    },
  });

  if (!session || session.revokedAt) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });
    return null;
  }

  const { user } = session;

  if (user.accountType === "GUEST") {
    const guest = user.guestSession;
    if (!guest || guest.claimedAt || guest.expiresAt.getTime() < Date.now()) {
      await prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      return null;
    }
  }

  return {
    sessionId: session.id,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      accountType: user.accountType,
      authProvider: user.authProvider,
      createdAt: user.createdAt,
      guestExpiresAt: user.guestSession?.expiresAt ?? null,
    },
  };
}

export function publicUser(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    accountType: user.accountType,
    authProvider: user.authProvider,
    createdAt: user.createdAt,
    guestExpiresAt: user.guestExpiresAt ?? null,
  };
}
