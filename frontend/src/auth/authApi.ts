const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export type AuthUser = {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  isOwner: boolean;
  isActive: boolean;
};

export type AuthMeResponse = {
  user: AuthUser | null;
  permissions?: string[];
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    const message =
      typeof data === "object" && data && "error" in data
        ? String((data as { error?: unknown }).error ?? "request_failed")
        : `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export async function authMe(): Promise<AuthMeResponse> {
  return await requestJson<AuthMeResponse>("/api/auth/me", { method: "GET" });
}

export async function authLogin(email: string, password: string): Promise<void> {
  await requestJson("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function authRegister(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<void> {
  await requestJson("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function authLogout(): Promise<void> {
  await requestJson("/api/auth/logout", { method: "POST" });
}

