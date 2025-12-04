import type { ComponentProps } from "react";
import ModuleCard from "../components/ModuleCard";
import "../styles/Home.css";

type ModuleConfig = ComponentProps<typeof ModuleCard> & {
  id: string;
};

const modules: ModuleConfig[] = [
  { id: "nuetzlingsportal", title: "Nützlingsportal Admin", caption: "Codes & Pflege" },
  { id: "product-management", title: "Produktmanagement", caption: "Daten & Assets" },
  { id: "bestell-cockpit", title: "Bestell Cockpit", caption: "Aufträge & Routing" },
];

interface HomeProps {
  onSelectModule?: (moduleId: string) => void;
}

export default function Home({ onSelectModule }: HomeProps) {

  return (
    <div className="dashboard">
      <section className="dashboard-hero">
        <div className="hero-main">
          <p className="section-heading__eyebrow">Startbereich</p>
          <h2>Neudorff Plattform</h2>
          <p className="hero-description">
            Ein gemeinsamer Zugang für alle Werkzeuge, die ihr täglich im Portal
            braucht. Wähle einen Bereich aus und du landest direkt in der
            passenden App.
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
            <ModuleCard
              key={module.id}
              {...module}
              onSelect={
                onSelectModule ? () => onSelectModule(module.id) : undefined
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
