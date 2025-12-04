import "../styles/Sidebar.css";

const navigation = [
  {
    label: "Module",
    description: "Übersicht & Zugriff",
    isActive: true,
  },
  {
    label: "Rollen & Rechte",
    description: "Teamverwaltung",
  },
];

export default function PortalSidebar() {
  return (
    <aside className="portal-sidebar" aria-label="Seitennavigation">
      <div className="portal-sidebar__brand">
        <div className="portal-sidebar__badge">Neudorff</div>
        <h2>Dashboard</h2>
        <p>Interne Module</p>
      </div>

      <nav className="portal-sidebar__nav" aria-label="Hauptnavigation">
        {navigation.map((item) => (
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
          </button>
        ))}
      </nav>

      <div className="portal-sidebar__section">
        <p className="portal-sidebar__section-title">Info</p>
        <p className="portal-sidebar__note">
          Weitere Bereiche folgen, sobald Module und Rollen vergeben sind.
        </p>
      </div>
    </aside>
  );
}
