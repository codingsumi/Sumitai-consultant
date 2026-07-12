"use client";

import { Bell, User, Menu } from "lucide-react";

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[#E5E7EB] bg-white px-5">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#F97316]" />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF7ED] border border-[#FED7AA] text-[#F97316] hover:bg-[#FED7AA] transition-colors">
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
