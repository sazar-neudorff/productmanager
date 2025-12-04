import type { ComponentProps } from "react";
import ModuleCard from "../components/ModuleCard";
import "../styles/Home.css";

const modules: ComponentProps<typeof ModuleCard>[] = [
  {
    title: "Nützlingsportal Admin",
    owner: "Team Gartenbau",
    updatedAt: "Letztes Update · 09:42",
    kpi: { label: "Aktive Codes", value: "128" },
    tags: ["Nützlinge", "Admin"],
    status: "stable",
  },
  {
    title: "Produktmanagement",
    owner: "Team Produkt",
    updatedAt: "Aktualisiert vor 5 Min",
    kpi: { label: "Exportprofile", value: "7 aktiv" },
    tags: ["Obi", "Otto", "Shopify"],
    status: "stable",
  },
  {
    title: "Bestell Cockpit",
    owner: "Team Beratung",
    updatedAt: "Aufbau läuft",
    kpi: { label: "Anfragen heute", value: "0" },
    tags: ["Bestellungen", "Interne Tools"],
    status: "attention",
  },
];

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
