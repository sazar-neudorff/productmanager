import { useMemo, useState } from "react";
import PortalSidebar from "./components/PortalSidebar";
import Home from "./pages/Home";
import ProductManagementPage from "./pages/ProductManagementPage";
import BestellCockpitPage from "./pages/BestellCockpitPage";
import AutomationsPage from "./pages/AutomationsPage";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "./auth/AuthContext";
import AdminPage from "./pages/AdminPage";

type ViewId =
  | "home"
  | "product-management"
  | "nuetzlingsportal"
  | "bestell-cockpit"
  | "automations"
  | "admin";

const NAV_ITEMS: Array<{ id: ViewId; label: string; description: string }> = [
  { id: "home", label: "Start", description: "Übersicht & Module" },
  { id: "product-management", label: "Produktmanagement", description: "Exporte & Shops" },
  { id: "bestell-cockpit", label: "Bestell Cockpit", description: "Aufträge & Routing" },
  { id: "automations", label: "Automatisierungen", description: "Jobs & Status" },
  { id: "admin", label: "Admin", description: "User & Berechtigungen" },
];
const isViewId = (value: string): value is ViewId =>
  NAV_ITEMS.some((item) => item.id === value);

export default function App() {
  const { isLoading, user, permissions, logout } = useAuth();
  const [activeView, setActiveView] = useState<ViewId>("home");

  const handleNavigate = (view: string) => {
    if (isViewId(view)) {
      setActiveView(view);
    }
  };

  const handleModuleSelect = (moduleId: string) => {
    if (isViewId(moduleId) && moduleId !== "home") {
      setActiveView(moduleId);
    }
  };

  const activeContent = useMemo(() => {
    switch (activeView) {
      case "product-management":
        return <ProductManagementPage />;
      case "bestell-cockpit":
        return <BestellCockpitPage />;
      case "automations":
        return <AutomationsPage />;
      case "admin":
        return <AdminPage />;
      case "home":
        return <Home onSelectModule={handleModuleSelect} />;
      case "nuetzlingsportal":
      default:
        return (
          <div className="placeholder-view">
            <p className="placeholder-view__kicker">In Arbeit</p>
            <h2>Bereich {NAV_ITEMS.find((n) => n.id === activeView)?.label}</h2>
            <p>Dieser Bereich wird als Nächstes ins Web-Portal gebracht.</p>
          </div>
        );
    }
  }, [activeView]);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        Lade…
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const allowedNav = NAV_ITEMS.filter((item) => {
    if (item.id === "home") return true;
    if (item.id === "admin") return Boolean(user.isOwner) || permissions.includes("admin_panel");
    if (item.id === "product-management") return permissions.includes("product_management") || Boolean(user.isOwner);
    if (item.id === "bestell-cockpit") return permissions.includes("bestell_cockpit") || Boolean(user.isOwner);
    if (item.id === "automations") return permissions.includes("automations") || Boolean(user.isOwner);
    return true;
  });

  return (
    <div className="app-shell">
      <PortalSidebar
        navigation={allowedNav}
        activeView={activeView}
        onNavigate={handleNavigate}
        currentUser={user}
        onLogout={() => void logout()}
      />
      <main className="app-main" aria-live="polite">
        <div className="app-content">{activeContent}</div>
      </main>
    </div>
  );
}
