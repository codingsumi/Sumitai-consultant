"use client";

import { memo, useEffect, useRef, useState, useCallback } from "react";
import { PillBottle, Atom, Tablets, Leaf, Apple, Brain, Stethoscope, Mic, MicOff, SendHorizonal } from "lucide-react";
import { cn } from "@/lib/utils";

type VoiceState = "idle" | "listening" | "processing";

const MAX_HEIGHT = 180;

const iconMap: Record<string, React.ElementType> = {
  homeopathy: PillBottle,
  yoga: Atom,
  allopathy: Tablets,
  ayurveda: Leaf,
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
  /** Larger home/empty-state input */
  size?: "default" | "hero";
}

function PromptBox({
  consultants,
  selectedConsultant,
  onConsultantChange,
  message,
  onMessageChange,
  loading,
  onSend,
  chatStarted,
  size = "default",
}: PromptBoxProps) {
  const isHero = size === "hero";
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composingRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");

  const stopRecognition = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setVoiceState("idle");
  }, []);

  const handleMic = useCallback(() => {
    if (voiceState !== "idle") {
      stopRecognition();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "";

    let finalTranscript = "";

    recognition.onstart = () => setVoiceState("listening");

    recognition.onresult = (e: SpeechRecognitionEventLike) => {
      let interim = "";
      finalTranscript = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      onMessageChange((finalTranscript || interim).trim());
    };

    recognition.onspeechend = () => {
      setVoiceState("processing");
      recognition.stop();
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setVoiceState("idle");
      if (finalTranscript.trim()) textareaRef.current?.focus();
    };

    recognition.onerror = () => stopRecognition();

    recognitionRef.current = recognition;
    recognition.start();
  }, [voiceState, onMessageChange, stopRecognition]);

  useEffect(() => {
    return () => stopRecognition();
  }, [stopRecognition]);

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
    <div className={cn("w-full", isHero ? "space-y-4" : "space-y-3")}>
      {/* Input bar */}
      <div
        className={cn(
          "hero-search prompt-box flex items-end gap-2 sm:gap-3 border border-[#ECEEF2] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-200 has-[:focus]:border-[#FDBA74] has-[:focus]:shadow-[0_4px_20px_rgba(255,122,0,0.12)]",
          isHero
            ? "min-h-[64px] sm:min-h-[72px] rounded-[22px] sm:rounded-[24px] px-4 sm:px-6 py-3.5 sm:py-4"
            : "rounded-[18px] sm:rounded-[20px] px-3 sm:px-5 py-2.5 sm:py-3"
        )}
      >
        <textarea
          ref={textareaRef}
          value={message}
          rows={1}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => { composingRef.current = true; }}
          onCompositionEnd={() => { composingRef.current = false; }}
          placeholder="Ask your health question..."
          enterKeyHint="send"
          disabled={loading}
          className={cn(
            "flex-1 min-w-0 resize-none bg-transparent text-[#101828] placeholder:text-[#9AA4B2] outline-none leading-relaxed disabled:opacity-70",
            isHero
              ? "py-2 text-[16px] sm:text-[17px]"
              : "py-1.5 text-[16px] sm:text-[15px]"
          )}
        />
        <div className="flex items-center gap-1.5 sm:gap-2 pb-0.5 shrink-0">
          <button
            type="button"
            onClick={handleMic}
            title={voiceState === "idle" ? "Start voice input" : "Stop recording"}
            aria-label={voiceState === "idle" ? "Start voice input" : "Stop recording"}
            className={cn(
              "flex items-center justify-center rounded-lg transition-all duration-200",
              isHero ? "h-11 w-11 sm:h-10 sm:w-10" : "h-10 w-10 sm:h-8 sm:w-8",
              voiceState === "listening" && "text-red-500 bg-red-50 animate-pulse",
              voiceState === "processing" && "text-orange-400 bg-orange-50",
              voiceState === "idle" && "text-[#9AA4B2] hover:bg-[#F7F8FA] hover:text-[#667085]"
            )}
          >
            {voiceState === "listening" ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          <button
            onClick={onSend}
            disabled={!canSend}
            aria-label="Send message"
            className={cn(
              "flex items-center justify-center rounded-[12px] text-white transition-all duration-200 disabled:opacity-35 active:scale-95",
              isHero ? "h-11 w-11 sm:h-10 sm:w-10" : "h-10 w-10 sm:h-9 sm:w-9"
            )}
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
        <div className="flex items-center justify-center gap-2 flex-wrap overflow-x-auto pb-1 scrollbar-none">
          {consultants.map(({ id, slug, name }) => {
            const Icon = iconMap[slug] ?? Stethoscope;
            return (
              <button
                key={id}
                onClick={() => onConsultantChange(slug)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium transition-all duration-200 cursor-pointer",
                  selectedConsultant === slug
                    ? "text-white shadow-sm"
                    : "bg-white text-[#667085] border border-[#ECEEF2] active:border-[#FF7A00] active:text-[#FF7A00]"
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
