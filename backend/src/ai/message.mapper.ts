import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";

type Message = {
  role: string;
  content: string;
};

export const mapToLangChainMessages = (messages: Message[]): BaseMessage[] => {
    return messages.map((message) => {
        switch(message.role) {
            case "human":
                return new HumanMessage(message.content);
            
            case "ai":
                return new AIMessage(message.content);

            default:
                throw new Error(`Unknown message role: ${message.role}`);
        }
    });
}