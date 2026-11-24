import prisma from "../config/prisma";
import { AppError } from "../utils/errors";
import { revokeAllUserSessions } from "./session.service";
import type { AuthUser } from "../types/express";
import { publicUser } from "./session.service";

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { guestSession: true },
  });

  if (!user) throw new AppError("User not found", 404);

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

export async function updateProfile(userId: string, nameRaw: string) {
  const name = nameRaw.trim();
  if (name.length < 2 || name.length > 80) {
    throw new AppError("Name must be between 2 and 80 characters", 400);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
    include: { guestSession: true },
  });

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

export async function updateAvatar(userId: string, mimeType: string, buffer: Buffer) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(mimeType)) {
    throw new AppError("Avatar must be a JPEG, PNG, WebP, or GIF image", 400);
  }

  if (buffer.length > 500 * 1024) {
    throw new AppError("Avatar must be 500KB or smaller", 400);
  }

  const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: dataUrl },
    include: { guestSession: true },
  });

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

export async function deleteAccount(user: AuthUser) {
  await revokeAllUserSessions(user.id);
  await prisma.user.delete({ where: { id: user.id } });
}
