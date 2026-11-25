"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { queuePendingQuestion } from "@/lib/pending-question";
import {
  recordQuestionSelection,
  type PopularQuestion,
} from "@/services/popular-questions.service";

/**
 * Shared flow for starting a chat from a popular question.
 * Reuses guest/auth + pending-question handoff into HomePage / useChat.
 */
export function useStartPopularQuestion() {
  const { user } = useAuth();
  const router = useRouter();
  const [guestOpen, setGuestOpen] = useState(false);
  const [starting, setStarting] = useState(false);

  const startQuestion = useCallback(
    async (question: PopularQuestion | { question: string; preferredConsultantSlug?: string; id?: string }) => {
      setStarting(true);
      try {
        if (question.id) {
          await recordQuestionSelection(question.id);
        }

        queuePendingQuestion({
          question: question.question,
          consultantSlug: question.preferredConsultantSlug,
        });

        if (!user) {
          setGuestOpen(true);
          return;
        }

        router.push("/");
      } finally {
        setStarting(false);
      }
    },
    [user, router]
  );

  const onGuestSuccess = useCallback(() => {
    setGuestOpen(false);
    router.replace("/");
  }, [router]);

  return {
    startQuestion,
    starting,
    guestOpen,
    setGuestOpen,
    onGuestSuccess,
  };
}
