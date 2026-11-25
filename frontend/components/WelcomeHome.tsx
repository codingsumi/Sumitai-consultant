"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, UserRound } from "lucide-react";
import AiMascot from "@/components/AiMascot";
import GuestNameModal from "@/components/GuestNameModal";

export default function WelcomeHome() {
  const router = useRouter();
  const [guestOpen, setGuestOpen] = useState(false);

  return (
    <div className="relative flex h-full min-h-0 w-full max-w-[100vw] items-center justify-center overflow-x-hidden overflow-y-auto overscroll-contain bg-[#FCFCFD] px-4 py-8 sm:px-5 sm:py-12 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="blob-orange" />
      <div className="blob-purple" />

      <div className="relative z-10 flex w-full max-w-[440px] min-w-0 flex-col items-center text-center">
        <div className="mb-4 sm:mb-6 flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-[12px]"
            style={{
              background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
              boxShadow: "0 4px 12px rgba(255,122,0,0.28)",
            }}
          >
            <Image
              src="/images/sumitai-logo.png"
              height={18}
              width={18}
              alt=""
              className="brightness-0 invert"
            />
          </div>
          <span
            className="text-[18px] font-bold tracking-tight text-[#101828]"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Sumit AI
          </span>
        </div>

        <AiMascot
          size={108}
          message="Welcome! Explore AI health consultants — as a guest or with your account."
        />

        <h1
          className="mt-6 sm:mt-8 text-[24px] sm:text-[32px] font-bold leading-tight tracking-tight text-[#101828]"
          style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
        >
          Your AI health
          <br />
          <span className="gradient-text">companion</span>
        </h1>
        <p className="mt-3 max-w-[360px] text-[13px] sm:text-[14px] leading-relaxed text-[#667085] px-1">
          Chat with specialists in Homeopathy, Ayurveda, Yoga, Nutrition, and more.
        </p>

        <div className="mt-6 sm:mt-8 flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={() => setGuestOpen(true)}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] py-3.5 text-[14px] font-semibold text-white transition hover:opacity-95 active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
              boxShadow: "0 4px 16px rgba(255,122,0,0.35)",
            }}
          >
            <UserRound className="h-4 w-4" />
            Continue as Guest
          </button>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-[#ECEEF2] bg-white py-3.5 text-[14px] font-semibold text-[#344054] transition hover:border-[#FF7A00] hover:text-[#FF7A00]"
          >
            <Mail className="h-4 w-4" />
            Login / Create Account
          </button>
        </div>

        <p className="mt-5 sm:mt-6 text-[11px] text-[#C4CAD4] px-2">
          Free to explore. Sign in anytime to keep your chats.
        </p>
      </div>

      <GuestNameModal
        open={guestOpen}
        onClose={() => setGuestOpen(false)}
        onSuccess={() => router.replace("/")}
      />
    </div>
  );
}
