import "../styles/Sidebar.css";

const primaryNav = [
  {
    label: "Übersicht",
    description: "Status & Module",
    badge: "LIVE",
    isActive: true,
  },
  {
    label: "Service Hub",
    description: "Tickets & SLAs",
    badge: "18",
  },
  {
    label: "Automationen",
    description: "Flows & Regeln",
    badge: "12",
  },
  {
    label: "Dokumente",
    description: "Vorlagen & Prozesse",
  },
];

const secondaryNav = [
  {
    label: "Rollen & Zugriff",
    description: "Teams & Rechte",
  },
  {
    label: "Audit Log",
    description: "Nachvollziehbarkeit",
  },
];

const quickStats = [
  { label: "Aktive Nutzer", value: "86" },
  { label: "Integrationen", value: "9" },
];

export default function PortalSidebar() {
  return (
    <aside className="portal-sidebar" aria-label="Seitennavigation">
      <div className="portal-sidebar__brand">
        <div className="portal-sidebar__badge">Core Portal</div>
        <h2>Command</h2>
        <p>Interne Plattform</p>
      </div>

      <div className="portal-sidebar__workspace">
        <p className="workspace-label">Team Operations</p>
        <p className="workspace-shift">Frühschicht · KW 48</p>
      </div>

      <nav className="portal-sidebar__nav" aria-label="Hauptnavigation">
        {primaryNav.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`sidebar-link ${item.isActive ? "is-active" : ""}`}
            aria-current={item.isActive ? "page" : undefined}
          >
            <div>
              <span className="sidebar-link__label">{item.label}</span>
              <span className="sidebar-link__description">
                {item.description}
              </span>
            </div>

            {item.badge && (
              <span className="sidebar-link__badge">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="portal-sidebar__section">
        <p className="portal-sidebar__section-title">Governance</p>

        {secondaryNav.map((item) => (
          <button
            key={item.label}
            type="button"
            className="sidebar-link sidebar-link--ghost"
          >
            <div>
              <span className="sidebar-link__label">{item.label}</span>
              <span className="sidebar-link__description">
                {item.description}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="portal-sidebar__stats">
        {quickStats.map((stat) => (
          <div key={stat.label} className="sidebar-stat">
            <span className="sidebar-stat__value">{stat.value}</span>
            <span className="sidebar-stat__label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="portal-sidebar__user">
        <div className="portal-sidebar__avatar" aria-hidden>
          AB
        </div>
        <div>
          <p className="sidebar-user__name">Alex Bauer</p>
          <p className="sidebar-user__role">Operations Lead</p>
        </div>
        <button
          type="button"
          className="sidebar-user__button"
          aria-label="Benutzermenü"
        >
          ···
        </button>
      </div>
    </aside>
  );
}
