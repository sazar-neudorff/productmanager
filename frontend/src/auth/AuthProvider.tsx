import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authLogin, authLogout, authMe, authRegister, type AuthUser } from "./authApi";
import { AuthContext, type AuthState } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const me = await authMe();
      setUser(me.user ?? null);
      setPermissions(me.permissions ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      isLoading,
      user,
      permissions,
      login: async (email, password) => {
        await authLogin(email, password);
        await refresh();
      },
      register: async (input) => {
        await authRegister(input);
        await refresh();
      },
      logout: async () => {
        await authLogout();
        setUser(null);
        setPermissions([]);
      },
      refresh,
    }),
    [isLoading, user, permissions]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

