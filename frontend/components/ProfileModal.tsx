"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, X } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

function errorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    return (err.response?.data?.message as string) || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileModal({ open, onClose }: ProfileModalProps) {
  const {
    user,
    updateName,
    uploadAvatar,
    deleteAccount,
    sendOtp,
    claimGuest,
    logout,
  } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [claimEmail, setClaimEmail] = useState("");
  const [claimCode, setClaimCode] = useState("");
  const [claimStep, setClaimStep] = useState<"idle" | "code">("idle");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!open || !user) return null;

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await updateName(name.trim());
      setSuccess("Profile updated");
    } catch (err) {
      setError(errorMessage(err, "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await uploadAvatar(file);
      setSuccess("Avatar updated");
    } catch (err) {
      setError(errorMessage(err, "Failed to upload avatar"));
    } finally {
      setSaving(false);
    }
  };

  const handleSendClaimOtp = async () => {
    setError("");
    setSaving(true);
    try {
      const result = await sendOtp(claimEmail.trim());
      setCooldown(result.resendAvailableIn ?? 60);
      setClaimStep("code");
    } catch (err) {
      setError(errorMessage(err, "Failed to send code"));
    } finally {
      setSaving(false);
    }
  };

  const handleClaim = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await claimGuest(claimEmail.trim(), claimCode.trim());
      setSuccess("Account converted successfully");
      setClaimStep("idle");
      setClaimCode("");
    } catch (err) {
      setError(errorMessage(err, "Failed to convert account"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete your account and all conversations? This cannot be undone.")) {
      return;
    }
    setSaving(true);
    try {
      await deleteAccount();
      router.replace("/login");
    } catch (err) {
      setError(errorMessage(err, "Failed to delete account"));
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-[24px] border border-[#ECEEF2] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#9AA4B2] hover:bg-[#F7F8FA] hover:text-[#101828]"
        >
          <X className="h-4 w-4" />
        </button>

        <h2
          className="text-[20px] font-semibold text-[#101828]"
          style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
        >
          Profile
        </h2>
        <p className="mt-1 text-[13px] text-[#667085]">
          Manage your Sumit AI account details.
        </p>

        <div className="mt-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative group"
          >
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-16 w-16 rounded-full object-cover border border-[#ECEEF2]"
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)" }}
              >
                {user.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
              <Camera className="h-5 w-5 text-white" />
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => void handleAvatar(e.target.files?.[0])}
          />
          <div>
            <p className="text-[14px] font-semibold text-[#101828]">{user.name}</p>
            <p className="text-[12px] text-[#9AA4B2]">
              {user.accountType === "GUEST" ? "Guest account" : "Registered account"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-3">
          <label className="block text-[12px] font-medium text-[#667085]">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[12px] border border-[#ECEEF2] bg-[#FCFCFD] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#FF7A00] focus:ring-4 focus:ring-orange-100"
          />
          <button
            type="submit"
            disabled={saving || name.trim().length < 2}
            className="rounded-[12px] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)" }}
          >
            Save name
          </button>
        </form>

        <div className="mt-6 rounded-[16px] border border-[#ECEEF2] bg-[#FCFCFD] p-4 text-[13px] text-[#667085] space-y-2">
          <p><span className="font-medium text-[#344054]">User ID:</span> {user.id}</p>
          <p><span className="font-medium text-[#344054]">Email:</span> {user.email ?? "—"}</p>
          <p><span className="font-medium text-[#344054]">Provider:</span> {user.authProvider}</p>
          <p><span className="font-medium text-[#344054]">Joined:</span> {new Date(user.createdAt).toLocaleString()}</p>
          {user.accountType === "GUEST" && user.guestExpiresAt && (
            <p>
              <span className="font-medium text-[#344054]">Guest expires:</span>{" "}
              {new Date(user.guestExpiresAt).toLocaleString()}
            </p>
          )}
        </div>

        {user.accountType === "GUEST" && (
          <div className="mt-6 rounded-[16px] border border-orange-100 bg-[#FFF7ED] p-4">
            <h3 className="text-[14px] font-semibold text-[#101828]">Convert to full account</h3>
            <p className="mt-1 text-[12px] text-[#667085]">
              Verify your email to keep conversations permanently and unlock your profile.
            </p>
            {claimStep === "idle" ? (
              <div className="mt-3 flex gap-2">
                <input
                  type="email"
                  value={claimEmail}
                  onChange={(e) => setClaimEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 rounded-[12px] border border-[#ECEEF2] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#FF7A00]"
                />
                <button
                  type="button"
                  disabled={saving || !claimEmail.trim()}
                  onClick={() => void handleSendClaimOtp()}
                  className="rounded-[12px] px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)" }}
                >
                  Send code
                </button>
              </div>
            ) : (
              <form onSubmit={handleClaim} className="mt-3 space-y-2">
                <input
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit code"
                  maxLength={6}
                  className="w-full rounded-[12px] border border-[#ECEEF2] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#FF7A00]"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving || claimCode.length !== 6}
                    className="rounded-[12px] px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #FF7A00 0%, #FF5B7F 100%)" }}
                  >
                    Verify & convert
                  </button>
                  <button
                    type="button"
                    disabled={cooldown > 0 || saving}
                    onClick={() => void handleSendClaimOtp()}
                    className="text-[12px] font-medium text-[#FF7A00] disabled:text-[#C4CAD4]"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {error && <p className="mt-4 text-[13px] text-red-500">{error}</p>}
        {success && <p className="mt-4 text-[13px] text-emerald-600">{success}</p>}

        <div className="mt-6 flex flex-wrap gap-2 border-t border-[#ECEEF2] pt-4">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-[12px] border border-[#ECEEF2] px-4 py-2 text-[13px] font-medium text-[#344054] hover:bg-[#F7F8FA]"
          >
            Log out
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={saving}
            className="rounded-[12px] border border-red-100 px-4 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50"
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}
