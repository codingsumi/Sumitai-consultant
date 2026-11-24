"use client";

import HomePage from "./HomePage";
import WelcomeHome from "@/components/WelcomeHome";
import { useAuth } from "@/context/AuthContext";

export default function Page() {
  const { user, loading } = useAuth();

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

  if (!user) return <WelcomeHome />;
  return <HomePage />;
}
