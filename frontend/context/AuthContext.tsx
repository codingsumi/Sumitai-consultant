"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  claimGuest as claimGuestApi,
  continueAsGuest as continueAsGuestApi,
  getMe,
  logout as logoutApi,
  sendOtp as sendOtpApi,
  verifyOtp as verifyOtpApi,
  type AuthUser,
} from "@/services/auth.service";
import {
  deleteAccount as deleteAccountApi,
  updateProfile as updateProfileApi,
  uploadAvatar as uploadAvatarApi,
} from "@/services/profile.service";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  sendOtp: (email: string) => Promise<{ resendAvailableIn: number }>;
  verifyOtp: (email: string, code: string) => Promise<AuthUser>;
  continueAsGuest: (name: string) => Promise<AuthUser>;
  claimGuest: (email: string, code: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateName: (name: string) => Promise<AuthUser>;
  uploadAvatar: (file: File) => Promise<AuthUser>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
      try {
        localStorage.setItem("sumitai_authed", "1");
      } catch {
        /* ignore */
      }
    } catch {
      setUser(null);
      try {
        localStorage.removeItem("sumitai_authed");
      } catch {
        /* ignore */
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const failSafe = window.setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 4000);

    void refresh().finally(() => {
      if (!cancelled) window.clearTimeout(failSafe);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(failSafe);
    };
  }, [refresh]);

  const sendOtp = useCallback(async (email: string) => sendOtpApi(email), []);

  const verifyOtp = useCallback(async (email: string, code: string) => {
    const next = await verifyOtpApi(email, code);
    setUser(next);
    try {
      localStorage.setItem("sumitai_authed", "1");
    } catch {
      /* ignore */
    }
    return next;
  }, []);

  const continueAsGuest = useCallback(async (name: string) => {
    const next = await continueAsGuestApi(name);
    setUser(next);
    try {
      localStorage.setItem("sumitai_authed", "1");
    } catch {
      /* ignore */
    }
    return next;
  }, []);

  const claimGuest = useCallback(async (email: string, code: string) => {
    const next = await claimGuestApi(email, code);
    setUser(next);
    try {
      localStorage.setItem("sumitai_authed", "1");
    } catch {
      /* ignore */
    }
    return next;
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
    try {
      localStorage.removeItem("sumitai_authed");
    } catch {
      /* ignore */
    }
  }, []);

  const updateName = useCallback(async (name: string) => {
    const next = await updateProfileApi(name);
    setUser(next);
    return next;
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    const next = await uploadAvatarApi(file);
    setUser(next);
    return next;
  }, []);

  const deleteAccount = useCallback(async () => {
    await deleteAccountApi();
    setUser(null);
    try {
      localStorage.removeItem("sumitai_authed");
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      refresh,
      sendOtp,
      verifyOtp,
      continueAsGuest,
      claimGuest,
      logout,
      updateName,
      uploadAvatar,
      deleteAccount,
    }),
    [
      user,
      loading,
      refresh,
      sendOtp,
      verifyOtp,
      continueAsGuest,
      claimGuest,
      logout,
      updateName,
      uploadAvatar,
      deleteAccount,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
