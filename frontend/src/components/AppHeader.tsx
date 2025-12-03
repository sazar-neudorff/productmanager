import "../styles/AppHeader.css";

const tabs = [
  { label: "Dashboard", isActive: true },
  { label: "Automationen" },
  { label: "Service Hub" },
  { label: "Reports" },
];

const quickActions = [
  { label: "Neuer Vorgang", variant: "primary" },
  { label: "Live Monitor", variant: "ghost" },
  { label: "Richtlinien", variant: "ghost" },
];

export default function AppHeader() {
  return (
    <header className="workspace-header">
      <div className="workspace-header__main">
        <div>
          <p className="workspace-header__eyebrow">Operations Plattform</p>
          <h1>Command Center</h1>
          <p className="workspace-header__description">
            Überblick über alle Module, Automationen und Service-Level deines
            Teams.
          </p>
        </div>

        <div className="workspace-header__meta">
          <span className="status-pill status-pill--success">
            Status: Stabil
          </span>
          <div className="workspace-header__update">
            <span>Letztes Update</span>
            <strong>09:24</strong>
          </div>
        </div>
      </div>

      <div className="workspace-header__actions">
        <label className="workspace-search">
          <span className="visually-hidden">Suche</span>
          <input
            type="search"
            placeholder="Suche nach Personen, Tools oder Vorgängen"
          />
        </label>

        <div className="workspace-quick-actions">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`workspace-action workspace-action--${action.variant}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <nav className="workspace-tabs" aria-label="Arbeitsbereiche">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={`workspace-tab ${tab.isActive ? "is-active" : ""}`}
            aria-pressed={tab.isActive ?? false}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
