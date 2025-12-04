import "../styles/ModuleCard.css";

interface ModuleCardProps {
  title: string;
  caption?: string;
}

export default function ModuleCard({
  title,
  caption,
}: ModuleCardProps) {
  return (
    <article className="module-card">
      <h3>{title}</h3>
      {caption && <p className="module-card__caption">{caption}</p>}
      <button type="button" className="module-card__cta">
        Bereich öffnen
      </button>
    </article>
  );
}
