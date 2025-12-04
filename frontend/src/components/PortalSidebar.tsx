import "../styles/Sidebar.css";

const navigation = [
  {
    label: "Nützlingsportal Admin",
    description: "Codes & Pflege",
    isActive: true,
  },
  {
    label: "Bestell Cockpit",
    description: "Kanäle & Händler",
  },
  {
    label: "Produktmanagement",
    description: "Exporte & Sets",
  },
];

export default function PortalSidebar() {
  return (
    <aside className="portal-sidebar admin-sidebar" aria-label="Seitennavigation">
      <div className="portal-sidebar__brand">
        <div className="portal-sidebar__badge">Neudorff</div>
        <p className="portal-sidebar__tagline">Interne Plattform</p>
        <h2>Nützlingsportal Admin</h2>
        <p>Pflege der Nützlings-Bestände</p>
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

      <button type="button" className="portal-sidebar__logout">
        Abmelden
      </button>
    </aside>
  );
}
