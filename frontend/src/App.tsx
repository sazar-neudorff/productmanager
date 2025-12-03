import AppHeader from "./components/AppHeader";
import PortalSidebar from "./components/PortalSidebar";
import Home from "./pages/Home";

export default function App() {
  return (
    <div className="app-shell">
      <PortalSidebar />

      <div className="app-main">
        <AppHeader />

        <main className="app-content">
          <Home />
        </main>
      </div>
    </div>
  );
}
