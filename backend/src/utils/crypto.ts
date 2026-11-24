import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { env } from "../config/env";

export function hashToken(token: string): string {
  return createHash("sha256").update(`${env.sessionSecret}:${token}`).digest("hex");
}

export function hashOtp(code: string, email: string): string {
  const normalized = email.trim().toLowerCase();
  return createHash("sha256").update(`${env.otpPepper}:${normalized}:${code}`).digest("hex");
}

export function generateOtpCode(): string {
  const n = randomBytes(4).readUInt32BE(0) % 1_000_000;
  return n.toString().padStart(6, "0");
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
