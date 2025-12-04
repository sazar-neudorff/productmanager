import "../styles/AppHeader.css";

const tabs = [
  { label: "Nützlingsportal", isActive: true },
  { label: "Bestell Cockpit" },
  { label: "Produktmanagement" },
];

export default function AppHeader() {
  return (
    <header className="workspace-header">
      <div className="workspace-header__highlight">
        <span className="workspace-header__badge">Neudorff Plattform</span>
        <span className="workspace-header__status">Heute live</span>
      </div>

      <div className="workspace-header__main workspace-header__main--compact">
        <div>
          <p className="workspace-header__eyebrow">Nützlingsportal</p>
          <h1>Nützlingsportal Admin</h1>
          <p className="workspace-header__description">
            Grüner Verwaltungsbereich für Codes, Bestell-Sets und Module. Steuere
            alle Touchpoints des Portals in einer Oberfläche mit Neudorff Look
            &amp; Feel.
          </p>
          <p className="workspace-header__hint">
            Neue Codes können direkt ins Portal oder an die Bestellstrecken
            verteilt werden.
          </p>
        </div>

        <div className="workspace-header__stat">
          <p className="workspace-header__stat-label">Aktuelle Nachfrage</p>
          <p className="workspace-header__stat-value">86%</p>
          <p className="workspace-header__stat-sub">Letztes Update · 09:42</p>
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
