"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import WelcomeHome from "@/components/WelcomeHome";
import { useAuth } from "@/context/AuthContext";

const HomePage = dynamic(() => import("./HomePage"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-screen items-center justify-center bg-[#FCFCFD]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F97316] border-t-transparent" />
        <p className="text-sm text-[#9AA4B2]">Loading…</p>
      </div>
    </div>
  ),
});

function likelyAuthed() {
  try {
    return localStorage.getItem("sumitai_authed") === "1";
  } catch {
    return false;
  }
}

export default function Page() {
  const { user, loading } = useAuth();
  // Defer localStorage until after mount so SSR HTML matches the first client paint.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (user) return <HomePage />;

  // Server + first client render: always WelcomeHome (identical trees).
  if (!mounted) return <WelcomeHome />;

  if (loading && likelyAuthed()) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-[#FCFCFD]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F97316] border-t-transparent" />
          <p className="text-sm text-[#9AA4B2]">Loading…</p>
        </div>
      </div>
    );
  }

  return <WelcomeHome />;
}
