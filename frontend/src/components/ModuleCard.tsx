import "../styles/ModuleCard.css";

type ModuleAccent = "green" | "yellow" | "brown";

interface ModuleCardProps {
  title: string;
  caption?: string;
  accent?: ModuleAccent;
}

export default function ModuleCard({
  title,
  caption,
  accent = "green",
}: ModuleCardProps) {
  return (
    <article className={`module-card module-card--${accent}`}>
      <h3>{title}</h3>
      {caption && <p className="module-card__caption">{caption}</p>}
      <button type="button" className="module-card__cta">
        Bereich öffnen
      </button>
    </article>
  );
}
