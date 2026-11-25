import {
  POPULAR_QUESTION_CATEGORIES,
  POPULAR_QUESTIONS,
  type PopularQuestion,
  type PopularQuestionCategory,
} from "@/data/popular-questions";

export type { PopularQuestion, PopularQuestionCategory };
export { POPULAR_QUESTION_CATEGORIES };

export type PopularQuestionsFilter = {
  category?: PopularQuestionCategory | "All";
  query?: string;
  popularOnly?: boolean;
  limit?: number;
};

/**
 * Data-access layer for popular questions.
 * Currently backed by static data; swap the body of these functions
 * for API/DB retrieval later without changing UI callers.
 */
export async function listPopularQuestions(
  filter: PopularQuestionsFilter = {}
): Promise<PopularQuestion[]> {
  const { category = "All", query = "", popularOnly = false, limit } = filter;
  const normalized = query.trim().toLowerCase();

  let results = POPULAR_QUESTIONS.filter((q) => {
    if (popularOnly && !q.isPopular) return false;
    if (category !== "All" && q.category !== category) return false;
    if (!normalized) return true;
    return (
      q.question.toLowerCase().includes(normalized) ||
      q.category.toLowerCase().includes(normalized)
    );
  });

  results = [...results].sort((a, b) => {
    if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1;
    if (a.order !== b.order) return a.order - b.order;
    return a.question.localeCompare(b.question);
  });

  if (typeof limit === "number") {
    results = results.slice(0, limit);
  }

  return results;
}

export async function getPopularQuestionById(
  id: string
): Promise<PopularQuestion | null> {
  return POPULAR_QUESTIONS.find((q) => q.id === id) ?? null;
}

/**
 * Reserved for future popularity tracking / ranking.
 * No-op for the static catalog phase.
 */
export async function recordQuestionSelection(_id: string): Promise<void> {
  return;
}
