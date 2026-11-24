import api from "./api";

export type AccountType = "REGISTERED" | "GUEST";
export type AuthProvider = "EMAIL_OTP" | "GUEST";

export interface AuthUser {
  id: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
  accountType: AccountType;
  authProvider: AuthProvider;
  createdAt: string;
  guestExpiresAt: string | null;
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await api.get("/auth/me");
  return data.data.user;
}

export async function sendOtp(email: string) {
  const { data } = await api.post("/auth/send-otp", { email });
  return data.data as { resendAvailableIn: number };
}

export async function verifyOtp(email: string, code: string): Promise<AuthUser> {
  const { data } = await api.post("/auth/verify-otp", { email, code });
  return data.data.user;
}

export async function continueAsGuest(name: string): Promise<AuthUser> {
  const { data } = await api.post("/auth/guest", { name });
  return data.data.user;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function claimGuest(email: string, code: string): Promise<AuthUser> {
  const { data } = await api.post("/auth/claim-guest", { email, code });
  return data.data.user;
}
