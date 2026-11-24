function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
  cookieSecure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
  sessionCookieName: "sumitai_session",
  sessionDays: Number(process.env.SESSION_DAYS ?? 30),
  guestSessionDays: Number(process.env.GUEST_SESSION_DAYS ?? 30),
  otpPepper: process.env.OTP_PEPPER ?? process.env.SESSION_SECRET ?? "dev-otp-pepper-change-me",
  sessionSecret: process.env.SESSION_SECRET ?? "dev-session-secret-change-me",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "Sumit AI <onboarding@resend.dev>",
  otpTtlMinutes: 5,
  otpResendCooldownSeconds: 60,
  otpMaxAttempts: 5,
};

export function assertProdSecrets() {
  if (!env.isProd) return;
  required("SESSION_SECRET");
  required("OTP_PEPPER");
  required("RESEND_API_KEY");
  required("FRONTEND_ORIGIN");
}
