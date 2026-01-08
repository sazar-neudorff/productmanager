import { createContext, useContext } from "react";
import type { AuthUser } from "./authApi";

export type AuthState = {
  isLoading: boolean;
  user: AuthUser | null;
  permissions: string[];
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

