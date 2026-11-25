"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import GuestNameModal from "@/components/GuestNameModal";
import ProfileModal from "@/components/ProfileModal";
import { useAuth } from "@/context/AuthContext";
import { useStartPopularQuestion } from "@/hooks/useStartPopularQuestion";
import { cn } from "@/lib/utils";
import {
  listPopularQuestions,
  POPULAR_QUESTION_CATEGORIES,
  type PopularQuestion,
  type PopularQuestionCategory,
} from "@/services/popular-questions.service";

type CategoryFilter = "All" | PopularQuestionCategory;

export default function PopularQuestionsPage() {
  const { user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [questions, setQuestions] = useState<PopularQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { startQuestion, starting, guestOpen, setGuestOpen, onGuestSuccess } =
    useStartPopularQuestion();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void listPopularQuestions({
      category,
      query,
    }).then((items) => {
      if (!cancelled) {
        setQuestions(items);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [category, query]);

  const categories = useMemo(
    () => ["All", ...POPULAR_QUESTION_CATEGORIES] as CategoryFilter[],
    []
  );

  return (
    <div className="flex h-full min-h-0 w-full max-w-[100vw] flex-col overflow-hidden bg-[#FCFCFD]">
      <div className="blob-orange" />
      <div className="blob-purple" />

      <AppHeader
        variant="page"
        onOpenProfile={user ? () => setProfileOpen(true) : undefined}
      />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <GuestNameModal
        open={guestOpen}
        onClose={() => setGuestOpen(false)}
        onSuccess={onGuestSuccess}
      />

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-[860px] px-4 py-6 sm:px-6 sm:py-10 pb-[max(2rem,env(safe-area-inset-bottom))]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#667085] transition hover:text-[#FF7A00]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <h1
            className="mt-4 text-[1.75rem] sm:text-[2rem] font-bold tracking-tight text-[#101828]"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Popular Questions
          </h1>
          <p className="mt-2 max-w-[560px] text-[14px] leading-relaxed text-[#667085]">
            Browse common questions people ask SumitAI. Select one to start a new
            conversation with the right specialist.
          </p>

          <div className="mt-6 flex w-full min-w-0 items-center gap-2 rounded-[14px] border border-[#ECEEF2] bg-white px-3.5 py-3 shadow-sm focus-within:border-[#FDBA74]">
            <Search className="h-4.5 w-4.5 shrink-0 text-[#9AA4B2]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              className="min-w-0 flex-1 bg-transparent text-[16px] sm:text-[14px] text-[#101828] outline-none placeholder:text-[#9AA4B2]"
              aria-label="Search questions"
            />
          </div>

          <div className="mt-4 w-full min-w-0 overflow-x-auto overscroll-x-contain pb-1 scrollbar-none">
            <div className="flex w-max gap-2">
              {categories.map((item) => {
                const active = category === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={cn(
                      "shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium transition-all",
                      active
                        ? "text-white shadow-sm"
                        : "border border-[#ECEEF2] bg-white text-[#667085] hover:border-[#FF7A00] hover:text-[#FF7A00]"
                    )}
                    style={
                      active
                        ? {
                            background:
                              "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
                            boxShadow: "0 2px 8px rgba(255,122,0,0.30)",
                          }
                        : undefined
                    }
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F97316] border-t-transparent" />
              </div>
            ) : questions.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-[#ECEEF2] bg-white px-4 py-10 text-center">
                <p className="text-[14px] font-medium text-[#344054]">No questions found</p>
                <p className="mt-1 text-[13px] text-[#9AA4B2]">
                  Try another category or clear your search.
                </p>
              </div>
            ) : (
              questions.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  disabled={starting}
                  onClick={() => void startQuestion(q)}
                  className="pq-chip flex w-full flex-col items-start gap-1.5 rounded-[16px] border border-[#ECEEF2] bg-white px-4 py-4 text-left shadow-sm transition-all active:scale-[0.99] disabled:opacity-60 sm:px-5"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#FF7A00]">
                    {q.category}
                  </span>
                  <span className="text-[14px] sm:text-[15px] font-medium leading-snug text-[#101828]">
                    {q.question}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
