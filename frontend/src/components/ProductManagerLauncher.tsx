import { useState } from "react";
import type { ReactNode } from "react";
import "../styles/ProductManager.css";
import NeudorffTab from "./productManager/NeudorffTab";
import ShopifyTab from "./productManager/ShopifyTab";
import ObiTab from "./productManager/ObiTab";
import BauhausTab from "./productManager/BauhausTab";

type ProductTab = {
  id: string;
  label: string;
  description: string;
  component: ReactNode;
};

const PRODUCT_TABS: ProductTab[] = [
  {
    id: "neudorff",
    label: "Neudorff",
    description: "Codes, Sets und Exporte",
    component: <NeudorffTab />,
  },
  {
    id: "shopify",
    label: "Shopify",
    description: "Handle & Varianten",
    component: <ShopifyTab />,
  },
  {
    id: "obi",
    label: "OBI",
    description: "Spalten & Bilder",
    component: <ObiTab />,
  },
  {
    id: "bauhaus",
    label: "Bauhaus",
    description: "Produktlinien & USP",
    component: <BauhausTab />,
  },
];

export default function ProductManagerLauncher() {
  const [activeTabId, setActiveTabId] = useState<string>(PRODUCT_TABS[0].id);
  const activeTab = PRODUCT_TABS.find((tab) => tab.id === activeTabId) ?? PRODUCT_TABS[0];

  return (
    <section className="product-launcher" aria-label="Produktmanager Launcher">
      <header className="product-launcher__header">
        <div>
          <p className="product-launcher__eyebrow">Launcher</p>
          <h3>Produktmanager</h3>
          <p className="product-launcher__description">
            Startpunkt für alle Daten-Flows aus dem Desktop-Tool. Funktionen folgen Schritt für
            Schritt.
          </p>
        </div>

        <div className="product-launcher__meta">
          <span className="product-launcher__badge">Beta</span>
          <p>UI Preview</p>
        </div>
      </header>

      <div className="product-launcher__tab-bar" role="tablist" aria-label="Produktmanager Tabs">
        {PRODUCT_TABS.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`product-launcher__tab ${isActive ? "is-active" : ""}`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <span className="product-launcher__tab-label">{tab.label}</span>
              <span className="product-launcher__tab-hint">{tab.description}</span>
            </button>
          );
        })}
      </div>

      <div className="product-launcher__content product-launcher__content--embedded">
        {activeTab.component}
      </div>
    </section>
  );
}
