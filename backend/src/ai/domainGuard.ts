import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const guardLlm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

/**
 * Returns true if the query is relevant to the consultant's domain.
 * Only blocks queries that are clearly unrelated (tech, finance, politics, etc.).
 */
export const isQueryRelevant = async (
  query: string,
  consultantName: string,
  allowedTopics: string[]
): Promise<boolean> => {
  const topicList = allowedTopics.join(", ");
  const result = await guardLlm.invoke([
    new SystemMessage(
      `You are a domain relevance classifier for a "${consultantName}" consultant. Answer only "yes" or "no".\n\n` +
      `The consultant's domain covers: ${topicList}.\n\n` +
      `Rules:\n` +
      `- Answer "yes" if the query is about health, wellness, the human body, symptoms, treatments, lifestyle, or anything a ${consultantName} specialist could reasonably address.\n` +
      `- Answer "yes" even if the exact topic is not listed — use semantic understanding (e.g. "hair growth" is a health/wellness topic, "OCD" is a mental health topic).\n` +
      `- Answer "no" ONLY if the query is clearly about an unrelated domain such as: programming, software, technology, finance, stock markets, politics, sports, cooking, entertainment, or general trivia.\n` +
      `- When in doubt, answer "yes".`
    ),
    new HumanMessage(query),
  ]);

  return (result.content as string).trim().toLowerCase().startsWith("yes");
};

export const buildRedirectResponse = (consultantName: string, allowedTopics: string[]): string => {
  const scope = allowedTopics.slice(0, 3).join(", ").toLowerCase();
  return (
    `I am a ${consultantName} consultant and can help you with ${scope}-related questions. ` +
    `Your question appears to be outside my area of expertise. ` +
    `Please consult the appropriate specialist for accurate guidance on that topic.`
  );
};
