"use client";

import { FormEvent, useState } from "react";
import axios from "axios";
import {
  submitFeedback,
  type FeedbackCategory,
} from "@/services/feedback.service";

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: "GENERAL", label: "General Feedback" },
  { value: "FEATURE", label: "Feature Suggestion" },
  { value: "PROBLEM", label: "Report a Problem" },
  { value: "OTHER", label: "Other" },
];

function errorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    return (err.response?.data?.message as string) || "Could not send feedback.";
  }
  if (err instanceof Error) return err.message;
  return "Could not send feedback.";
}

export default function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<FeedbackCategory | "">("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    category?: string;
    message?: string;
    email?: string;
  }>({});

  const validate = () => {
    const next: typeof fieldErrors = {};
    if (!category) next.category = "Please choose a feedback category.";
    if (!message.trim()) next.message = "Message is required.";
    else if (message.trim().length < 10)
      next.message = "Please write at least 10 characters.";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email or leave it blank.";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await submitFeedback({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        category: category as FeedbackCategory,
        message: message.trim(),
      });
      setSuccess(true);
      setName("");
      setEmail("");
      setCategory("");
      setMessage("");
      setFieldErrors({});
    } catch (err) {
      setSuccess(false);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-left">
          <span className="mb-1.5 block text-[13px] font-medium text-[#344054]">
            Name <span className="text-[#9AA4B2]">(optional)</span>
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            className="w-full rounded-[12px] border border-[#ECEEF2] bg-white px-3.5 py-3 text-[16px] sm:text-[14px] text-[#101828] outline-none transition focus:border-[#FDBA74]"
            placeholder="Your name"
            autoComplete="name"
          />
        </label>

        <label className="block text-left">
          <span className="mb-1.5 block text-[13px] font-medium text-[#344054]">
            Email <span className="text-[#9AA4B2]">(optional)</span>
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[12px] border border-[#ECEEF2] bg-white px-3.5 py-3 text-[16px] sm:text-[14px] text-[#101828] outline-none transition focus:border-[#FDBA74]"
            placeholder="you@example.com"
            autoComplete="email"
          />
          {fieldErrors.email && (
            <span className="mt-1 block text-[12px] text-red-500">{fieldErrors.email}</span>
          )}
        </label>
      </div>

      <label className="block text-left">
        <span className="mb-1.5 block text-[13px] font-medium text-[#344054]">
          Feedback category <span className="text-red-500">*</span>
        </span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as FeedbackCategory | "")}
          className="w-full rounded-[12px] border border-[#ECEEF2] bg-white px-3.5 py-3 text-[16px] sm:text-[14px] text-[#101828] outline-none transition focus:border-[#FDBA74]"
          required
        >
          <option value="" disabled>
            Select a category
          </option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {fieldErrors.category && (
          <span className="mt-1 block text-[12px] text-red-500">{fieldErrors.category}</span>
        )}
      </label>

      <label className="block text-left">
        <span className="mb-1.5 block text-[13px] font-medium text-[#344054]">
          Message <span className="text-red-500">*</span>
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          maxLength={2000}
          className="w-full resize-y rounded-[12px] border border-[#ECEEF2] bg-white px-3.5 py-3 text-[16px] sm:text-[14px] text-[#101828] outline-none transition focus:border-[#FDBA74]"
          placeholder="Share your thoughts, ideas, or issues…"
          required
        />
        {fieldErrors.message && (
          <span className="mt-1 block text-[12px] text-red-500">{fieldErrors.message}</span>
        )}
      </label>

      {error && (
        <div className="rounded-[12px] border border-red-100 bg-red-50 px-3.5 py-3 text-[13px] text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-[12px] border border-emerald-100 bg-emerald-50 px-3.5 py-3 text-[13px] text-emerald-700">
          Thanks — your feedback was submitted successfully.
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex min-h-12 w-full items-center justify-center rounded-[14px] px-4 py-3 text-[14px] font-semibold text-white transition disabled:opacity-60 sm:w-auto sm:min-w-[180px]"
        style={{
          background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
          boxShadow: loading ? "none" : "0 4px 14px rgba(255,122,0,0.35)",
        }}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Sending…
          </span>
        ) : (
          "Send feedback"
        )}
      </button>
    </form>
  );
}
