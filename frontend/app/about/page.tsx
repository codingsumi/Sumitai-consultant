"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BotMessageSquare,
  Languages,
  Lock,
  Mic,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  Zap,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import FeedbackForm from "@/components/FeedbackForm";
import ProfileModal from "@/components/ProfileModal";
import { useAuth } from "@/context/AuthContext";
import { getConsultantMeta } from "@/lib/consultant-meta";
import { getConsultants } from "@/services/consultant.service";

type Consultant = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

const FEATURES = [
  {
    icon: User,
    title: "Personalized Guidance",
    desc: "Tailored recommendations based on the consultant you choose and the conversation you start.",
  },
  {
    icon: Stethoscope,
    title: "Multiple AI Experts",
    desc: "Switch between Homeopathy, Yoga, Allopathy, Ayurveda, Nutrition, and Mental Wellness.",
  },
  {
    icon: Zap,
    title: "Fast & Accurate Responses",
    desc: "Streamed AI replies so you can read guidance as it is generated.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private Conversations",
    desc: "Chats are tied to your guest or registered session and managed through your account.",
  },
  {
    icon: Languages,
    title: "Multilingual Conversations",
    desc: "Consultants detect your language and respond in the same language, including Hindi and Hinglish.",
  },
  {
    icon: Mic,
    title: "Audio Transcription",
    desc: "Use the microphone in the chat input to dictate questions with browser speech recognition.",
  },
  {
    icon: MessageSquareText,
    title: "Natural Language Interaction",
    desc: "Ask questions in everyday language — no special commands required.",
  },
  {
    icon: BotMessageSquare,
    title: "AI-Powered Responses",
    desc: "Each expert mode uses a specialist system prompt scoped to its domain.",
  },
];

export default function AboutPage() {
  const { user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [expertsLoading, setExpertsLoading] = useState(true);
  const [expertsError, setExpertsError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void getConsultants()
      .then((data: Consultant[]) => {
        if (!cancelled) setConsultants(data);
      })
      .catch(() => {
        if (!cancelled) setExpertsError("Could not load AI experts right now.");
      })
      .finally(() => {
        if (!cancelled) setExpertsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 w-full max-w-[100vw] flex-col overflow-hidden bg-[#FCFCFD]">
      <div className="blob-orange" />
      <div className="blob-purple" />

      <AppHeader
        variant="page"
        onOpenProfile={user ? () => setProfileOpen(true) : undefined}
      />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-[860px] px-4 py-6 sm:px-6 sm:py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#667085] transition hover:text-[#FF7A00]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* Section 1 */}
          <section className="mt-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#FF7A00]">
              About SumitAI
            </p>
            <h1
              className="mt-2 text-[1.75rem] sm:text-[2.1rem] font-bold tracking-tight text-[#101828]"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              Making helpful AI conversations more accessible
            </h1>
            <p className="mt-3 max-w-[640px] text-[14px] sm:text-[15px] leading-relaxed text-[#667085]">
              SumitAI is an AI-powered assistant designed to make information, guidance, and
              everyday conversations more accessible through intelligent AI experiences. Start as
              a guest or with an account, pick a specialist consultant, and ask in your own words.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mt-10 sm:mt-12">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#FF7A00]" />
              <h2
                className="text-[1.25rem] font-bold text-[#101828]"
                style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
              >
                AI Experts
              </h2>
            </div>
            <p className="mt-2 text-[14px] text-[#667085]">
              Choose the consultation mode that fits your question. These experts come from the
              same configuration used in chat.
            </p>

            {expertsLoading ? (
              <div className="mt-6 flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F97316] border-t-transparent" />
              </div>
            ) : expertsError ? (
              <p className="mt-4 text-[13px] text-red-500">{expertsError}</p>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {consultants.map((c) => {
                  const meta = getConsultantMeta(c.slug);
                  const Icon = meta.icon;
                  return (
                    <div
                      key={c.id}
                      className="rounded-[16px] border border-[#ECEEF2] bg-white p-4 sm:p-5"
                    >
                      <div
                        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-[12px] ${meta.color}`}
                      >
                        <Icon className={`h-5 w-5 ${meta.iconColor}`} />
                      </div>
                      <p className="text-[15px] font-semibold text-[#101828]">{c.name}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-[#667085]">
                        {c.description?.trim() || meta.blurb}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 3 */}
          <section className="mt-10 sm:mt-12">
            <h2
              className="text-[1.25rem] font-bold text-[#101828]"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              Key Features
            </h2>
            <p className="mt-2 text-[14px] text-[#667085]">
              Capabilities that are available in the product today.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-[16px] border border-[#ECEEF2] bg-white p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#FFF4EC]">
                    <Icon className="h-5 w-5 text-[#FF7A00]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[#101828]">{title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#667085]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4 */}
          <section className="mt-10 sm:mt-12">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#FF7A00]" />
              <h2
                className="text-[1.25rem] font-bold text-[#101828]"
                style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
              >
                Privacy & Security
              </h2>
            </div>
            <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-[#667085]">
              <p>
                <span className="font-semibold text-[#344054]">Guest access:</span> You can
                continue with a display name. Guest sessions are temporary and tied to the
                browser session cookie SumitAI issues.
              </p>
              <p>
                <span className="font-semibold text-[#344054]">Authenticated access:</span>{" "}
                Email OTP login creates a registered account so your profile and chats stay with
                you across visits.
              </p>
              <p>
                <span className="font-semibold text-[#344054]">Conversation management:</span>{" "}
                Chats and messages are stored for your user account so you can reopen recent
                conversations from the sidebar. Guests can later convert to a full account.
              </p>
              <p>
                <span className="font-semibold text-[#344054]">Data handling:</span> Account
                details (name, optional email/avatar) and chat history are stored to provide the
                service. Do not share sensitive credentials or emergency medical details that
                need immediate professional care.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mt-10 sm:mt-12">
            <h2
              className="text-[1.25rem] font-bold text-[#101828]"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              Our Vision
            </h2>
            <p className="mt-3 max-w-[640px] text-[14px] sm:text-[15px] leading-relaxed text-[#667085]">
              We want SumitAI to feel like a calm, trustworthy place to ask everyday health and
              wellness questions — with specialist modes that stay in their lane, language that
              feels natural, and a product that stays simple as it grows.
            </p>
          </section>

          {/* Section 6 */}
          <section className="mt-10 sm:mt-12 rounded-[20px] border border-[#ECEEF2] bg-white p-5 sm:p-7">
            <h2
              className="text-[1.25rem] font-bold text-[#101828]"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              Contact & Feedback
            </h2>
            <p className="mt-2 mb-5 text-[14px] text-[#667085]">
              Tell us what worked, what didn&apos;t, or what you&apos;d like to see next.
            </p>
            <FeedbackForm />
          </section>
        </div>
      </div>
    </div>
  );
}
