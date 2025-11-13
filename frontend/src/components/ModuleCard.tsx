import "../styles/AppHeader.css";

interface ModuleCardProps {
  title: string;
  text: string;
}

export default function ModuleCard({ title, text }: ModuleCardProps) {
  return (
    <div className="module-card">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
