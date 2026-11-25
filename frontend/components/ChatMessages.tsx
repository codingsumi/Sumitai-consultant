"use client";

import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Copy,
  Check,
  Pencil,
  RefreshCw,
  X,
} from "lucide-react";
import { Message } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import { BRAND_IMAGE } from "@/lib/brand";
import MarkdownRenderer from "./MarkdownRenderer";

function TypingIndicator() {
  return (
    <div className="typing-indicator" aria-label="Assistant is typing">
      <span />
      <span />
      <span />
    </div>
  );
}

function MessageActions({
  onCopy,
  copied,
  onEdit,
  onRegenerate,
  showEdit,
  showRegenerate,
  disabled,
}: {
  onCopy: () => void;
  copied: boolean;
  onEdit?: () => void;
  onRegenerate?: () => void;
  showEdit?: boolean;
  showRegenerate?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="msg-actions">
      <button
        type="button"
        onClick={onCopy}
        disabled={disabled}
        className="msg-action-btn"
        title={copied ? "Copied" : "Copy"}
        aria-label={copied ? "Copied" : "Copy message"}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        <span className="msg-action-label">{copied ? "Copied" : "Copy"}</span>
      </button>
      {showEdit && onEdit && (
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          className="msg-action-btn"
          title="Edit"
          aria-label="Edit message"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span className="msg-action-label">Edit</span>
        </button>
      )}
      {showRegenerate && onRegenerate && (
        <button
          type="button"
          onClick={onRegenerate}
          disabled={disabled}
          className="msg-action-btn"
          title="Regenerate"
          aria-label="Regenerate response"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="msg-action-label">Regenerate</span>
        </button>
      )}
    </div>
  );
}

const MessageRow = memo(
  ({
    msg,
    consultantSlug: _consultantSlug,
    isStreaming,
    onEdit,
    onRegenerate,
  }: {
    msg: Message;
    consultantSlug: string;
    isStreaming: boolean;
    onEdit?: (id: string, text: string) => void;
    onRegenerate?: (id: string) => void;
  }) => {
    const [copied, setCopied] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(msg.content);
    const editRef = useRef<HTMLTextAreaElement>(null);
    const isHuman = msg.role === "human";
    const showTyping = !isHuman && !!msg.streaming && !msg.content;
    const actionsDisabled = isStreaming;

    useEffect(() => {
      if (editing && editRef.current) {
        editRef.current.focus();
        editRef.current.style.height = "auto";
        editRef.current.style.height = `${Math.min(editRef.current.scrollHeight, 180)}px`;
      }
    }, [editing]);

    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(msg.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        // clipboard may be unavailable
      }
    }, [msg.content]);

    const startEdit = () => {
      setEditText(msg.content);
      setEditing(true);
    };

    const cancelEdit = () => {
      setEditing(false);
      setEditText(msg.content);
    };

    const saveEdit = () => {
      const trimmed = editText.trim();
      if (!trimmed || !onEdit) return;
      if (trimmed === msg.content) {
        setEditing(false);
        return;
      }
      setEditing(false);
      onEdit(msg.id, trimmed);
    };

    return (
      <div
        className={cn(
          "msg-row group flex gap-2 sm:gap-3",
          isHuman ? "justify-end" : "justify-start"
        )}
      >
        {!isHuman && (
          <div
            className="msg-avatar relative mt-1 h-7 w-7 sm:h-8 sm:w-8 shrink-0 overflow-hidden rounded-full border border-[#ECEEF2] bg-white"
            aria-hidden
          >
            <Image
              src={BRAND_IMAGE}
              alt=""
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className={cn("flex min-w-0 flex-1 flex-col", isHuman ? "items-end" : "items-start")}>
          {editing ? (
            <div className="w-full max-w-full sm:max-w-[85%] space-y-2">
              <textarea
                ref={editRef}
                value={editText}
                onChange={(e) => {
                  setEditText(e.target.value);
                  const el = e.target;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    saveEdit();
                  }
                  if (e.key === "Escape") cancelEdit();
                }}
                rows={2}
                className="w-full resize-none rounded-2xl border border-[#FDBA74] bg-[#FFF4EC] px-4 py-3 text-[16px] sm:text-[15px] text-[#1C1917] outline-none focus:ring-2 focus:ring-[#FF7A00]/30"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex min-h-10 items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-medium text-[#667085] hover:bg-[#F7F8FA]"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={!editText.trim()}
                  className="min-h-10 rounded-lg px-4 py-2 text-[13px] font-medium text-white disabled:opacity-40"
                  style={{
                    background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "chat-message min-w-0",
                  isHuman
                    ? "chat-message-user max-w-[88%] sm:max-w-[72%] rounded-2xl rounded-br-sm px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-sm"
                    : "w-full max-w-full sm:max-w-[85%] rounded-2xl px-3.5 py-2 sm:px-4 bg-white border border-[#E5E7EB] text-[#111827]"
                )}
              >
                {isHuman ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : msg.error && !msg.content ? (
                  <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
                ) : showTyping ? (
                  <TypingIndicator />
                ) : (
                  <div className={msg.streaming ? "md-streaming" : undefined}>
                    <MarkdownRenderer content={msg.content || "\u200b"} />
                  </div>
                )}
              </div>

              {!editing && msg.content && !msg.streaming && (
                <MessageActions
                  onCopy={handleCopy}
                  copied={copied}
                  showEdit={isHuman}
                  showRegenerate={!isHuman}
                  onEdit={isHuman ? startEdit : undefined}
                  onRegenerate={!isHuman && onRegenerate ? () => onRegenerate(msg.id) : undefined}
                  disabled={actionsDisabled}
                />
              )}
            </>
          )}
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.msg.content === next.msg.content &&
    prev.msg.streaming === next.msg.streaming &&
    prev.msg.error === next.msg.error &&
    prev.msg.id === next.msg.id &&
    prev.consultantSlug === next.consultantSlug &&
    prev.isStreaming === next.isStreaming &&
    prev.onEdit === next.onEdit &&
    prev.onRegenerate === next.onRegenerate
);
MessageRow.displayName = "MessageRow";

interface ChatMessagesProps {
  messages: Message[];
  isStreaming: boolean;
  conversationLoading: boolean;
  consultantSlug?: string;
  onEditMessage?: (id: string, text: string) => void;
  onRegenerateMessage?: (id: string) => void;
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

export default function ChatMessages({
  messages,
  isStreaming,
  conversationLoading,
  consultantSlug = "homeopathy",
  onEditMessage,
  onRegenerateMessage,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);
  const prevLoadingRef = useRef(conversationLoading);
  const prevMessageCountRef = useRef(messages.length);

  useEffect(() => {
    const el = getScrollRoot(bottomRef.current);
    if (!el) return;
    const onScroll = () => {
      userScrolledUpRef.current = !isNearBottom(el);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

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
    <div className="relative space-y-4 sm:space-y-6 mt-2 sm:mt-6">
      {messages.map((msg) => (
        <MessageRow
          key={msg.id}
          msg={msg}
          consultantSlug={consultantSlug}
          isStreaming={isStreaming}
          onEdit={onEditMessage}
          onRegenerate={onRegenerateMessage}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
