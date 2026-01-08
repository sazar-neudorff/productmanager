import { useCallback, useEffect, useMemo, useState } from "react";
import "../styles/AdminPage.css";
import {
  adminGetDepartmentPermissions,
  adminListDepartments,
  adminListPermissions,
  adminListUsers,
  adminResetUserPassword,
  adminSetDepartmentPermissions,
  adminSetUserActive,
  adminSetUserDepartment,
  type AdminDepartment,
  type AdminPermission,
  type AdminUser,
} from "../admin/adminApi";
import { useAuth } from "../auth/AuthContext";

type LoadState = "idle" | "loading" | "ready" | "error";

export default function AdminPage() {
  const { user } = useAuth();
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);

  const [activeDepartmentId, setActiveDepartmentId] = useState<number | null>(null);
  const [activeDepartmentKeys, setActiveDepartmentKeys] = useState<string[]>([]);
  const [savingDeptPerms, setSavingDeptPerms] = useState(false);

  const [resetModal, setResetModal] = useState<null | { email: string; tempPassword: string }>(null);

  const activeDepartment = useMemo(
    () => departments.find((d) => d.id === activeDepartmentId) ?? null,
    [departments, activeDepartmentId]
  );

  const loadAll = useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const [u, d, p] = await Promise.all([adminListUsers(), adminListDepartments(), adminListPermissions()]);
      setUsers(u.items ?? []);
      setDepartments(d.items ?? []);
      setPermissions(p.items ?? []);
      setState("ready");
      if (!activeDepartmentId && (d.items?.[0]?.id ?? null)) setActiveDepartmentId(d.items[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
      setState("error");
    }
  }, [activeDepartmentId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!activeDepartmentId) return;
    (async () => {
      try {
        const res = await adminGetDepartmentPermissions(activeDepartmentId);
        const keys = (res.permissions ?? []).map((x) => x.key_name);
        setActiveDepartmentKeys(keys);
      } catch {
        setActiveDepartmentKeys([]);
      }
    })();
  }, [activeDepartmentId]);

  if (!user?.isOwner) {
    return (
      <div className="admin-page">
        <header className="admin-hero">
          <div>
            <p className="admin-hero__eyebrow">Admin</p>
            <h2>Benutzerverwaltung</h2>
            <p>Dieser Bereich ist nur für Owner freigeschaltet.</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-hero">
        <div>
          <p className="admin-hero__eyebrow">Admin</p>
          <h2>Benutzer & Berechtigungen</h2>
          <p>
            Benutzer verwalten, Abteilungen zuweisen und Berechtigungen pro Abteilung steuern. Passwort-Resets
            revoken aktive Sessions automatisch.
          </p>
        </div>
        <div className="admin-hero__actions">
          <button type="button" className="secondary" onClick={() => void loadAll()} disabled={state === "loading"}>
            Aktualisieren
          </button>
        </div>
      </header>

      {state === "loading" && <div className="admin-loading">Lade…</div>}
      {state === "error" && (
        <div className="admin-error">
          <p>Admin-Daten konnten nicht geladen werden.</p>
          {error && <code>{error}</code>}
        </div>
      )}

      {state === "ready" && (
        <div className="admin-grid">
          <section className="panel-card admin-card">
            <div className="panel-card__header admin-card__header">
              <h3>Users</h3>
              <p>Abteilung, Aktiv-Status, Sessions & Passwort Reset</p>
            </div>

            <div className="admin-table-wrap" role="region" aria-label="User Tabelle">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Abteilung</th>
                    <th>Status</th>
                    <th>Sessions</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
                    const isOwner = Number(u.is_owner) === 1;
                    const isActive = Number(u.is_active) === 1;
                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="admin-user">
                            <div>
                              <strong>{name || u.email}</strong>
                              <div className="admin-user__meta">
                                <span>{u.email}</span>
                                {isOwner && <span className="admin-badge">Owner</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <select
                            className="input admin-select"
                            value={u.department_id ?? ""}
                            onChange={async (e) => {
                              const next = e.target.value ? Number(e.target.value) : null;
                              await adminSetUserDepartment(u.id, next);
                              setUsers((prev) =>
                                prev.map((x) =>
                                  x.id === u.id
                                    ? {
                                        ...x,
                                        department_id: next,
                                        department_name:
                                          next == null ? null : departments.find((d) => d.id === next)?.name ?? null,
                                      }
                                    : x
                                )
                              );
                            }}
                            disabled={isOwner}
                            aria-label={`Abteilung für ${u.email}`}
                          >
                            <option value="">—</option>
                            {departments.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <label className="admin-toggle">
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={async (e) => {
                                const next = e.target.checked;
                                await adminSetUserActive(u.id, next);
                                setUsers((prev) =>
                                  prev.map((x) => (x.id === u.id ? { ...x, is_active: next ? 1 : 0 } : x))
                                );
                              }}
                              disabled={isOwner}
                            />
                            <span>{isActive ? "Aktiv" : "Inaktiv"}</span>
                          </label>
                        </td>
                        <td>
                          <span className="admin-sessions">{u.active_sessions ?? 0}</span>
                        </td>
                        <td className="admin-actions">
                          <button
                            type="button"
                            className="admin-link"
                            onClick={async () => {
                              const res = await adminResetUserPassword(u.id);
                              if (res.temporaryPassword) {
                                setResetModal({ email: u.email, tempPassword: res.temporaryPassword });
                              }
                            }}
                            disabled={isOwner}
                          >
                            Passwort zurücksetzen
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel-card admin-card">
            <div className="panel-card__header admin-card__header">
              <h3>Rollen & Berechtigungen</h3>
              <p>Berechtigungen werden pro Abteilung vergeben.</p>
            </div>

            <div className="admin-perms">
              <div className="admin-perms__row">
                <label htmlFor="admin-department">Abteilung</label>
                <select
                  id="admin-department"
                  className="input admin-select"
                  value={activeDepartmentId ?? ""}
                  onChange={(e) => setActiveDepartmentId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">—</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {activeDepartment && (
                <div className="admin-perms__list" aria-label="Permissions">
                  {permissions.map((p) => {
                    const checked = activeDepartmentKeys.includes(p.key_name);
                    return (
                      <label key={p.key_name} className="admin-check">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked;
                            setActiveDepartmentKeys((prev) => {
                              if (next) return Array.from(new Set([...prev, p.key_name]));
                              return prev.filter((k) => k !== p.key_name);
                            });
                          }}
                        />
                        <span>
                          <strong>{p.label}</strong>
                          <span className="admin-check__meta">{p.key_name}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="admin-perms__actions">
                <button
                  type="button"
                  onClick={async () => {
                    if (!activeDepartmentId) return;
                    setSavingDeptPerms(true);
                    try {
                      await adminSetDepartmentPermissions(activeDepartmentId, activeDepartmentKeys);
                    } finally {
                      setSavingDeptPerms(false);
                    }
                  }}
                  disabled={!activeDepartmentId || savingDeptPerms}
                >
                  {savingDeptPerms ? "Speichere…" : "Speichern"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {resetModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Passwort Reset">
          <div className="modal-box">
            <h3 className="modal-title">Passwort zurückgesetzt</h3>
            <p className="modal-text">
              Temporäres Passwort für <strong>{resetModal.email}</strong>:
            </p>
            <pre className="admin-temp-pass">{resetModal.tempPassword}</pre>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(resetModal.tempPassword);
                }}
              >
                Kopieren
              </button>
              <button type="button" onClick={() => setResetModal(null)}>
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

