import type { ComponentProps } from "react";
import ModuleCard from "../components/ModuleCard";
import "../styles/Home.css";

const modules: ComponentProps<typeof ModuleCard>[] = [
  {
    title: "Nützlingsportal Admin",
    description:
      "Codes generieren, Sets prüfen und alle Admin-Flows freigeben.",
    owner: "Team Gartenbau",
    updatedAt: "Letztes Update · 09:42",
    kpi: { label: "Aktive Codes", value: "128" },
    tags: ["Nützlinge", "Admin"],
    status: "stable",
  },
  {
    title: "Produktmanagement",
    description: "Exports & Vorlagen für Obi, Otto, Shopify oder interne Kanäle.",
    owner: "Team Produkt",
    updatedAt: "Aktualisiert vor 5 Min",
    kpi: { label: "Exportprofile", value: "7 aktiv" },
    tags: ["Obi", "Otto", "Shopify"],
    status: "stable",
  },
  {
    title: "Bestell Cockpit",
    description: "Bestellungen erfassen und sicher in die Backend-Systeme schicken.",
    owner: "Team Beratung",
    updatedAt: "Aufbau läuft",
    kpi: { label: "Anfragen heute", value: "0" },
    tags: ["Bestellungen", "Interne Tools"],
    status: "attention",
  },
];

const statCards = [
  { label: "Aktive Codes", value: "128", description: "Portal live" },
  { label: "Neue Anfragen", value: "24", description: "Heute" },
  { label: "Pflegebedarf", value: "86%", description: "Nützlingsbedarf" },
  { label: "Wartung", value: "Aus", description: "Status" },
];

const maintenanceStatus = {
  isOn: false,
  nextWindow: "Heute · 22:00 Uhr",
  message: "Alle Systeme laufen stabil.",
};

export default function Home() {
  return (
    <div className="dashboard">
      <section className="dashboard-hero">
        <div className="hero-main">
          <p className="section-heading__eyebrow">Startbereich</p>
          <h2>Neudorff Plattform</h2>
          <p className="hero-description">
            Allgemeiner Zugang zur internen Plattform. Starte in einem Modul, um
            Codes zu verwalten, Exporte zu steuern oder Bestellungen für die Teams
            einzureichen.
          </p>
          <p className="hero-handwriting">Alles für das Nützlingsportal an einem Ort.</p>

          <ul className="hero-summary">
            <li>
              <strong>Nützlingsportal Admin:</strong> Codes freigeben und den
              Wartungsmodus steuern.
            </li>
            <li>
              <strong>Produktmanagement:</strong> Produktlisten und Templates
              für Obi, Otto, Shopify &amp; Co.
            </li>
            <li>
              <strong>Bestell Cockpit:</strong> Bestellungen an interne Systeme
              übergeben.
            </li>
          </ul>
        </div>
      </section>

      <section className="dashboard-overview">
        <div className="dashboard-grid" aria-label="Kennzahlen">
          {statCards.map((card) => (
            <article key={card.label} className="dashboard-card">
              <p className="dashboard-card__label">{card.label}</p>
              <p className="dashboard-card__value">{card.value}</p>
              <p className="dashboard-card__description">{card.description}</p>
            </article>
          ))}
        </div>

        <div className="maintenance-box" role="status">
          <div>
            <h3>Wartungsmodus</h3>
            <p className="subheadline">{maintenanceStatus.message}</p>
          </div>

          <div className="maintenance-row">
            <span className={`maintenance-status ${maintenanceStatus.isOn ? "on" : "off"}`}>
              {maintenanceStatus.isOn ? "Aktiv" : "Live"}
            </span>
            <label className="switch" aria-label="Wartungsmodus" title="Wartungsmodus">
              <input type="checkbox" checked={maintenanceStatus.isOn} readOnly />
              <span className="slider round" />
            </label>
          </div>
          <p className="maintenance-meta">Nächste Wartung: {maintenanceStatus.nextWindow}</p>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">Module</p>
            <h2>Bereiche & Programme</h2>
          </div>
        </div>

        <div className="module-grid">
          {modules.map((module) => (
            <ModuleCard key={module.title} {...module} />
          ))}
        </div>
      </section>
    </div>
  );
}
