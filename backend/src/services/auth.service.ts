import type { Response } from "express";
import prisma from "../config/prisma";
import { env } from "../config/env";
import { AppError } from "../utils/errors";
import { sendOtp, verifyOtp } from "./otp.service";
import {
  createSession,
  publicUser,
  revokeAllUserSessions,
  revokeSessionByToken,
  clearSessionCookie,
} from "./session.service";
import type { AuthUser } from "../types/express";

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "User";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
    .slice(0, 80) || "User";
}

export async function sendLoginOtp(email: string) {
  return sendOtp(email);
}

export async function verifyLoginOtp(emailRaw: string, code: string, res: Response) {
  const email = await verifyOtp(emailRaw, code);

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: displayNameFromEmail(email),
        accountType: "REGISTERED",
        authProvider: "EMAIL_OTP",
      },
    });
  } else if (user.accountType === "GUEST") {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        accountType: "REGISTERED",
        authProvider: "EMAIL_OTP",
        email,
      },
    });
  }

  await createSession(user.id, res);

  return publicUser({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    accountType: user.accountType,
    authProvider: user.authProvider,
    createdAt: user.createdAt,
    guestExpiresAt: null,
  });
}

export async function createGuest(nameRaw: string, res: Response) {
  const name = nameRaw.trim();
  if (name.length < 2 || name.length > 80) {
    throw new AppError("Name must be between 2 and 80 characters", 400);
  }

  const expiresAt = new Date(Date.now() + env.guestSessionDays * 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      name,
      accountType: "GUEST",
      authProvider: "GUEST",
      guestSession: {
        create: { expiresAt },
      },
    },
    include: { guestSession: true },
  });

  await createSession(user.id, res);

  return publicUser({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    accountType: user.accountType,
    authProvider: user.authProvider,
    createdAt: user.createdAt,
    guestExpiresAt: user.guestSession?.expiresAt ?? null,
  });
}

export async function logout(token: string | undefined, res: Response) {
  await revokeSessionByToken(token);
  clearSessionCookie(res);
}

export async function claimGuest(
  guest: AuthUser,
  emailRaw: string,
  code: string,
  res: Response
) {
  if (guest.accountType !== "GUEST") {
    throw new AppError("Only guest accounts can be claimed", 400);
  }

  const email = await verifyOtp(emailRaw, code);
  const existing = await prisma.user.findUnique({ where: { email } });

  let targetUserId: string;

  if (existing && existing.id !== guest.id) {
    // Merge guest chats into the existing registered account
    await prisma.$transaction(async (tx) => {
      await tx.chat.updateMany({
        where: { userId: guest.id },
        data: { userId: existing.id },
      });

      await tx.guestSession.updateMany({
        where: { userId: guest.id },
        data: { claimedAt: new Date() },
      });

      await tx.session.updateMany({
        where: { userId: guest.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      await tx.user.delete({ where: { id: guest.id } });
    });

    targetUserId = existing.id;
  } else {
    const upgraded = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: guest.id },
        data: {
          email,
          accountType: "REGISTERED",
          authProvider: "EMAIL_OTP",
        },
      });

      await tx.guestSession.updateMany({
        where: { userId: guest.id },
        data: { claimedAt: new Date() },
      });

      await tx.session.updateMany({
        where: { userId: guest.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      return user;
    });

    targetUserId = upgraded.id;
  }

  await revokeAllUserSessions(targetUserId);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: targetUserId } });
  await createSession(user.id, res);

  return publicUser({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    accountType: user.accountType,
    authProvider: user.authProvider,
    createdAt: user.createdAt,
    guestExpiresAt: null,
  });
}
