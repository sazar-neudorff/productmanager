import "../styles/Sidebar.css";
import type { AuthUser } from "../auth/authApi";

type SidebarNavItem = {
  id: string;
  label: string;
  description: string;
};

interface PortalSidebarProps {
  navigation: SidebarNavItem[];
  activeView: string;
  onNavigate: (id: SidebarNavItem["id"]) => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export default function PortalSidebar({
  navigation,
  activeView,
  onNavigate,
  currentUser,
  onLogout,
}: PortalSidebarProps) {
  const displayName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") ||
    currentUser?.email ||
    null;

  return (
    <aside className="portal-sidebar admin-sidebar" aria-label="Seitennavigation">
      <div className="portal-sidebar__brand">
        <div className="portal-sidebar__badge">Neudorff</div>
        <p className="portal-sidebar__tagline">Interne Plattform</p>
        <h2>Produktmanager</h2>
        <p>Module, Exporte und Dateiflüsse in einer Oberfläche.</p>
        {displayName && (
          <p style={{ marginTop: "0.75rem", color: "var(--clr-text-subtle)", fontSize: "0.95rem" }}>
            Angemeldet als <strong>{displayName}</strong>
          </p>
        )}
      </div>

      <nav className="portal-sidebar__nav" aria-label="Hauptnavigation">
        {navigation.map((item) => {
          const isActive = item.id === activeView;
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link ${isActive ? "is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onNavigate(item.id)}
            >
              <div>
                <span className="sidebar-link__label">{item.label}</span>
                <span className="sidebar-link__description">{item.description}</span>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="portal-sidebar__maintenance">
        <div>
          <p className="portal-sidebar__maintenance-label">Wartungsmodus</p>
          <span className="portal-sidebar__maintenance-status">Live</span>
        </div>
        <label className="sidebar-switch" aria-label="Wartungsmodus">
          <input type="checkbox" checked={false} readOnly />
          <span className="sidebar-slider" />
        </label>
      </div>

      <button type="button" className="portal-sidebar__logout" onClick={onLogout} disabled={!onLogout}>
        Abmelden
      </button>
    </aside>
  );
}
