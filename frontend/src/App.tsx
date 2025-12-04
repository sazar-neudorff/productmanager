import PortalSidebar from "./components/PortalSidebar";
import Home from "./pages/Home";

export default function App() {
  return (
    <div className="app-shell">
      <PortalSidebar />
      <main className="app-main" aria-label="Portalbereiche">
        <div className="app-content">
          <Home />
        </div>
      </main>
    </div>
  );
}
