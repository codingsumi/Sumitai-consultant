import type { AccountType, AuthProvider } from "@prisma/client";

export type AuthUser = {
  id: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
  accountType: AccountType;
  authProvider: AuthProvider;
  createdAt: Date;
  guestExpiresAt?: Date | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      sessionId?: string;
    }
  }
}

export {};
