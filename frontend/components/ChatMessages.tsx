"use client";

import { memo, useEffect, useLayoutEffect, useRef } from "react";
import { Message } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "./MarkdownRenderer";

const MessageRow = memo(
  ({ msg }: { msg: Message }) => (
    <div className={cn("flex", msg.role === "human" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "chat-message max-w-[80%] rounded-2xl px-4 py-2",
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

function getScrollRoot(el: HTMLElement | null): HTMLElement | null {
  return (el?.closest("[data-scroll-root]") as HTMLElement) ?? null;
}

function isNearBottom(el: HTMLElement, threshold = 80): boolean {
  return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
}

function scrollToBottom(el: HTMLElement, behavior: ScrollBehavior = "smooth") {
  el.scrollTo({ top: el.scrollHeight, behavior });
}

export default function ChatMessages({ messages, isStreaming, conversationLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);
  const prevLoadingRef = useRef(conversationLoading);
  const prevMessageCountRef = useRef(messages.length);

  // Track whether user has scrolled away from the bottom
  useEffect(() => {
    const el = getScrollRoot(bottomRef.current);
    if (!el) return;
    const onScroll = () => {
      userScrolledUpRef.current = !isNearBottom(el);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // When a conversation finishes loading, jump instantly before paint
  useLayoutEffect(() => {
    if (prevLoadingRef.current && !conversationLoading) {
      const el = getScrollRoot(bottomRef.current);
      if (el) {
        userScrolledUpRef.current = false;
        scrollToBottom(el, "instant");
      }
    }
    prevLoadingRef.current = conversationLoading;
  }, [conversationLoading]);

  // When a new message is added (user sends), force-scroll regardless of position
  useLayoutEffect(() => {
    const prev = prevMessageCountRef.current;
    const curr = messages.length;
    prevMessageCountRef.current = curr;

    if (curr > prev) {
      const el = getScrollRoot(bottomRef.current);
      if (el) {
        userScrolledUpRef.current = false;
        scrollToBottom(el, "smooth");
      }
    }
  }, [messages.length]);

  // During streaming, use a MutationObserver on the scroll container so we
  // react to actual DOM height changes (not batched React state) and keep
  // the viewport pinned to the bottom in real time.
  useEffect(() => {
    if (!isStreaming) return;
    const el = getScrollRoot(bottomRef.current);
    if (!el) return;

    const observer = new MutationObserver(() => {
      if (!userScrolledUpRef.current) {
        scrollToBottom(el, "instant");
      }
    });

    observer.observe(el, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [isStreaming]);

  if (messages.length === 0 && !conversationLoading) return null;

  return (
    <div className="relative space-y-6 mt-6">
      {messages.map((msg) => (
        <MessageRow key={msg.id} msg={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
