const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

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

export type AdminDepartment = { id: number; name: string; created_at?: string; user_count?: number };
export type AdminPermission = { id: number; key_name: string; label: string; created_at?: string };

export type AdminUser = {
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  department_id?: number | null;
  department_name?: string | null;
  is_owner: 0 | 1;
  is_active: 0 | 1;
  created_at?: string;
  last_login_at?: string | null;
  active_sessions?: number;
};

export async function adminListUsers(): Promise<{ items: AdminUser[] }> {
  return await requestJson("/api/admin/users", { method: "GET" });
}

export async function adminListDepartments(): Promise<{ items: AdminDepartment[] }> {
  return await requestJson("/api/admin/departments", { method: "GET" });
}

export async function adminCreateDepartment(name: string): Promise<{ item: AdminDepartment }> {
  return await requestJson("/api/admin/departments", { method: "POST", body: JSON.stringify({ name }) });
}

export async function adminListPermissions(): Promise<{ items: AdminPermission[] }> {
  return await requestJson("/api/admin/permissions", { method: "GET" });
}

export async function adminGetDepartmentPermissions(
  departmentId: number
): Promise<{ department: { id: number; name: string }; permissions: Array<{ key_name: string; label: string }> }> {
  return await requestJson(`/api/admin/departments/${departmentId}/permissions`, { method: "GET" });
}

export async function adminSetDepartmentPermissions(departmentId: number, permissionKeys: string[]): Promise<void> {
  await requestJson(`/api/admin/departments/${departmentId}/permissions`, {
    method: "POST",
    body: JSON.stringify({ permissionKeys }),
  });
}

export async function adminSetUserDepartment(userId: number, departmentId: number | null): Promise<void> {
  await requestJson(`/api/admin/users/${userId}/department`, {
    method: "POST",
    body: JSON.stringify({ departmentId }),
  });
}

export async function adminSetUserActive(userId: number, isActive: boolean): Promise<void> {
  await requestJson(`/api/admin/users/${userId}/active`, {
    method: "POST",
    body: JSON.stringify({ isActive }),
  });
}

export async function adminResetUserPassword(
  userId: number
): Promise<{ ok: true; temporaryPassword: string | null }> {
  return await requestJson(`/api/admin/users/${userId}/reset-password`, { method: "POST", body: "{}" });
}

export async function adminCreateUser(input: {
  email: string;
  firstName?: string;
  lastName?: string;
  departmentId?: number | null;
  isOwner?: boolean;
  isActive?: boolean;
  password?: string;
}): Promise<{ item: AdminUser; temporaryPassword: string | null }> {
  return await requestJson("/api/admin/users", { method: "POST", body: JSON.stringify(input) });
}

