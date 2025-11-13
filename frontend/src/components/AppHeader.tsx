import "../styles/AppHeader.css";

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-title">Tool Suite</div>

      <nav className="app-tabs">
        <button className="tab active">Start</button>
        <button className="tab">Tool A</button>
        <button className="tab">Tool B</button>
        <button className="tab">Tool C</button>
      </nav>
    </header>
  );
}
