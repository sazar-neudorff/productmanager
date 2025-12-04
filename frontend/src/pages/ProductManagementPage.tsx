import ProductManagerLauncher from "../components/ProductManagerLauncher";
import "../styles/ProductManagementPage.css";

export default function ProductManagementPage() {
  return (
    <div className="product-management-page">
      <header className="product-management-hero">
        <div>
          <p className="product-management-hero__eyebrow">Produkt Management</p>
          <h2>Produktmanager</h2>
          <p>
            Desktop-Workflow für Neudorff, Shopify, OBI und Bauhaus. Hier steuerst du Datenexporte,
            Spalten, Bildpakete und Filter – ohne das lokale Tool öffnen zu müssen.
          </p>
        </div>
        <div className="product-management-hero__actions">
          <button type="button">API Status</button>
          <button type="button" className="secondary">
            Zu den Datasets
          </button>
        </div>
      </header>

      <ProductManagerLauncher />
    </div>
  );
}
