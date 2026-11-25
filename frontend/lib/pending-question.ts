const STORAGE_KEY = "sumitai_pending_question";

export type PendingQuestion = {
  question: string;
  consultantSlug?: string;
};

export function queuePendingQuestion(payload: PendingQuestion): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

export function consumePendingQuestion(): PendingQuestion | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    const parsed = JSON.parse(raw) as PendingQuestion;
    if (!parsed?.question || typeof parsed.question !== "string") return null;
    return {
      question: parsed.question.trim(),
      consultantSlug:
        typeof parsed.consultantSlug === "string"
          ? parsed.consultantSlug
          : undefined,
    };
  } catch {
    return null;
  }
}

export function peekPendingQuestion(): PendingQuestion | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingQuestion;
    if (!parsed?.question) return null;
    return parsed;
  } catch {
    return null;
  }
}
