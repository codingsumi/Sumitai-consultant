"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut, Settings, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "U";
}

interface ProfileMenuProps {
  onOpenProfile: () => void;
}

export default function ProfileMenu({ onOpenProfile }: ProfileMenuProps) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.replace("/");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-[12px] px-3.5 py-2.5 text-sm font-medium text-[#667085] transition-all duration-200 hover:bg-[#F7F8FA] hover:text-[#101828]"
      >
        <div className="flex min-w-0 items-center gap-3">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover border border-[#ECEEF2]"
            />
          ) : (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)" }}
            >
              {initials(user.name)}
            </div>
          )}
          <div className="min-w-0 text-left">
            <p className="truncate text-[13px] font-semibold text-[#101828]">{user.name}</p>
            <p className="truncate text-[11px] text-[#9AA4B2]">
              {user.accountType === "GUEST" ? "Guest account" : user.email}
            </p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-[#C4CAD4]" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 z-40 mb-2 overflow-hidden rounded-[14px] border border-[#ECEEF2] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.10)]">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenProfile();
            }}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-[13px] font-medium text-[#344054] hover:bg-[#F7F8FA]"
          >
            <Settings className="h-4 w-4 text-[#9AA4B2]" />
            Profile settings
          </button>
          {user.accountType === "GUEST" && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenProfile();
              }}
              className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-[13px] font-medium text-[#344054] hover:bg-[#F7F8FA]"
            >
              <UserRound className="h-4 w-4 text-[#9AA4B2]" />
              Convert to full account
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-3 border-t border-[#ECEEF2] px-3.5 py-2.5 text-left text-[13px] font-medium text-red-500 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
