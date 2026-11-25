"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLogin = pathname === "/login";
  const needsAuth = pathname.startsWith("/chat");

  useEffect(() => {
    if (loading) return;

    if (user && isLogin) {
      router.replace("/");
      return;
    }

    if (!user && needsAuth) {
      router.replace("/");
    }
  }, [user, loading, isLogin, needsAuth, router]);

  // Only block protected chat routes while session is resolving.
  // Home / login render immediately so first paint isn't gated on /auth/me.
  if (loading && needsAuth) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-[#FCFCFD]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F97316] border-t-transparent" />
          <p className="text-sm text-[#9AA4B2]">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user && needsAuth) return null;
  if (user && isLogin) return null;

  return <>{children}</>;
}
