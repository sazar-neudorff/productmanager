import "../styles/ModuleCard.css";

interface ModuleCardProps {
  title: string;
  caption?: string;
  onSelect?: () => void;
}

export default function ModuleCard({ title, caption, onSelect }: ModuleCardProps) {
  const isInteractive = typeof onSelect === "function";

  return (
    <article
      className={`module-card ${isInteractive ? "module-card--interactive" : ""}`.trim()}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (!isInteractive) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.();
        }
      }}
    >
      <h3>{title}</h3>
      {caption && <p className="module-card__caption">{caption}</p>}
      {isInteractive && (
        <div className="module-card__cta">
          <span>Bereich öffnen</span>
        </div>
      )}
    </article>
  );
}
