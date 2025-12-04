import "../styles/AppHeader.css";

const tabs = [{ label: "Dashboard", isActive: true }];

export default function AppHeader() {
  return (
    <header className="workspace-header">
      <div className="workspace-header__main">
        <div>
          <p className="workspace-header__eyebrow">Neodoff Plattform</p>
          <h1>Dashboard</h1>
          <p className="workspace-header__description">
            Übersicht über die verfügbaren Module. Wähle einen Bereich, um mit
            den wichtigsten Aufgaben zu starten.
          </p>
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
