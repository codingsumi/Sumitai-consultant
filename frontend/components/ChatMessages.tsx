"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "./MarkdownRenderer";

interface ChatMessagesProps {
  messages: Message[];
  isStreaming: boolean;
  conversationLoading: boolean;
}

export default function ChatMessages({ messages, isStreaming, conversationLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  // Detect if user scrolled away from bottom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setUserScrolledUp(distFromBottom > 80);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-scroll while streaming unless user scrolled up
  useEffect(() => {
    if (!userScrolledUp) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, userScrolledUp]);

  // Always scroll when a new conversation loads
  useEffect(() => {
    setUserScrolledUp(false);
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [conversationLoading]);

  if (messages.length === 0 && !conversationLoading) return null;

  return (
    <div ref={containerRef} className="relative space-y-6">
      {conversationLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#FAFAFA]/70">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#F97316] border-t-transparent" />
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn("flex", msg.role === "human" ? "justify-end" : "justify-start")}
        >
          <div
            className={cn(
              "max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-7",
              msg.role === "human"
                ? "bg-[#F97316] text-white"
                : "bg-white border border-[#E5E7EB] text-[#111827]"
            )}
          >
            {msg.role === "human" ? (
              <p>{msg.content}</p>
            ) : (
              <>
                {msg.error && !msg.content ? (
                  <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
                ) : (
                  <div className="relative">
                    <MarkdownRenderer content={msg.content || "\u200b"} />
                    {msg.streaming && <span className="streaming-cursor" />}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
