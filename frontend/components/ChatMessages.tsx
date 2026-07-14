"use client";

import { memo, useEffect, useRef } from "react";
import { Message } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "./MarkdownRenderer";

const MessageRow = memo(
  ({ msg }: { msg: Message }) => (
    <div className={cn("flex", msg.role === "human" ? "justify-end" : "justify-start")}>
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
        ) : msg.error && !msg.content ? (
          <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
        ) : (
          <div className="relative">
            <MarkdownRenderer content={msg.content || "\u200b"} />
            {msg.streaming && <span className="streaming-cursor" />}
          </div>
        )}
      </div>
    </div>
  ),
  (prev, next) =>
    prev.msg.content === next.msg.content &&
    prev.msg.streaming === next.msg.streaming &&
    prev.msg.error === next.msg.error
);
MessageRow.displayName = "MessageRow";

interface ChatMessagesProps {
  messages: Message[];
  isStreaming: boolean;
  conversationLoading: boolean;
}

export default function ChatMessages({ messages, isStreaming, conversationLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);
  const scrollRafRef = useRef<number | null>(null);

  // Track scroll position on the nearest scrollable ancestor
  useEffect(() => {
    const el = bottomRef.current?.closest("[data-scroll-root]") as HTMLElement | null;
    if (!el) return;
    const onScroll = () => {
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      userScrolledUpRef.current = dist > 80;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-scroll on new tokens, throttled to one rAF per frame
  useEffect(() => {
    if (userScrolledUpRef.current) return;
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      if (!userScrolledUpRef.current) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    });
  }, [messages]);

  // Jump to bottom instantly when a conversation finishes loading
  useEffect(() => {
    if (conversationLoading) return;
    userScrolledUpRef.current = false;
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [conversationLoading]);

  useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current);
    };
  }, []);

  if (messages.length === 0 && !conversationLoading) return null;

  return (
    <div className="relative space-y-6 mt-6">
      {conversationLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#FAFAFA]/70">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#F97316] border-t-transparent" />
        </div>
      )}

      {messages.map((msg) => (
        <MessageRow key={msg.id} msg={msg} />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
