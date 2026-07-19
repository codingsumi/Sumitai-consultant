import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const guardLlm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

/**
 * Returns true if the query is relevant to the consultant's allowed topics.
 */
export const isQueryRelevant = async (
  query: string,
  consultantName: string,
  allowedTopics: string[]
): Promise<boolean> => {
  const topicList = allowedTopics.join(", ");
  const result = await guardLlm.invoke([
    new SystemMessage(
      `You are a strict domain classifier. Answer only "yes" or "no".\n` +
      `Determine if the user's query is relevant to the following topics: ${topicList}.\n` +
      `Answer "yes" if it is related, "no" if it is not.`
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
