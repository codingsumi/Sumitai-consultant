"use client";

import { memo, useEffect, useRef } from "react";
import { PillBottle, Atom, Tablets, Leaf, Apple, Brain, Stethoscope, Paperclip, Mic, SendHorizonal } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_HEIGHT = 180;

const iconMap: Record<string, React.ElementType> = {
  homeopathy: PillBottle,
  yoga: Atom,
  allopathy: Tablets,
  ayurvedic: Leaf,
  nutrition: Apple,
  "mental-wellness": Brain,
};

interface Consultant {
  id: string;
  name: string;
  slug: string;
}

interface PromptBoxProps {
  consultants: Consultant[];
  selectedConsultant: string;
  onConsultantChange: (slug: string) => void;
  message: string;
  onMessageChange: (value: string) => void;
  loading: boolean;
  onSend: () => void;
  chatStarted?: boolean;
}

function PromptBox({ consultants, selectedConsultant, onConsultantChange, message, onMessageChange, loading, onSend, chatStarted }: PromptBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composingRef = useRef(false);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, MAX_HEIGHT);
    el.style.height = next + "px";
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  }, [message]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !composingRef.current) {
      e.preventDefault();
      if (message.trim() && !loading) onSend();
    }
  };

  const canSend = message.trim().length > 0 && !loading;

  return (
    <div className="w-full space-y-3">
      {/* Input bar */}
      <div className="hero-search flex items-end gap-3 rounded-[20px] border border-[#ECEEF2] bg-white px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={message}
          rows={1}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => { composingRef.current = true; }}
          onCompositionEnd={() => { composingRef.current = false; }}
          placeholder="Ask your health question..."
          className="flex-1 resize-none bg-transparent py-1 text-[15px] text-[#101828] placeholder:text-[#9AA4B2] outline-none leading-relaxed"
        />
        <div className="flex items-center gap-1.5 pb-0.5">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9AA4B2] hover:bg-[#F7F8FA] hover:text-[#667085] transition-all duration-200">
            <Paperclip className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9AA4B2] hover:bg-[#F7F8FA] hover:text-[#667085] transition-all duration-200">
            <Mic className="h-4 w-4" />
          </button>
          <button
            onClick={onSend}
            disabled={!canSend}
            className="flex h-9 w-9 items-center justify-center rounded-[12px] text-white transition-all duration-200 disabled:opacity-35 hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
              boxShadow: canSend ? "0 4px 12px rgba(255,122,0,0.38)" : "none",
            }}
          >
            {loading ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Consultant pill selector — hidden once chat has started */}
      {!chatStarted && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {consultants.map(({ id, slug, name }) => {
            const Icon = iconMap[slug] ?? Stethoscope;
            return (
              <button
                key={id}
                onClick={() => onConsultantChange(slug)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 cursor-pointer",
                  selectedConsultant === slug
                    ? "text-white shadow-sm"
                    : "bg-white text-[#667085] border border-[#ECEEF2] hover:border-[#FF7A00] hover:text-[#FF7A00]"
                )}
                style={
                  selectedConsultant === slug
                    ? {
                        background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
                        boxShadow: "0 2px 8px rgba(255,122,0,0.30)",
                      }
                    : {}
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(PromptBox);
