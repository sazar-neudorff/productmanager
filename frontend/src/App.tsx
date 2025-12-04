import AppHeader from "./components/AppHeader";
import PortalSidebar from "./components/PortalSidebar";
import Home from "./pages/Home";

export default function App() {
  return (
    <div className="app-shell admin-wrapper">
      <div className="admin-container">
        <PortalSidebar />

        <div className="app-main admin-content">
          <div className="admin-content__inner">
            <AppHeader />

            <main className="app-content" aria-label="Portalbereiche">
              <Home />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
