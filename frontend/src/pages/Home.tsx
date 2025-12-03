import type { ComponentProps } from "react";
import ModuleCard from "../components/ModuleCard";
import "../styles/Home.css";

const highlights = [
  {
    label: "Offene Tickets",
    value: "18",
    delta: "+3 seit gestern",
    tone: "warning",
  },
  {
    label: "Automationen aktiv",
    value: "42",
    delta: "Stabil",
    tone: "positive",
  },
  { label: "Deployments heute", value: "3", delta: "Planmäßig", tone: "neutral" },
  { label: "Service-Level", value: "99,2%", delta: "+0,4%", tone: "positive" },
];

const heroStats = [
  { label: "Team", value: "Operations Core", detail: "12 aktiv" },
  { label: "Integrationen", value: "9", detail: "2 neue Anfragen" },
  { label: "Nächste Wartung", value: "Do, 14:00", detail: "Cluster West" },
];

const quickLaunch = [
  {
    label: "Service Hub öffnen",
    detail: "Priorisierte Kundenfälle & Eskalationen",
    action: "Start",
  },
  {
    label: "Automationen bauen",
    detail: "Regeln, Trigger & Freigaben konfigurieren",
    action: "Studio",
  },
  {
    label: "Reports teilen",
    detail: "Forecast & Compliance Kennzahlen",
    action: "Insights",
  },
];

const watchlist = [
  {
    title: "Deploy 2025.12",
    detail: "Abgleich mit IT · 14:00 Uhr",
    status: "Bereit",
  },
  {
    title: "Incident Übung",
    detail: "Runbook aktualisieren · bis Freitag",
    status: "Review",
  },
  {
    title: "Audit Bericht",
    detail: "Feedback Legal · nächste Woche",
    status: "Entwurf",
  },
];

type ModuleDefinition = ComponentProps<typeof ModuleCard>;

const modules: ModuleDefinition[] = [
  {
    title: "Service Hub",
    description: "Priorisierte Vorgänge, Kundenerwartungen & Eskalationen.",
    owner: "Kanal: Support",
    updatedAt: "Aktualisiert vor 12 Min",
    kpi: { label: "SLA erfüllt", value: "94%" },
    tags: ["Response", "24/7"],
    status: "warning",
  },
  {
    title: "Automationen",
    description: "Flows, Trigger & Freigaben zentral orchestrieren.",
    owner: "Plattform",
    updatedAt: "Aktualisiert vor 3 Std",
    kpi: { label: "Aktive Regeln", value: "56" },
    tags: ["Workflows", "APIs"],
    status: "stable",
  },
  {
    title: "Insights & Reports",
    description: "Quartalsziele, Prognosen und Compliance Kennzahlen.",
    owner: "Reporting",
    updatedAt: "Aktualisiert gestern",
    kpi: { label: "Forecast", value: "+8%" },
    tags: ["BI", "Exports"],
    status: "attention",
  },
];

const focusItems = [
  {
    title: "Pilotkunden auf neues Preisprofil migrieren",
    detail: "Deadline 16:00 Uhr",
    owner: "Tool A",
  },
  {
    title: "Workflow 5.2 freigeben",
    detail: "QA Feedback eingearbeitet",
    owner: "Automationen",
  },
  {
    title: "Compliance Check KW48",
    detail: "Bericht vorbereiten",
    owner: "Risk & Legal",
  },
];

const activities = [
  {
    title: "Release 2025.12.03 ausgerollt",
    actor: "Deploy Bot",
    time: "vor 12 Min",
  },
  {
    title: "Neuer SLA für Kunde Nordwind",
    actor: "Helena H.",
    time: "vor 47 Min",
  },
  {
    title: "Incident #584 geschlossen",
    actor: "Service Hub",
    time: "vor 2 Std",
  },
];

export default function Home() {
  return (
    <div className="dashboard">
      <section className="dashboard-hero">
        <div className="hero-main">
          <p className="section-heading__eyebrow">Startbereich</p>
          <h2>Operations Plattform</h2>
          <p className="hero-description">
            Steuerzentrale für interne Teams, Module und Service-Level. Wähle
            einen Bereich aus oder lege direkt los.
          </p>

          <div className="hero-stats">
            {heroStats.map((stat) => (
              <div key={stat.label} className="hero-stat">
                <span className="hero-stat__label">{stat.label}</span>
                <strong className="hero-stat__value">{stat.value}</strong>
                <span className="hero-stat__detail">{stat.detail}</span>
              </div>
            ))}
          </div>

          <div className="hero-actions">
            <button type="button" className="workspace-action workspace-action--primary">
              Neuer Vorgang
            </button>
            <button type="button" className="workspace-action workspace-action--ghost">
              Start Check-in
            </button>
          </div>
        </div>

        <div className="hero-panels">
          <div className="hero-panel">
            <div className="hero-panel__header">
              <p>Quick Launch</p>
              <button
                type="button"
                className="workspace-action workspace-action--ghost"
                aria-label="Quick Launch anpassen"
              >
                Anpassen
              </button>
            </div>

            <ul className="quick-launch">
              {quickLaunch.map((item) => (
                <li key={item.label} className="quick-launch__item">
                  <div>
                    <p className="quick-launch__label">{item.label}</p>
                    <p className="quick-launch__detail">{item.detail}</p>
                  </div>
                  <button type="button" className="quick-launch__action">
                    {item.action}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-panel">
            <div className="hero-panel__header">
              <p>Beobachtungsliste</p>
              <span>Heute</span>
            </div>

            <ul className="watchlist">
              {watchlist.map((item) => (
                <li key={item.title} className="watchlist__item">
                  <div>
                    <p className="watchlist__title">{item.title}</p>
                    <p className="watchlist__meta">{item.detail}</p>
                  </div>
                  <span className="watchlist__status">{item.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">Live KPI</p>
            <h2>Aktuelle Lage</h2>
          </div>

          <button className="workspace-action workspace-action--ghost">
            Protokoll exportieren
          </button>
        </div>

        <div className="stat-grid">
          {highlights.map((item) => (
            <article
              key={item.label}
              className={`stat-card stat-card--${item.tone}`}
            >
              <p className="stat-card__label">{item.label}</p>
              <p className="stat-card__value">{item.value}</p>
              <p className="stat-card__delta">{item.delta}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">Module</p>
            <h2>Bereiche & Programme</h2>
          </div>

          <button className="workspace-action workspace-action--ghost">
            Alle Module
          </button>
        </div>

        <div className="module-grid">
          {modules.map((module) => (
            <ModuleCard key={module.title} {...module} />
          ))}
        </div>
      </section>

      <section className="dashboard-split">
        <div className="panel-card">
          <div className="panel-card__header">
            <h3>Team Fokus</h3>
            <span>Heute</span>
          </div>

          <ul className="focus-list">
            {focusItems.map((item) => (
              <li key={item.title}>
                <p className="focus-list__title">{item.title}</p>
                <p className="focus-list__meta">
                  {item.detail} · {item.owner}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel-card">
          <div className="panel-card__header">
            <h3>Aktivität</h3>
            <span>Live Feed</span>
          </div>

          <ul className="activity-feed">
            {activities.map((activity) => (
              <li key={activity.title}>
                <p className="activity-feed__title">{activity.title}</p>
                <p className="activity-feed__meta">
                  {activity.actor} · {activity.time}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
