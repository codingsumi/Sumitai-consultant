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
    handleNewChat,
    activeNav,
    setActiveNav,
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
    <div className="flex h-full overflow-hidden bg-[#FCFCFD]">
      {/* Ambient blobs */}
      <div className="blob-orange" />
      <div className="blob-purple" />

      <Sidebar
        activeNav={activeNav}
        onNavChange={(id) => { setActiveNav(id); setSidebarOpen(false); }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={(chat) => { handleSelectChat(chat); setSidebarOpen(false); }}
        onNewChat={handleNewChat}
        conversationLoading={conversationLoading}
      />

      <div className="relative flex flex-1 flex-col lg:ml-[320px] min-h-0 z-10">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-20 p-2 rounded-xl bg-white border border-[#ECEEF2] text-[#667085] hover:text-[#101828] shadow-sm transition-all duration-200"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Scroll root */}
        <div data-scroll-root className="flex-1 overflow-y-auto min-h-0">

          {/* ── CHAT VIEW ─────────────────────────────────────── */}
          {hasMessages ? (
            <div className="mx-auto flex min-h-full w-full max-w-[760px] flex-col px-4 py-6 sm:px-8">
              <div className="flex-1">
                <ChatMessages
                  messages={messages}
                  isStreaming={isStreaming}
                  conversationLoading={conversationLoading}
                />
              </div>
              <div className="sticky bottom-0 bg-[#FCFCFD] pt-4 pb-3">
                <PromptBox
                  consultants={consultants}
                  selectedConsultant={selectedConsultant}
                  onConsultantChange={setSelectedConsultant}
                  message={message}
                  onMessageChange={setMessage}
                  onSend={handleSendMessage}
                  loading={isStreaming}
                />
                <p className="mt-2 text-center text-[11px] text-[#C4CAD4]">
                  Sumit AI can make mistakes. Please verify important information.
                </p>
              </div>
            </div>

          ) : (
            /* ── HERO VIEW ──────────────────────────────────── */
            <div className="mx-auto w-full max-w-[960px] px-6 py-12 sm:py-16">

              {/* Logo icon */}
              <div className="flex justify-center mb-6">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-[18px] shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
                    boxShadow: "0 8px 24px rgba(255,122,0,0.30)",
                  }}
                >
                  <Image src="/images/sumitai-logo.png" height={28} width={28} alt="Sumit AI" className="brightness-0 invert" />
                </div>
              </div>

              {/* Heading */}
              <h1
                className="text-center font-bold leading-tight tracking-tight text-[#101828]"
                style={{
                  fontFamily: "var(--font-jakarta), var(--font-inter), sans-serif",
                  fontSize: "clamp(32px, 5vw, 52px)",
                }}
              >
                How can{" "}
                <span className="gradient-text">Sumit AI</span>
                {" "}help you today?
              </h1>

              {/* Subtitle */}
              <p
                className="mx-auto mt-4 text-center text-[#667085] leading-[1.7]"
                style={{ maxWidth: 660, fontSize: 13 }}
              >
                Get personalized AI guidance across Homeopathy, Ayurveda, Allopathy, Yoga, Nutrition and Mental Wellness.
              </p>

              {/* Feature badges */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {heroBadges.map(({ icon: Icon, color, iconColor, label }) => (
                  <span
                    key={label}
                    className="flex items-center gap-2 rounded-full border border-[#ECEEF2] bg-white px-4 text-sm font-medium text-[#344054] shadow-sm"
                    style={{ height: 40 }}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded-[12px] ${color}`}>
                      <Icon className={`h-4 w-4 ${iconColor}`} />
                    </div>
                    {label}
                  </span>
                ))}
              </div>

              {/* ── Hero Search Bar ──────────────────────────── */}
              <div className="mt-8 space-y-3">
                <div
                  className="hero-search flex items-center gap-3 rounded-[22px] border border-[#ECEEF2] bg-white px-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-200"
                  style={{ height: 72 }}
                >
                  <Search className="h-5 w-5 shrink-0 text-[#9AA4B2]" />
                  <input
                    type="text"
                    value={heroQuery}
                    onChange={(e) => setHeroQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleHeroSend(); }}
                    placeholder="Ask your health question..."
                    className="flex-1 bg-transparent text-[15px] text-[#101828] placeholder:text-[#9AA4B2] outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button className="flex h-9 w-9 items-center justify-center rounded-xl text-[#9AA4B2] hover:bg-[#F7F8FA] hover:text-[#667085] transition-all duration-200">
                      <Paperclip className="h-4.5 w-4.5" />
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-xl text-[#9AA4B2] hover:bg-[#F7F8FA] hover:text-[#667085] transition-all duration-200">
                      <Mic className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={handleHeroSend}
                      disabled={!heroQuery.trim()}
                      className="flex h-10 w-10 items-center justify-center rounded-[14px] text-white transition-all duration-200 disabled:opacity-40 hover:scale-105 active:scale-95"
                      style={{
                        background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
                        boxShadow: heroQuery.trim() ? "0 4px 14px rgba(255,122,0,0.40)" : "none",
                      }}
                    >
                      <SendHorizonal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Consultant pill selector */}
                {consultants.length > 0 && (
                  <div className="flex items-center justify-center gap-2 flex-wrap">
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
                          className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                            active
                              ? "text-white shadow-sm"
                              : "bg-white text-[#667085] border border-[#ECEEF2] hover:border-[#FF7A00] hover:text-[#FF7A00]"
                          }`}
                          style={active ? { background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)", boxShadow: "0 2px 8px rgba(255,122,0,0.30)" } : {}}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Quick Actions ────────────────────────────── */}
              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {quickActions.map(({ icon: Icon, emoji, title, desc, color, iconColor, slug }) => (
                  <button
                    key={title}
                    onClick={() => handleQuickAction(slug, title)}
                    className="qa-card group flex flex-col items-start gap-3 rounded-[20px] border border-[#ECEEF2] bg-white p-4 text-left shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${color}`}>
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#101828] leading-tight">{title}</p>
                      <p className="mt-0.5 text-[11px] text-[#667085] leading-snug">{desc}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-[#C4CAD4] group-hover:text-[#FF7A00] transition-colors duration-200" />
                  </button>
                ))}
              </div>

              {/* ── Popular Questions ────────────────────────── */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-[18px] font-semibold text-[#101828]"
                    style={{ fontFamily: "var(--font-jakarta), var(--font-inter), sans-serif" }}
                  >
                    Popular Questions
                  </h2>
                  <button className="text-[13px] font-medium text-[#FF7A00] hover:text-[#FF5B7F] transition-colors duration-200 flex items-center gap-1">
                    View All <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {popularQuestions.map(({ emoji, label }) => (
                    <button
                      key={label}
                      onClick={() => handlePopularQuestion(label)}
                      className="pq-chip flex items-center gap-2 rounded-full border border-[#ECEEF2] bg-white px-4 py-2 text-[13px] font-medium text-[#344054] shadow-sm transition-all duration-200"
                    >
                      <span>{emoji}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Feature Strip ────────────────────────────── */}
              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {features.map(({ icon: Icon, color, iconColor, title, desc }) => (
                  <div
                    key={title}
                    className="feat-card flex flex-col gap-3 rounded-[20px] border border-[#ECEEF2] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${color}`}>
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#101828]">{title}</p>
                      <p className="mt-1 text-[12px] text-[#667085] leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <p className="mt-10 text-center text-[11px] text-[#C4CAD4]">
                Sumit AI can make mistakes. Please verify important health information with a qualified professional.
              </p>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
