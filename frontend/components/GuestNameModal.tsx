"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

function errorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    return (err.response?.data?.message as string) || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

type GuestNameModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function GuestNameModal({ open, onClose, onSuccess }: GuestNameModalProps) {
  const { continueAsGuest } = useAuth();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setError("");
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Please enter your name");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await continueAsGuest(trimmed);
      onSuccess();
    } catch (err) {
      setError(errorMessage(err, "Could not start guest session"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm animate-[fadeIn_180ms_ease-out]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-name-title"
        className="relative w-full max-w-[400px] rounded-[24px] border border-[#ECEEF2] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-[modalIn_220ms_ease-out]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#9AA4B2] hover:bg-[#F7F8FA] hover:text-[#101828]"
        >
          <X className="h-4 w-4" />
        </button>

        <h2
          id="guest-name-title"
          className="text-[20px] font-semibold text-[#101828]"
          style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
        >
          What should we call you?
        </h2>
        <p className="mt-1 text-[13px] text-[#667085]">
          Jump in as a guest — no account needed. You can create one anytime.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input
            type="text"
            required
            minLength={2}
            maxLength={80}
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-[14px] border border-[#ECEEF2] bg-[#FCFCFD] px-4 py-3 text-[14px] text-[#101828] outline-none transition focus:border-[#FF7A00] focus:ring-4 focus:ring-orange-100"
          />
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || name.trim().length < 2}
            className="flex w-full items-center justify-center rounded-[14px] py-3 text-[14px] font-semibold text-white disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
              boxShadow: name.trim().length >= 2 ? "0 4px 14px rgba(255,122,0,0.35)" : "none",
            }}
          >
            {loading ? "Starting…" : "Start Chatting"}
          </button>
        </form>
      </div>
    </div>
  );
}
