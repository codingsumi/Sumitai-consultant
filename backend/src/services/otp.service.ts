import prisma from "../config/prisma";
import { env } from "../config/env";
import { AppError } from "../utils/errors";
import { generateOtpCode, hashOtp, safeEqual } from "../utils/crypto";
import { sendOtpEmail } from "./email.service";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function sendOtp(emailRaw: string): Promise<{ resendAvailableIn: number }> {
  const email = normalizeEmail(emailRaw);
  const now = new Date();

  const existing = await prisma.emailOTP.findFirst({
    where: { email, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    const elapsedMs = now.getTime() - existing.lastSentAt.getTime();
    const cooldownMs = env.otpResendCooldownSeconds * 1000;
    if (elapsedMs < cooldownMs) {
      const resendAvailableIn = Math.ceil((cooldownMs - elapsedMs) / 1000);
      throw new AppError("Please wait before requesting another code", 429, {
        resendAvailableIn,
      });
    }
  }

  const code = generateOtpCode();
  const codeHash = hashOtp(code, email);
  const expiresAt = new Date(now.getTime() + env.otpTtlMinutes * 60 * 1000);

  await prisma.$transaction([
    prisma.emailOTP.updateMany({
      where: { email, consumedAt: null },
      data: { consumedAt: now },
    }),
    prisma.emailOTP.create({
      data: {
        email,
        codeHash,
        expiresAt,
        lastSentAt: now,
        attempts: 0,
      },
    }),
  ]);

  await sendOtpEmail(email, code);

  return { resendAvailableIn: env.otpResendCooldownSeconds };
}

export async function verifyOtp(emailRaw: string, code: string): Promise<string> {
  const email = normalizeEmail(emailRaw);
  const now = new Date();

  const otp = await prisma.emailOTP.findFirst({
    where: { email, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new AppError("No active verification code. Request a new one.", 400);
  }

  if (otp.expiresAt.getTime() < now.getTime()) {
    await prisma.emailOTP.update({
      where: { id: otp.id },
      data: { consumedAt: now },
    });
    throw new AppError("Verification code has expired", 400);
  }

  if (otp.attempts >= env.otpMaxAttempts) {
    await prisma.emailOTP.update({
      where: { id: otp.id },
      data: { consumedAt: now },
    });
    throw new AppError("Too many invalid attempts. Request a new code.", 429);
  }

  const expected = hashOtp(code.trim(), email);
  if (!safeEqual(expected, otp.codeHash)) {
    await prisma.emailOTP.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    const remaining = env.otpMaxAttempts - otp.attempts - 1;
    throw new AppError("Invalid verification code", 400, { attemptsRemaining: Math.max(0, remaining) });
  }

  await prisma.emailOTP.update({
    where: { id: otp.id },
    data: { consumedAt: now },
  });

  return email;
}
