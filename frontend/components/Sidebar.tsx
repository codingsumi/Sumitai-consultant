"use client";

import {
  Plus,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Chat } from "@/hooks/useChat";
import Image from "next/image";
import ProfileMenu from "@/components/ProfileMenu";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onNewChat: () => void;
  conversationLoading: boolean;
  onOpenProfile: () => void;
}

const chatIconColors = [
  "bg-gradient-to-br from-orange-400 to-pink-500",
  "bg-gradient-to-br from-emerald-400 to-teal-500",
  "bg-gradient-to-br from-violet-400 to-purple-500",
  "bg-gradient-to-br from-sky-400 to-blue-500",
  "bg-gradient-to-br from-amber-400 to-orange-500",
];

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function Sidebar({
  open,
  onClose,
  chats,
  selectedChat,
  onSelectChat,
  onNewChat,
  conversationLoading,
  onOpenProfile,
}: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full w-[min(320px,100vw)] max-w-[85vw] flex flex-col transition-transform duration-200",
          "bg-[#FCFCFD] border-r border-[#ECEEF2]",
          "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{
          boxShadow: "4px 0 24px rgba(0,0,0,0.04)",
        }}
      >
        {/* ── Logo ─────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 sm:px-5 pt-5 sm:pt-6 pb-4 sm:pb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[12px] border border-[#ECEEF2] bg-white shadow-sm">
              <Image
                src="/images/sumit-mascot.jpg"
                height={40}
                width={40}
                alt="Sumit AI"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col leading-none min-w-0">
              <span
                className="text-[15px] font-bold tracking-tight text-[#101828]"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                Sumit AI
              </span>
              <span className="text-[11px] text-[#667085] mt-0.5">
                AI Health Consultant
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden flex h-11 w-11 items-center justify-center rounded-xl text-[#667085] active:bg-[#F2F4F7] hover:bg-[#F2F4F7] hover:text-[#101828] transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── New Chat CTA ──────────────────────────────── */}
        <div className="px-4 pb-4">
          <button
            onClick={onNewChat}
            className="group relative flex w-full items-center justify-center gap-2.5 rounded-[16px] px-4 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            style={{
              height: "52px",
              background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
              boxShadow:
                "0 4px 16px rgba(255,122,0,0.35), 0 1px 3px rgba(255,91,127,0.20)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 6px 24px rgba(255,122,0,0.45), 0 2px 6px rgba(255,91,127,0.25)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 4px 16px rgba(255,122,0,0.35), 0 1px 3px rgba(255,91,127,0.20)";
            }}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
              <Plus className="h-3.5 w-3.5" />
            </div>
            New Chat
          </button>
        </div>

        {/* ── Recent Chats ─────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-3 min-h-0">
          <p className="mb-2.5 px-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9AA4B2]">
            Recent Chats
          </p>

          <div className="space-y-1">
            {chats.length === 0 && (
              <p className="px-1 py-2 text-xs text-[#9AA4B2]">No chats yet.</p>
            )}
            {chats.map((chat, i) => (
              <button
                key={chat.id}
                disabled={conversationLoading}
                onClick={() => onSelectChat(chat)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-[12px] px-3 py-3 sm:py-2.5 text-left transition-all duration-200 min-h-[52px]",
                  selectedChat?.id === chat.id
                    ? "bg-[#FFF4EC] shadow-sm"
                    : "hover:bg-[#F7F8FA] hover:shadow-sm active:bg-[#F7F8FA]"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold",
                    chatIconColors[i % chatIconColors.length]
                  )}
                >
                  {(chat.title ?? "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "truncate text-[13px] font-medium leading-tight",
                      selectedChat?.id === chat.id
                        ? "text-[#FF7A00]"
                        : "text-[#101828] group-hover:text-[#101828]"
                    )}
                  >
                    {chat.title ?? "New Chat"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#9AA4B2]">
                    {relativeTime(chat.createdAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Premium Card ─────────────────────────────── */}
        <div className="px-4 py-4">
          <div
            className="relative overflow-hidden rounded-[16px] p-4"
            style={{
              background:
                "linear-gradient(135deg, #FFF4EC 0%, #FFF0F5 100%)",
              border: "1px solid transparent",
              backgroundClip: "padding-box",
              boxShadow: "0 2px 12px rgba(255,122,0,0.10)",
            }}
          >
            {/* gradient border via pseudo-element workaround using outline */}
            <div
              className="absolute inset-0 rounded-[16px] pointer-events-none"
              style={{
                background:
                  "linear-gradient(#FFF4EC, #FFF0F5) padding-box, linear-gradient(135deg, #FF7A00, #FF5B7F) border-box",
                border: "1px solid transparent",
              }}
            />
            <div className="relative">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#FF7A00] uppercase tracking-wide">
                      Unlock More with
                    </p>
                    <p className="text-[13px] font-bold text-[#101828] leading-tight">
                      Sumit AI Premium
                    </p>
                  </div>
                </div>
              </div>

              {/* <ul className="space-y-1.5 mb-3">
                {[
                  "Priority responses",
                  "Advanced reports",
                  "Unlimited conversations",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[12px] text-[#667085]">
                    <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FF5B7F] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul> */}

              <button
                className="flex w-full items-center justify-center gap-1.5 rounded-[10px] py-2 text-[12px] font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)",
                  boxShadow: "0 2px 8px rgba(255,122,0,0.30)",
                }}
              >
                Upgrade Now
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Profile menu ──────────────────────────────── */}
        <div className="border-t border-[#ECEEF2] px-3 py-3">
          <ProfileMenu onOpenProfile={onOpenProfile} />
        </div>
      </aside>
    </>
  );
}
