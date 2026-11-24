"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/login";

  useEffect(() => {
    if (loading) return;
    if (!user && !isLogin) {
      router.replace("/login");
    } else if (user && isLogin) {
      router.replace("/");
    }
  }, [user, loading, isLogin, router]);

  if (loading) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-[#FCFCFD]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F97316] border-t-transparent" />
          <p className="text-sm text-[#9AA4B2]">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user && !isLogin) return null;
  if (user && isLogin) return null;

  return <>{children}</>;
}
