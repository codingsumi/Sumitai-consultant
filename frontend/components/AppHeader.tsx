"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Info, Menu, UserRound, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/popular-questions", label: "Popular Questions" },
  { href: "/about", label: "About SumitAI" },
] as const;

interface AppHeaderProps {
  /** Compact variant used inside the chat home shell */
  variant?: "page" | "chat";
  onOpenSidebar?: () => void;
  onOpenProfile?: () => void;
  chatTitle?: string;
  showChatTitle?: boolean;
}

export default function AppHeader({
  variant = "page",
  onOpenSidebar,
  onOpenProfile,
  chatTitle,
  showChatTitle = false,
}: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname.startsWith("/chat");
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const authAction = () => {
    if (user) {
      onOpenProfile?.();
      if (!onOpenProfile) router.push("/");
      return;
    }
    router.push("/login");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b border-[#ECEEF2]/80 bg-[#FCFCFD]/90 backdrop-blur-md",
        "pt-[env(safe-area-inset-top)]"
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-14 items-center justify-between gap-3 px-3 sm:px-5",
          variant === "page" && "max-w-[1100px]"
        )}
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {variant === "chat" && onOpenSidebar && (
            <button
              type="button"
              onClick={onOpenSidebar}
              aria-label="Open menu"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-[#ECEEF2] text-[#667085] shadow-sm active:scale-95 transition-all lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {variant === "page" && (
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-[#ECEEF2] text-[#667085] shadow-sm md:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}

          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <div
              className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[12px] border border-[#ECEEF2] bg-white shadow-sm"
            >
              <Image
                src="/images/sumit-mascot.jpg"
                height={36}
                width={36}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              {showChatTitle && chatTitle ? (
                <span className="block truncate text-[13px] font-semibold text-[#101828]">
                  {chatTitle}
                </span>
              ) : (
                <span
                  className="block truncate text-[15px] font-bold tracking-tight text-[#101828]"
                  style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                >
                  SumitAI
                </span>
              )}
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors",
                isActive(item.href)
                  ? "bg-[#FFF4EC] text-[#FF7A00]"
                  : "text-[#667085] hover:bg-[#F7F8FA] hover:text-[#101828]"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/about"
            aria-label="About SumitAI"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#ECEEF2] bg-white text-[#667085] shadow-sm transition hover:text-[#FF7A00]"
          >
            <Info className="h-5 w-5" />
          </Link>

          <button
            type="button"
            onClick={authAction}
            aria-label={user ? "Open profile" : "Log in"}
            className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-[#ECEEF2] bg-white px-2.5 text-[#667085] shadow-sm transition hover:text-[#FF7A00] sm:px-3"
          >
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <UserRound className="h-5 w-5" />
            )}
            <span className="hidden max-w-[100px] truncate text-[12px] font-semibold sm:inline">
              {user ? user.name.split(" ")[0] : "Login"}
            </span>
          </button>
        </div>
      </div>

      {variant === "page" && mobileOpen && (
        <nav
          className="border-t border-[#ECEEF2] bg-white px-3 py-3 md:hidden"
          aria-label="Mobile"
        >
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3.5 py-3 text-[14px] font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-[#FFF4EC] text-[#FF7A00]"
                    : "text-[#344054] hover:bg-[#F7F8FA]"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
