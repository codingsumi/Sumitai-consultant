"use client";

import { useRef, useState } from "react";
import { Send, PillBottle, Atom, Tablets, Leaf, Apple, Brain, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export default function PromptBox({ consultants, selectedConsultant, onConsultantChange }: PromptBoxProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);



  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 240) + "px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Prompt input */}
      <div className="w-full rounded-2xl border border-[#FED7AA] bg-white shadow-sm focus-within:border-[#F97316] focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.07)] transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask your question..."
          rows={4}
          className="w-full resize-none bg-transparent px-5 pt-5 pb-4 text-[15px] text-[#111827] placeholder:text-[#9CA3AF] outline-none min-h-[120px] max-h-[240px]"
        />
        <div className="flex justify-end px-4 pb-4">
          <button
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-150",
              value.trim()
                ? "bg-[#F97316] text-white hover:bg-[#EA580C] hover:scale-105 shadow-md shadow-orange-200"
                : "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
            )}
            disabled={!value.trim()}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
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
