"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
}

export default function ChatMessages({
  messages,
  loading,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            "flex",
            message.role === "human"
              ? "justify-end"
              : "justify-start"
          )}
        >
          <div
            className={cn(
              "max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-7",
              message.role === "human"
                ? "bg-[#F97316] text-white"
                : "bg-white border border-[#E5E7EB] text-[#111827]"
            )}
          >
            <p>{message.content}</p>

            {message.followUpQuestions &&
              message.followUpQuestions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {message.followUpQuestions.map((question) => (
                    <button
                      key={question}
                      className="rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-3 py-1 text-xs text-[#EA580C]"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#9CA3AF]">
            Thinking...
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}