"use client";

import { useState } from "react";
import { Sparkles, CheckCircle2, Zap, ShieldCheck, Users2, Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import PromptBox from "@/components/PromptBox";
import { useChat } from "@/hooks/useChat";
import ChatMessages from "@/components/ChatMessages";

const heroBadges = [
  { icon: Users2, label: "Multiple AI Experts" },
  { icon: Zap, label: "Instant Guidance" },
  { icon: CheckCircle2, label: "Free to Get Started" },
];

const trustItems = [
  { icon: Users2, label: "Personalized AI Guidance" },
  { icon: Sparkles, label: "Multiple Expert Consultants" },
  { icon: ShieldCheck, label: "Fast & Secure Conversations" },
];

interface HomePageProps {
  initialConsultantSlug?: string;
  initialChatId?: string;
}

export default function HomePage({ initialConsultantSlug, initialChatId }: HomePageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  return (
    <div className="flex h-full overflow-hidden bg-[#FAFAFA]">
      <Sidebar
        activeNav={activeNav}
        onNavChange={(id) => {
          setActiveNav(id);
          setSidebarOpen(false);
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={(chat) => {
          handleSelectChat(chat);
          setSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        conversationLoading={conversationLoading}
      />

      <div className="flex flex-1 flex-col lg:ml-[280px] min-h-0">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-10 p-2 rounded-lg bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] shadow-sm transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Outer scroll container — single scrollbar on the far right */}
        <div data-scroll-root className="flex-1 overflow-y-auto min-h-0">
          <div className="mx-auto flex min-h-full w-full max-w-[750px] flex-col px-4 py-6 sm:px-8">

            {/* Message area grows to fill available space */}
            <div className="flex-1">
              {messages.length === 0 && !conversationLoading && (
                <section className="flex flex-col items-center text-center pt-2">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 rounded-full bg-[#F97316]/15 blur-2xl scale-150" />
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F97316] shadow-lg shadow-orange-200">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  <h1 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl leading-tight">
                    Your Personal AI Consultant
                  </h1>

                  <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
                    Get specialized AI guidance in Homeopathy, Ayurveda, Allopathy, and Yoga—all in one place. Choose your preferred medical approach and receive personalized, intelligent assistance within seconds.
                  </p>

                  <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                    {heroBadges.map(({ icon: Icon, label }) => (
                      <span
                        key={label}
                        className="flex items-center gap-1.5 rounded-full bg-[#FFF7ED] border border-[#FED7AA] px-3 py-1 text-xs font-medium text-[#EA580C]"
                      >
                        <Icon className="h-3 w-3" />
                        {label}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <ChatMessages
                messages={messages}
                isStreaming={isStreaming}
                conversationLoading={conversationLoading}
              />
            </div>

            {/* Sticky composer pinned to bottom of viewport via sticky */}
            <div className="sticky bottom-0 bg-[#FAFAFA] pt-4 pb-2">
              <PromptBox
                consultants={consultants}
                selectedConsultant={selectedConsultant}
                onConsultantChange={setSelectedConsultant}
                message={message}
                onMessageChange={setMessage}
                onSend={handleSendMessage}
                loading={isStreaming}
              />
              {messages.length === 0 && !conversationLoading && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-center gap-6 flex-wrap">
                    {trustItems.map(({ icon: Icon, label }) => (
                      <span key={label} className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                        <Icon className="h-3.5 w-3.5 text-[#F97316]" />
                        {label}
                      </span>
                    ))}
                  </div>
                  <p className="text-center text-xs text-[#C4C9D4]">
                    Sumit AI can make mistakes. Please verify important information.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
