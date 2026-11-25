"use client";

import Image from "next/image";
import { BRAND_IMAGE } from "@/lib/brand";

type AiMascotProps = {
  size?: number;
  message?: string;
};

export default function AiMascot({
  size = 120,
  message = "Hi! I’m Sumit — ready when you are.",
}: AiMascotProps) {
  return (
    <div className="mascot-wrap flex flex-col items-center">
      <div className="mascot-float relative" style={{ width: size, height: size }}>
        <div className="mascot-glow absolute inset-0 rounded-full" />
        <Image
          src={BRAND_IMAGE}
          alt="Sumit AI mascot"
          width={size}
          height={size}
          priority
          className="relative z-[1] h-full w-full object-contain drop-shadow-sm"
        />
      </div>
      {message && (
        <div className="mascot-bubble relative mt-4 max-w-[280px] rounded-[18px] border border-[#ECEEF2] bg-white px-4 py-3 text-center text-[13px] leading-relaxed text-[#344054] shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          {message}
          <span className="mascot-bubble-tail" aria-hidden />
        </div>
      )}
    </div>
  );
}
