"use client";

import { memo, useEffect, useRef } from "react";
import { Message } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "./MarkdownRenderer";

// ─── Static (historical) message row ────────────────────────────────────────
// Wrapped in memo with a custom comparator: only re-renders if content or
// error flag changes. During streaming, every message except the last one
// has stable props, so they are completely skipped by React's reconciler.
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
  // Only re-render when the content or streaming/error flags change.
  // This means all historical messages are frozen during streaming.
  (prev, next) =>
    prev.msg.content === next.msg.content &&
    prev.msg.streaming === next.msg.streaming &&
    prev.msg.error === next.msg.error
);
MessageRow.displayName = "MessageRow";

// ─── ChatMessages ────────────────────────────────────────────────────────────
interface ChatMessagesProps {
  messages: Message[];
  isStreaming: boolean;
  conversationLoading: boolean;
}

export default function ChatMessages({ messages, isStreaming, conversationLoading }: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Ref instead of state: scroll position tracking must never trigger a re-render
  const userScrolledUpRef = useRef(false);
  // Ensures at most one rAF scroll is queued per frame
  const scrollRafRef = useRef<number | null>(null);

  // Track whether the user has scrolled away from the bottom.
  // Using a ref avoids re-rendering ChatMessages on every scroll event.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      userScrolledUpRef.current = dist > 80;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-scroll: schedule via rAF so we scroll at most once per frame,
  // regardless of how many state updates React batches together.
  useEffect(() => {
    if (userScrolledUpRef.current) return;
    if (scrollRafRef.current !== null) return; // already queued this frame

    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      if (!userScrolledUpRef.current) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    });
  }, [messages]);

  // When a conversation loads, jump instantly and reset the scroll flag.
  useEffect(() => {
    if (conversationLoading) return;
    userScrolledUpRef.current = false;
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [conversationLoading]);

  // Cleanup pending rAF on unmount
  useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current);
    };
  }, []);

  if (messages.length === 0 && !conversationLoading) return null;

  return (
    <div ref={containerRef} className="relative space-y-6">
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
