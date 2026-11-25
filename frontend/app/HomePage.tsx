"use client";

import { useState } from "react";
import {
  Menu,
  Leaf,
  Pill,
  Dumbbell,
  Apple,
  Brain,
  FileText,
  ArrowRight,
  User,
  Stethoscope,
  Zap,
  ShieldCheck,
  Search,
  Paperclip,
  Mic,
  SendHorizonal,
  BotMessageSquare,
  Lock,
  PillBottle,
  Atom,
  Tablets,
} from "lucide-react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import PromptBox from "@/components/PromptBox";
import { useChat } from "@/hooks/useChat";
import ChatMessages from "@/components/ChatMessages";
import ProfileModal from "@/components/ProfileModal";
import { useAuth } from "@/context/AuthContext";

/* ── Data ─────────────────────────────────────────────────────── */

const heroBadges = [
  { icon: BotMessageSquare, color: "bg-orange-50", iconColor: "text-[#FF7A00]", label: "Multiple AI Experts" },
  { icon: Zap, color: "bg-blue-50", iconColor: "text-blue-600", label: "Instant Guidance" },
  { icon: Lock, color: "bg-amber-50", iconColor: "text-amber-600", label: "Secure & Private" },
];

const quickActions = [
  {
    icon: Leaf,
    emoji: "🌿",
    title: "Homeopathy",
    desc: "Natural holistic remedies",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
    slug: "homeopathy",
  },
  {
    icon: Pill,
    emoji: "💊",
    title: "Allopathy",
    desc: "Evidence-based medical guidance",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    slug: "allopathy",
  },
  {
    icon: Dumbbell,
    emoji: "🧘",
    title: "Yoga",
    desc: "Improve flexibility and wellness",
    color: "bg-violet-50",
    iconColor: "text-violet-600",
    slug: "yoga",
  },
  {
    icon: Apple,
    emoji: "🍎",
    title: "Nutrition",
    desc: "Personalized nutrition advice",
    color: "bg-rose-50",
    iconColor: "text-rose-600",
    slug: "nutrition",
  },
  {
    icon: Brain,
    emoji: "🧠",
    title: "Mental Wellness",
    desc: "Reduce stress and improve focus",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    slug: "mental-wellness",
  },
  {
    icon: FileText,
    emoji: "📄",
    title: "Analyze Report",
    desc: "Upload reports for AI analysis",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
    slug: "homeopathy",
  },
];

const popularQuestions = [
  { emoji: "🔥", label: "Best yoga for back pain" },
  { emoji: "💊", label: "Medicine for fever" },
  { emoji: "🌿", label: "Ashwagandha benefits" },
  { emoji: "🍎", label: "Diet for diabetes" },
  { emoji: "❤️", label: "Lower blood pressure naturally" },
  { emoji: "😴", label: "Improve sleep" },
];

const features = [
  {
    icon: User,
    color: "bg-orange-50",
    iconColor: "text-[#FF7A00]",
    title: "Personalized Guidance",
    desc: "Tailored recommendations based on your health profile.",
  },
  {
    icon: Stethoscope,
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Multiple AI Experts",
    desc: "Consult different healthcare approaches in one place.",
  },
  {
    icon: Zap,
    color: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "Fast & Accurate",
    desc: "Receive AI-powered responses in seconds.",
  },
  {
    icon: ShieldCheck,
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Secure & Private",
    desc: "Your conversations remain protected.",
  },
];

/* ── Component ────────────────────────────────────────────────── */

interface HomePageProps {
  initialConsultantSlug?: string;
  initialChatId?: string;
}

export default function HomePage({ initialConsultantSlug, initialChatId }: HomePageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [heroQuery, setHeroQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useAuth();

  const {
    consultants,
    selectedConsultant,
    setSelectedConsultant,
    chats,
    selectedChat,
    handleSelectChat,
    message,
    setMessage,
    handleSendMessage,
    messages,
    isStreaming,
    conversationLoading,
    chatSwitching,
    handleNewChat,
    chatStarted,
    editMessage,
    regenerateMessage,
  } = useChat({ initialChatId, initialConsultantSlug });

  const hasMessages = messages.length > 0 || conversationLoading;

  /* Send from hero search bar */
  const handleHeroSend = () => {
    if (!heroQuery.trim()) return;
    const text = heroQuery;
    setHeroQuery("");
    handleSendMessage(text);
  };

  const handleQuickAction = (slug: string, title: string) => {
    setSelectedConsultant(slug);
    handleSendMessage(`Tell me about ${title}`, slug);
  };

  const handlePopularQuestion = (label: string) => {
    handleSendMessage(label);
  };

  return (
    <div className="flex h-full w-full max-w-[100vw] overflow-hidden bg-[#FCFCFD]">
      {/* Ambient blobs */}
      <div className="blob-orange" />
      <div className="blob-purple" />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={(chat) => { handleSelectChat(chat); setSidebarOpen(false); }}
        onNewChat={handleNewChat}
        conversationLoading={conversationLoading}
        onOpenProfile={() => { setProfileOpen(true); setSidebarOpen(false); }}
      />

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

      <div className="relative flex min-w-0 w-full flex-1 flex-col lg:ml-[320px] min-h-0 z-10 overflow-x-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 flex w-full items-center justify-between gap-3 border-b border-[#ECEEF2]/80 bg-[#FCFCFD]/90 px-3 py-2.5 backdrop-blur-md pt-[max(0.625rem,env(safe-area-inset-top))]">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-[#ECEEF2] text-[#667085] shadow-sm active:scale-95 transition-all duration-200"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-1">
            <span className="truncate text-[13px] font-semibold text-[#101828]">
              {hasMessages ? (selectedChat?.title ?? "Chat") : "Sumit AI"}
            </span>
          </div>
          <div className="h-11 w-11 shrink-0" aria-hidden />
        </div>

        {user && (
          <div className="pointer-events-none absolute right-4 top-4 z-20 hidden items-center gap-2 rounded-full border border-[#ECEEF2] bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur lg:flex">
            <span className="text-[12px] font-medium text-[#344054]">{user.name}</span>
            {user.accountType === "GUEST" && (
              <span className="rounded-full bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#FF7A00]">
                Guest
              </span>
            )}
          </div>
        )}

        {/* Scroll root */}
        <div data-scroll-root className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden min-h-0 overscroll-contain">

          {/* ── CHAT SWITCHING LOADER ──────────────────── */}
          {chatSwitching ? (
            <div className="flex h-full items-center justify-center px-4">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F97316] border-t-transparent" />
                <p className="text-sm text-[#9AA4B2]">Loading conversation…</p>
              </div>
            </div>

          ) : hasMessages ? (
            /* ── CHAT VIEW ──────────────────────────────── */
            <div className="mx-auto flex min-h-full w-full max-w-[760px] flex-col px-3 pt-3 pb-2 sm:px-8 sm:py-6">
              <div className="flex-1 min-w-0">
                <ChatMessages
                  messages={messages}
                  isStreaming={isStreaming}
                  conversationLoading={conversationLoading}
                  consultantSlug={selectedConsultant}
                  onEditMessage={editMessage}
                  onRegenerateMessage={regenerateMessage}
                />
              </div>
              <div className="sticky bottom-0 z-10 bg-[#FCFCFD]/95 backdrop-blur-sm pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <PromptBox
                  consultants={consultants}
                  selectedConsultant={selectedConsultant}
                  onConsultantChange={setSelectedConsultant}
                  message={message}
                  onMessageChange={setMessage}
                  onSend={() => handleSendMessage()}
                  loading={isStreaming}
                  chatStarted={chatStarted}
                />
                <p className="mt-2 text-center text-[10px] sm:text-[11px] text-[#C4CAD4] px-2">
                  Sumit AI can make mistakes. Please verify important information.
                </p>
              </div>
            </div>

          ) : (
            /* ── HERO VIEW ──────────────────────────────── */
            <div className="mx-auto w-full max-w-[960px] min-w-0 px-4 py-6 sm:px-6 sm:py-12 md:py-16 pb-[max(2rem,env(safe-area-inset-bottom))]">

              {/* Logo icon */}
              <div className="flex justify-center mb-3 sm:mb-6">
                <div
                  className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-[14px] sm:rounded-[18px] shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
                    boxShadow: "0 8px 24px rgba(255,122,0,0.30)",
                  }}
                >
                  <Image src="/images/sumitai-logo.png" height={28} width={28} alt="Sumit AI" className="brightness-0 invert h-5 w-5 sm:h-7 sm:w-7" />
                </div>
              </div>

              {/* Heading */}
              <h1
                className="text-center font-bold leading-[1.15] tracking-tight text-[#101828] px-1 text-[1.625rem] sm:text-[clamp(32px,5vw,52px)]"
                style={{
                  fontFamily: "var(--font-jakarta), var(--font-inter), sans-serif",
                }}
              >
                How can{" "}
                <span className="gradient-text">Sumit AI</span>
                {" "}help you today?
              </h1>

              {/* Subtitle */}
              <p className="mx-auto mt-3 sm:mt-4 max-w-[660px] text-center text-[#667085] leading-[1.6] px-1 text-[13px]">
                Get personalized AI guidance across Homeopathy, Ayurveda, Allopathy, Yoga, Nutrition and Mental Wellness.
              </p>

              {/* Feature badges */}
              <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {heroBadges.map(({ icon: Icon, color, iconColor, label }) => (
                  <span
                    key={label}
                    className="flex max-w-full items-center gap-1.5 sm:gap-2 rounded-full border border-[#ECEEF2] bg-white px-2.5 sm:px-4 text-[11px] sm:text-sm font-medium text-[#344054] shadow-sm h-8 sm:h-10"
                  >
                    <div className={`flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-[10px] ${color}`}>
                      <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor}`} />
                    </div>
                    <span className="truncate">{label}</span>
                  </span>
                ))}
              </div>

              {/* ── Hero Search Bar ──────────────────────────── */}
              <div className="mt-5 sm:mt-8 space-y-3 min-w-0">
                <div
                  className="hero-search flex w-full min-w-0 items-center gap-2 sm:gap-3 rounded-[18px] sm:rounded-[22px] border border-[#ECEEF2] bg-white px-3 sm:px-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-200 h-12 sm:h-[72px]"
                >
                  <Search className="hidden h-5 w-5 shrink-0 text-[#9AA4B2] sm:block" />
                  <input
                    type="text"
                    value={heroQuery}
                    onChange={(e) => setHeroQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleHeroSend(); }}
                    placeholder="Ask your health question..."
                    enterKeyHint="send"
                    className="flex-1 min-w-0 bg-transparent text-[16px] sm:text-[15px] text-[#101828] placeholder:text-[#9AA4B2] outline-none"
                  />
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <button
                      type="button"
                      aria-label="Attach file"
                      className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-[#9AA4B2] hover:bg-[#F7F8FA] hover:text-[#667085] transition-all duration-200"
                    >
                      <Paperclip className="h-4.5 w-4.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Voice input"
                      className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-[#9AA4B2] hover:bg-[#F7F8FA] hover:text-[#667085] transition-all duration-200"
                    >
                      <Mic className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={handleHeroSend}
                      disabled={!heroQuery.trim()}
                      aria-label="Send"
                      className="flex h-10 w-10 items-center justify-center rounded-[14px] text-white transition-all duration-200 disabled:opacity-40 active:scale-95"
                      style={{
                        background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
                        boxShadow: heroQuery.trim() ? "0 4px 14px rgba(255,122,0,0.40)" : "none",
                      }}
                    >
                      <SendHorizonal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Consultant pill selector — hidden once chat has started */}
                {!chatStarted && consultants.length > 0 && (
                  <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain pb-1 scrollbar-none">
                    <div className="flex w-max min-w-full items-center justify-start sm:justify-center gap-2 px-0.5">
                      {consultants.map(({ id, slug, name }) => {
                        const iconMap: Record<string, React.ElementType> = {
                          homeopathy: PillBottle, yoga: Atom, allopathy: Tablets,
                          ayurvedic: Leaf, nutrition: Apple, "mental-wellness": Brain,
                        };
                        const Icon = iconMap[slug] ?? Stethoscope;
                        const active = selectedConsultant === slug;
                        return (
                          <button
                            key={id}
                            onClick={() => setSelectedConsultant(slug)}
                            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[12px] sm:text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                              active
                                ? "text-white shadow-sm"
                                : "bg-white text-[#667085] border border-[#ECEEF2] active:border-[#FF7A00] active:text-[#FF7A00]"
                            }`}
                            style={active ? { background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)", boxShadow: "0 2px 8px rgba(255,122,0,0.30)" } : {}}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Quick Actions ────────────────────────────── */}
              <div className="mt-7 sm:mt-10 grid w-full min-w-0 grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {quickActions.map(({ icon: Icon, title, desc, color, iconColor, slug }) => (
                  <button
                    key={title}
                    onClick={() => handleQuickAction(slug, title)}
                    className="qa-card group flex min-w-0 flex-col items-start gap-2 sm:gap-3 rounded-[14px] sm:rounded-[20px] border border-[#ECEEF2] bg-white p-3 sm:p-4 text-left shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-[0.98]"
                  >
                    <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-[10px] sm:rounded-[12px] ${color}`}>
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <p className="text-[12px] sm:text-[13px] font-semibold text-[#101828] leading-tight truncate">{title}</p>
                      <p className="mt-0.5 text-[10px] sm:text-[11px] text-[#667085] leading-snug line-clamp-2">{desc}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-[#C4CAD4] group-hover:text-[#FF7A00] transition-colors duration-200" />
                  </button>
                ))}
              </div>

              {/* ── Popular Questions ────────────────────────── */}
              <div className="mt-8 sm:mt-10">
                <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                  <h2
                    className="text-[16px] sm:text-[18px] font-semibold text-[#101828]"
                    style={{ fontFamily: "var(--font-jakarta), var(--font-inter), sans-serif" }}
                  >
                    Popular Questions
                  </h2>
                  <button className="text-[12px] sm:text-[13px] font-medium text-[#FF7A00] hover:text-[#FF5B7F] transition-colors duration-200 flex items-center gap-1 shrink-0">
                    View All <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {popularQuestions.map(({ emoji, label }) => (
                    <button
                      key={label}
                      onClick={() => handlePopularQuestion(label)}
                      className="pq-chip flex items-center gap-2 rounded-full border border-[#ECEEF2] bg-white px-3.5 py-2.5 sm:px-4 sm:py-2 text-[13px] font-medium text-[#344054] shadow-sm transition-all duration-200 active:scale-[0.98]"
                    >
                      <span>{emoji}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Feature Strip ────────────────────────────── */}
              <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {features.map(({ icon: Icon, color, iconColor, title, desc }) => (
                  <div
                    key={title}
                    className="feat-card flex flex-row sm:flex-col items-start gap-3 rounded-[16px] sm:rounded-[20px] border border-[#ECEEF2] bg-white p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${color}`}>
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[#101828]">{title}</p>
                      <p className="mt-1 text-[12px] text-[#667085] leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <p className="mt-8 sm:mt-10 text-center text-[11px] text-[#C4CAD4] px-2">
                Sumit AI can make mistakes. Please verify important health information with a qualified professional.
              </p>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
