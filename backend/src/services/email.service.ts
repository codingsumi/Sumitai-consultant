import { Resend } from "resend";
import { env } from "../config/env";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!env.resendApiKey) return null;
  if (!resend) resend = new Resend(env.resendApiKey);
  return resend;
}

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  const client = getResend();

  if (!client) {
    if (env.isProd) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    console.info(`[dev] OTP for ${email}: ${code}`);
    return;
  }

  const { error } = await client.emails.send({
    from: env.emailFrom,
    to: email,
    subject: "Your Sumit AI verification code",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #101828;">Sumit AI</h2>
        <p style="color: #667085;">Your verification code is:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #FF7A00;">${code}</p>
        <p style="color: #9AA4B2; font-size: 13px;">This code expires in 5 minutes. If you didn't request it, you can ignore this email.</p>
      </div>
    `,
    text: `Your Sumit AI verification code is ${code}. It expires in 5 minutes.`,
  });

  if (error) {
    console.error("Resend error:", error.message);
    throw new Error("Failed to send verification email");
  }
}
