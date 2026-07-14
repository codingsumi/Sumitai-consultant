"use client";

import { memo, useEffect, useRef } from "react";
import { PillBottle, Atom, Tablets, Leaf, Apple, Brain, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_HEIGHT = 200;

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
}

function PromptBox({ consultants, selectedConsultant, onConsultantChange, message, onMessageChange, loading, onSend }: PromptBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composingRef = useRef(false);

  // Resize textarea whenever message changes (including reset to empty)
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

  return (
    <div className="w-full space-y-3">
      <div className="w-full rounded-2xl border border-[#FED7AA] bg-white shadow-sm focus-within:border-[#F97316] focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.07)] transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={message}
          rows={1}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => { composingRef.current = true; }}
          onCompositionEnd={() => { composingRef.current = false; }}
          placeholder="Ask your question..."
          className="w-full resize-none bg-transparent px-5 py-4 text-[15px] text-[#111827] placeholder:text-[#9CA3AF] outline-none leading-relaxed"
        />
      </div>

      {/* Consultant pill selector */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {consultants.map(({ id, slug, name }) => {
          const Icon = iconMap[slug] ?? Stethoscope;
          return (
            <button
              key={id}
              onClick={() => onConsultantChange(slug)}
              className={cn(
                "flex items-center gap-3 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer",
                selectedConsultant === slug
                  ? "bg-[#F97316] text-white shadow-sm shadow-orange-200"
                  : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#F97316] hover:text-[#F97316]"
              )}
            >
              <Icon className="h-4 w-4" />
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(PromptBox);
