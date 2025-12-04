import "../styles/ModuleCard.css";

type ModuleStatus = "stable" | "attention" | "warning";

interface ModuleCardProps {
  title: string;
  description?: string;
  owner: string;
  updatedAt: string;
  kpi?: {
    label: string;
    value: string;
  };
  tags?: string[];
  status?: ModuleStatus;
}

const statusCopy: Record<ModuleStatus, string> = {
  stable: "Stabil",
  attention: "Review",
  warning: "Achtung",
};

export default function ModuleCard({
  title,
  description,
  owner,
  updatedAt,
  kpi,
  tags = [],
  status = "stable",
}: ModuleCardProps) {
  return (
    <article className={`module-card module-card--${status}`}>
      <div className="module-card__top">
        <span className="module-card__kicker">{owner}</span>
        <span className={`module-card__status module-card__status--${status}`}>
          {statusCopy[status]}
        </span>
      </div>

      <h3>{title}</h3>
      {description && <p className="module-card__description">{description}</p>}

      {kpi && (
        <div className="module-card__kpi">
          <span>{kpi.label}</span>
          <strong>{kpi.value}</strong>
        </div>
      )}

      {tags.length > 0 && (
        <div className="module-card__tags">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}

      <div className="module-card__footer">
        <span className="module-card__meta">{updatedAt}</span>
        <button type="button" className="module-card__cta">
          Bereich öffnen
        </button>
      </div>
    </article>
  );
}
