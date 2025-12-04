import "../styles/ModuleCard.css";

interface ModuleCardProps {
  id?: string;
  title: string;
  caption?: string;
  isActive?: boolean;
  onSelect?: () => void;
}

export default function ModuleCard({
  id,
  title,
  caption,
  isActive = false,
  onSelect,
}: ModuleCardProps) {
  return (
    <article
      className={`module-card ${isActive ? "module-card--active" : ""}`.trim()}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      data-module-id={id}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.();
        }
      }}
    >
      <h3>{title}</h3>
      {caption && <p className="module-card__caption">{caption}</p>}
      <div className="module-card__cta">
        <span>{isActive ? "Ausgewählt" : "Bereich öffnen"}</span>
      </div>
    </article>
  );
}
