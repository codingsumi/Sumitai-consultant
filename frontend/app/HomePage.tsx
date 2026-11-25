"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import PromptBox from "@/components/PromptBox";
import ChatMessages from "@/components/ChatMessages";
import ProfileModal from "@/components/ProfileModal";
import AppHeader from "@/components/AppHeader";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import { consumePendingQuestion } from "@/lib/pending-question";

interface HomePageProps {
  initialConsultantSlug?: string;
  initialChatId?: string;
}

export default function HomePage({ initialConsultantSlug, initialChatId }: HomePageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pendingHandledRef = useRef(false);
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
    startQuestionAsNewChat,
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

  // Auto-submit questions queued from /popular-questions (or guest handoff).
  useEffect(() => {
    if (pendingHandledRef.current || initialChatId || chatSwitching) return;
    const pending = consumePendingQuestion();
    pendingHandledRef.current = true;
    if (!pending?.question) return;
    void startQuestionAsNewChat(pending.question, pending.consultantSlug);
  }, [initialChatId, chatSwitching, startQuestionAsNewChat]);

  return (
    <div className="flex h-full w-full max-w-[100vw] overflow-hidden bg-[#FCFCFD]">
      <div className="blob-orange" />
      <div className="blob-purple" />

      <Sidebar
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
        onOpenProfile={() => {
          setProfileOpen(true);
          setSidebarOpen(false);
        }}
      />

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

      <div className="relative flex min-w-0 w-full flex-1 flex-col lg:ml-[320px] min-h-0 z-10 overflow-x-hidden">
        <AppHeader
          variant="chat"
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
          showChatTitle={hasMessages}
          chatTitle={selectedChat?.title ?? "Chat"}
        />

        {user && (
          <div className="pointer-events-none absolute right-4 top-[calc(3.5rem+env(safe-area-inset-top))] z-20 mt-2 hidden items-center gap-2 rounded-full border border-[#ECEEF2] bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur lg:flex">
            <span className="text-[12px] font-medium text-[#344054]">{user.name}</span>
            {user.accountType === "GUEST" && (
              <span className="rounded-full bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#FF7A00]">
                Guest
              </span>
            )}
          </div>
        )}

        <div data-scroll-root className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden min-h-0 overscroll-contain">
          {chatSwitching ? (
            <div className="flex h-full items-center justify-center px-4">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F97316] border-t-transparent" />
                <p className="text-sm text-[#9AA4B2]">Loading conversation…</p>
              </div>
            </div>
          ) : hasMessages ? (
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
            <div className="flex min-h-full w-full items-center justify-center px-4 py-8 sm:px-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
              <div className="mx-auto w-full max-w-[840px] min-w-0">
                <div className="flex flex-col items-center text-center">
                  <h1
                    className="text-[1.5rem] sm:text-[clamp(28px,4vw,40px)] font-bold leading-tight tracking-tight text-[#101828] px-1"
                    style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                  >
                    Hello! How can I help you today?
                  </h1>
                  <p className="mx-auto mt-2.5 max-w-[560px] text-[13px] sm:text-[14px] leading-relaxed text-[#667085] px-1">
                    Ask anything about wellness, lifestyle, or guidance from SumitAI&apos;s
                    specialist consultants — in text or by voice.
                  </p>
                </div>

                <div className="mt-7 sm:mt-8">
                  <PromptBox
                    consultants={consultants}
                    selectedConsultant={selectedConsultant}
                    onConsultantChange={setSelectedConsultant}
                    message={message}
                    onMessageChange={setMessage}
                    onSend={() => handleSendMessage()}
                    loading={isStreaming}
                    chatStarted={chatStarted}
                    size="hero"
                  />
                </div>

                <p className="mt-6 sm:mt-8 text-center text-[11px] text-[#C4CAD4] px-2">
                  Sumit AI can make mistakes. Please verify important health information with a
                  qualified professional.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
