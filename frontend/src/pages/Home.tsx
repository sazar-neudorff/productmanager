import type { ComponentProps } from "react";
import ModuleCard from "../components/ModuleCard";
import ProductManagerLauncher from "../components/ProductManagerLauncher";
import "../styles/Home.css";

const modules: ComponentProps<typeof ModuleCard>[] = [
  { title: "Nützlingsportal Admin", caption: "Codes & Pflege" },
  { title: "Produktmanagement", caption: "Daten & Assets" },
  { title: "Bestell Cockpit", caption: "Aufträge & Routing" },
];

export default function Home() {
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
            <ModuleCard key={module.title} {...module} />
          ))}
        </div>

        <div className="product-launcher-wrapper">
          <div className="product-launcher__tab-label">
            <span className="product-launcher__tab-label-kicker">Produkt Management</span>
            <h3>Produktmanager (Launcher)</h3>
            <p>Öffnet die internen Module für Neudorff, Shopify, OBI und Bauhaus.</p>
          </div>
          <ProductManagerLauncher />
        </div>
      </section>
    </div>
  );
}
