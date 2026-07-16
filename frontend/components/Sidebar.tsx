"use client";

import {
  Sparkles,
  Plus,
  Home,
  MessageSquare,
  Bookmark,
  Settings,
  HelpCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Chat } from "@/hooks/useChat";
import Image from "next/image";

interface SidebarProps {
  activeNav: string;
  onNavChange: (item: string) => void;
  open: boolean;
  onClose: () => void;

  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onNewChat: () => void;
  conversationLoading: boolean;
}

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "chats", label: "Chats", icon: MessageSquare },
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
];

export default function Sidebar({ activeNav, onNavChange, open, onClose, chats, selectedChat, onSelectChat, onNewChat, conversationLoading }: SidebarProps) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-20 bg-black/20 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full w-[280px] flex flex-col border-r border-[#E5E7EB] bg-white transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center rounded-lg">
              {/* <Sparkles className=" text-white" /> */}
              <Image
               src="/images/sumitai-logo.png"
               height={30}
               width={30}
               alt="Sumit AI"
              />
            </div>
            <span className="text-[15px] font-bold text-[#111827] tracking-tight">
              Sumit AI
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat */}
        <div className="px-4 pb-4">
          <button 
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#EA580C]">
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        {/* Nav */}
        <nav className="px-3 space-y-0.5">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavChange(id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeNav === id
                  ? "bg-[#FFF7ED] text-[#F97316]"
                  : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
              )}
            >
              <Icon className={cn("h-4 w-4", activeNav === id ? "text-[#F97316]" : "")} />
              {label}
            </button>
          ))}
        </nav>


        <div className="border-t border-[#E5E7EB] px-3 py-4">
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Recent Chats
          </h3>

          <div className="space-y-1">
            {chats.map((chat) => (
              <button
                disabled={conversationLoading}
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={cn(
                  "w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  selectedChat?.id === chat.id
                    ? "bg-[#FFF7ED] text-[#F97316]"
                    : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
                )}
              >
                <p className="truncate">{chat.title}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-[#E5E7EB] px-3 py-4 space-y-0.5">
          {[
            { icon: Settings, label: "Settings" },
            { icon: HelpCircle, label: "Help & Support" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827] transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
