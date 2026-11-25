import api from "./api";

export type FeedbackCategory =
  | "GENERAL"
  | "FEATURE"
  | "PROBLEM"
  | "OTHER";

export type SubmitFeedbackInput = {
  name?: string;
  email?: string;
  category: FeedbackCategory;
  message: string;
};

export async function submitFeedback(input: SubmitFeedbackInput) {
  const response = await api.post("/feedback", input);
  return response.data;
}
