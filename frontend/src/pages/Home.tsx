import ModuleCard from "../components/ModuleCard";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-wrapper">
      <h1 className="home-title">Willkommen!</h1>
      <p className="home-subtitle">
        Wähle eines der verfügbaren Tools, um zu starten.
      </p>

      <div className="module-grid">
        <ModuleCard 
          title="Tool A"
          text="Erledige Aufgabe A"
        />

        <ModuleCard 
          title="Tool B"
          text="Automatisierungen & Abläufe"
        />

        <ModuleCard 
          title="Tool C"
          text="Daten einsehen & analysieren"
        />
      </div>
    </div>
  );
}
