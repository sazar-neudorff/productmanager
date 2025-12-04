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
  {
    label: "Berichte",
    description: "Performance",
  },
];

const stats = [
  { label: "Aktive Codes", value: "128" },
  { label: "Wartung", value: "Aus" },
];

export default function PortalSidebar() {
  return (
    <aside className="portal-sidebar" aria-label="Seitennavigation">
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

      <div className="portal-sidebar__section">
        <p className="portal-sidebar__section-title">Heute im Fokus</p>
        <div className="portal-sidebar__spotlight">
          <p className="portal-sidebar__spotlight-value">Nützlingsbedarf 86%</p>
          <p className="portal-sidebar__note">
            Nachfrage aus Obi &amp; Baumarkt-Strecken im Auge behalten.
          </p>
          <button type="button" className="portal-sidebar__spotlight-cta">
            Details ansehen
          </button>
        </div>
      </div>

      <div className="portal-sidebar__stats">
        {stats.map((stat) => (
          <div key={stat.label} className="sidebar-stat">
            <span className="sidebar-stat__value">{stat.value}</span>
            <span className="sidebar-stat__label">{stat.label}</span>
          </div>
        ))}
      </div>

      <button type="button" className="portal-sidebar__logout">
        Abmelden
      </button>
    </aside>
  );
}
