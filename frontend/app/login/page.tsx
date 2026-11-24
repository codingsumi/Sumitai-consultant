"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

type Step = "welcome" | "email" | "otp" | "guest";

function errorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    return (err.response?.data?.message as string) || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function LoginPage() {
  const { sendOtp, verifyOtp, continueAsGuest } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("welcome");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [guestName, setGuestName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSendOtp = async (e?: FormEvent) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await sendOtp(email.trim());
      setCooldown(result.resendAvailableIn ?? 60);
      setStep("otp");
    } catch (err) {
      const data = axios.isAxiosError(err) ? err.response?.data : null;
      if (data?.errors?.resendAvailableIn) {
        setCooldown(Number(data.errors.resendAvailableIn));
      }
      setError(errorMessage(err, "Failed to send code"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp(email.trim(), code.trim());
      router.replace("/");
    } catch (err) {
      setError(errorMessage(err, "Invalid code"));
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await continueAsGuest(guestName.trim());
      router.replace("/");
    } catch (err) {
      setError(errorMessage(err, "Could not start guest session"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FCFCFD] px-4 py-10">
      <div className="blob-orange" />
      <div className="blob-purple" />

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="mb-5 flex h-14 w-14 items-center justify-center rounded-[18px]"
            style={{
              background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
              boxShadow: "0 8px 24px rgba(255,122,0,0.30)",
            }}
          >
            <Image
              src="/images/sumitai-logo.png"
              height={28}
              width={28}
              alt="Sumit AI"
              className="brightness-0 invert"
            />
          </div>
          <h1
            className="text-[28px] font-bold tracking-tight text-[#101828]"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Sumit AI
          </h1>
          <p className="mt-2 text-[14px] text-[#667085]">
            Your AI health consultants, ready when you are.
          </p>
        </div>

        <div className="rounded-[24px] border border-[#ECEEF2] bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.06)] sm:p-8">
          {step !== "welcome" && (
            <button
              type="button"
              onClick={() => {
                setError("");
                if (step === "otp") setStep("email");
                else setStep("welcome");
              }}
              className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-[#667085] hover:text-[#101828]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}

          {step === "welcome" && (
            <div className="space-y-3">
              <h2
                className="text-[20px] font-semibold text-[#101828]"
                style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
              >
                Welcome
              </h2>
              <p className="text-[13px] leading-relaxed text-[#667085]">
                Sign in with your email or continue as a guest to start chatting with specialized AI consultants.
              </p>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] py-3 text-[14px] font-semibold text-white transition hover:opacity-95 active:scale-[0.99]"
                style={{
                  background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
                  boxShadow: "0 4px 14px rgba(255,122,0,0.35)",
                }}
              >
                <Mail className="h-4 w-4" />
                Continue with email
              </button>
              <button
                type="button"
                onClick={() => setStep("guest")}
                className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#ECEEF2] bg-white py-3 text-[14px] font-semibold text-[#344054] transition hover:border-[#FF7A00] hover:text-[#FF7A00]"
              >
                <UserRound className="h-4 w-4" />
                Continue as guest
              </button>
            </div>
          )}

          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <h2
                  className="text-[20px] font-semibold text-[#101828]"
                  style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                >
                  Enter your email
                </h2>
                <p className="mt-1 text-[13px] text-[#667085]">
                  We&apos;ll send a 6-digit code — no password needed.
                </p>
              </div>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-[14px] border border-[#ECEEF2] bg-[#FCFCFD] px-4 py-3 text-[14px] text-[#101828] outline-none transition focus:border-[#FF7A00] focus:ring-4 focus:ring-orange-100"
              />
              {error && <p className="text-[13px] text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="flex w-full items-center justify-center rounded-[14px] py-3 text-[14px] font-semibold text-white disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
                }}
              >
                {loading ? "Sending…" : "Continue"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <h2
                  className="text-[20px] font-semibold text-[#101828]"
                  style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                >
                  Check your email
                </h2>
                <p className="mt-1 text-[13px] text-[#667085]">
                  Enter the 6-digit code sent to <span className="font-medium text-[#344054]">{email}</span>
                </p>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full rounded-[14px] border border-[#ECEEF2] bg-[#FCFCFD] px-4 py-3 text-center text-[22px] font-semibold tracking-[0.4em] text-[#101828] outline-none transition focus:border-[#FF7A00] focus:ring-4 focus:ring-orange-100"
              />
              {error && <p className="text-[13px] text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="flex w-full items-center justify-center rounded-[14px] py-3 text-[14px] font-semibold text-white disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
                }}
              >
                {loading ? "Verifying…" : "Verify"}
              </button>
              <button
                type="button"
                disabled={cooldown > 0 || loading}
                onClick={() => void handleSendOtp()}
                className="w-full text-center text-[13px] font-medium text-[#FF7A00] disabled:text-[#C4CAD4]"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </button>
            </form>
          )}

          {step === "guest" && (
            <form onSubmit={handleGuest} className="space-y-4">
              <div>
                <h2
                  className="text-[20px] font-semibold text-[#101828]"
                  style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                >
                  What should we call you?
                </h2>
                <p className="mt-1 text-[13px] text-[#667085]">
                  Guests can chat with consultants. Convert to a full account anytime to keep history permanently.
                </p>
              </div>
              <input
                type="text"
                required
                minLength={2}
                maxLength={80}
                autoFocus
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-[14px] border border-[#ECEEF2] bg-[#FCFCFD] px-4 py-3 text-[14px] text-[#101828] outline-none transition focus:border-[#FF7A00] focus:ring-4 focus:ring-orange-100"
              />
              {error && <p className="text-[13px] text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading || guestName.trim().length < 2}
                className="flex w-full items-center justify-center rounded-[14px] py-3 text-[14px] font-semibold text-white disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
                }}
              >
                {loading ? "Starting…" : "Continue as guest"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
