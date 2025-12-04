import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import "../styles/ProductManager.css";
import NeudorffTab from "./productManager/NeudorffTab";
import ShopifyTab from "./productManager/ShopifyTab";
import ObiTab from "./productManager/ObiTab";
import BauhausTab from "./productManager/BauhausTab";

type SubTab = {
  id: string;
  label: string;
  eyebrow?: string;
  description: string;
  meta: string;
  tasks?: string[];
  component?: ReactNode;
};

type MainTab = {
  id: string;
  label: string;
  description: string;
  subTabs: SubTab[];
};

const MAIN_TABS: MainTab[] = [
  {
    id: "product",
    label: "Produkt Management",
    description: "Module für Katalog, Shops und Partnerplattformen.",
    subTabs: [
      {
        id: "neudorff",
        label: "Neudorff",
        eyebrow: "Portal",
        description:
          "Zentrale Pflege der internen Daten. Codes, Sets und Exporte laufen hier zusammen.",
        meta: "Codes & Pflege",
        component: <NeudorffTab />,
      },
      {
        id: "shopify",
        label: "Shopify",
        eyebrow: "Shop",
        description:
          "Shopify-spezifische Produktansichten inklusive Assets, Preise und Verfügbarkeiten.",
        meta: "Shop Daten",
        component: <ShopifyTab />,
      },
      {
        id: "obi",
        label: "OBI",
        eyebrow: "Partner",
        description:
          "Exportprofile und Pflichtfelder für OBI. Enthält Freigaben und Kontrolllisten.",
        meta: "OBI Export",
        component: <ObiTab />,
      },
      {
        id: "bauhaus",
        label: "Bauhaus",
        eyebrow: "Partner",
        description:
          "Bauhaus Routing inkl. Bebilderung und Attribut-Templates für Sortiment A/B.",
        meta: "Templates",
        component: <BauhausTab />,
      },
    ],
  },
];

export default function ProductManagerLauncher() {
  const [activeMainTab, setActiveMainTab] = useState<string>(MAIN_TABS[0].id);
  const hasMultipleMainTabs = MAIN_TABS.length > 1;
  const initialSubSelections = useMemo(
    () =>
      MAIN_TABS.reduce<Record<string, string>>((acc, tab) => {
        acc[tab.id] = tab.subTabs[0]?.id ?? "";
        return acc;
      }, {}),
    []
  );
  const [activeSubTabs, setActiveSubTabs] = useState<Record<string, string>>(initialSubSelections);

  const currentMainTab = MAIN_TABS.find((tab) => tab.id === activeMainTab) ?? MAIN_TABS[0];
  const activeSubId = activeSubTabs[activeMainTab] ?? currentMainTab.subTabs[0]?.id ?? "";
  const activeSubTab =
    currentMainTab.subTabs.find((subTab) => subTab.id === activeSubId) ?? currentMainTab.subTabs[0];

  const handleSubTabChange = (subTabId: string) => {
    setActiveSubTabs((prev) => ({
      ...prev,
      [activeMainTab]: subTabId,
    }));
  };

  return (
    <section className="product-launcher" aria-label="Produktmanager Launcher">
      <header className="product-launcher__header">
        <div>
          <p className="product-launcher__eyebrow">Launcher</p>
          <h3>Produktmanager</h3>
          <p className="product-launcher__description">
            Startpunkt für die Module aus dem Desktop-Tool. Oberfläche ist vorbereitet, Funktionen
            folgen.
          </p>
        </div>

        <div className="product-launcher__meta">
          <span className="product-launcher__badge">Beta</span>
          <p>UI Preview</p>
        </div>
      </header>

      {hasMultipleMainTabs && (
        <div className="product-launcher__main-tabs" role="tablist" aria-label="Launcher Bereiche">
          {MAIN_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeMainTab === tab.id}
              className={`product-launcher__main-tab ${
                activeMainTab === tab.id ? "is-active" : ""
              }`.trim()}
              onClick={() => setActiveMainTab(tab.id)}
            >
              <span className="product-launcher__main-tab-label">{tab.label}</span>
              <span className="product-launcher__main-tab-hint">{tab.description}</span>
            </button>
          ))}
        </div>
      )}

      <div className="product-launcher__body">
        <div
          className="product-launcher__subtabs"
          role="tablist"
          aria-label={`${currentMainTab.label} Unterbereiche`}
        >
          {currentMainTab.subTabs.map((subTab) => (
            <button
              key={subTab.id}
              type="button"
              role="tab"
              aria-selected={activeSubId === subTab.id}
              className={`product-launcher__subtab ${
                activeSubId === subTab.id ? "is-active" : ""
              }`.trim()}
              onClick={() => handleSubTabChange(subTab.id)}
            >
              <span className="product-launcher__subtab-label">{subTab.label}</span>
              <span className="product-launcher__subtab-hint">{subTab.meta}</span>
            </button>
          ))}
        </div>

        <div
          className={`product-launcher__content ${
            activeSubTab?.component ? "product-launcher__content--embedded" : ""
          }`.trim()}
        >
          {activeSubTab?.component ? (
            activeSubTab.component
          ) : (
            <>
              {activeSubTab?.eyebrow && (
                <p className="product-launcher__content-eyebrow">{activeSubTab.eyebrow}</p>
              )}
              <h4>{activeSubTab?.label}</h4>
              <p className="product-launcher__content-description">{activeSubTab?.description}</p>

              {activeSubTab?.tasks && (
                <ul className="product-launcher__task-list">
                  {activeSubTab.tasks.map((task) => (
                    <li key={task}>{task}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
