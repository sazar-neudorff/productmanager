import "../styles/BestellCockpitPage.css";

const MOCK_PRODUCT = {
  title: "Ferramol Schneckenkorn",
  sku: "ND-4100",
  ean: "400524000410",
  price: 12.99,
  description: "Biologisches Schneckenkorn mit Eisen-III-Phosphat.",
};

export default function BestellCockpitPage() {
  return (
    <div className="cockpit-page">
      <header className="cockpit-hero">
        <div>
          <p className="cockpit-hero__eyebrow">Bestell Cockpit</p>
          <h2>Auftrag anlegen</h2>
          <p>
            Produkte suchen, Mengen kalkulieren und direkt eine Bestellung abschicken. Die Oberfläche
            ist speziell für die Fachberatung ausgelegt.
          </p>
        </div>
      </header>

      <section className="cockpit-panel">
        <div className="cockpit-panel__header">
          <h4>Produktsuche</h4>
        </div>
        <div className="cockpit-search-row">
          <label htmlFor="cockpit-query">EAN · SKU · Name</label>
          <input id="cockpit-query" placeholder="z.B. Ferramol, 400524..." />
          <button type="button">Suchen</button>
        </div>
      </section>

      <section className="cockpit-panel cockpit-layout">
        <div className="cockpit-product">
          <div className="cockpit-panel__header">
            <h4>Produkt</h4>
          </div>
          <div className="cockpit-product__preview">
            <div className="cockpit-product__image" aria-hidden="true" />
            <div>
              <p className="cockpit-product__title">{MOCK_PRODUCT.title}</p>
              <p className="cockpit-product__meta">
                SKU {MOCK_PRODUCT.sku} · EAN {MOCK_PRODUCT.ean}
              </p>
              <p className="cockpit-product__description">{MOCK_PRODUCT.description}</p>
            </div>
          </div>

          <div className="cockpit-product__form">
            <label htmlFor="cockpit-qty">Menge</label>
            <input id="cockpit-qty" type="number" min={1} defaultValue={1} />

            <label htmlFor="cockpit-price">Einzelpreis</label>
            <input id="cockpit-price" type="text" defaultValue={`${MOCK_PRODUCT.price.toFixed(2)} €`} />
          </div>
        </div>

        <div className="cockpit-costs">
          <div className="cockpit-panel__header">
            <h4>Kosten</h4>
          </div>
          <div className="cockpit-costs__row">
            <span>Zwischensumme</span>
            <strong>12,99 €</strong>
          </div>
          <div className="cockpit-costs__row">
            <span>Versand</span>
            <strong>2,50 €</strong>
          </div>
          <div className="cockpit-costs__row is-total">
            <span>Gesamt</span>
            <strong>15,49 €</strong>
          </div>
        </div>
      </section>

      <section className="cockpit-panel cockpit-address">
        <div className="cockpit-panel__header">
          <h4>Adresse</h4>
        </div>
        <div className="cockpit-address__forms">
          <div>
            <p className="cockpit-address__label">Lieferadresse</p>
            <label htmlFor="lieferfirma">Firma</label>
            <input id="lieferfirma" placeholder="Firma / Ansprechpartner" />
            <label htmlFor="lieferanschrift">Straße · Nr.</label>
            <input id="lieferanschrift" placeholder="Musterstraße 12" />
            <label htmlFor="lieferort">PLZ · Ort</label>
            <input id="lieferort" placeholder="12345 Gartenstadt" />
          </div>

          <div>
            <p className="cockpit-address__label">Rechnungsadresse</p>
            <label htmlFor="rechnungfirma">Firma</label>
            <input id="rechnungfirma" placeholder="Firma / Ansprechpartner" />
            <label htmlFor="rechnunganschrift">Straße · Nr.</label>
            <input id="rechnunganschrift" placeholder="Musterstraße 1" />
            <label htmlFor="rechnungort">PLZ · Ort</label>
            <input id="rechnungort" placeholder="12345 Gartenstadt" />
          </div>
        </div>
      </section>

      <section className="cockpit-panel cockpit-submit">
        <div className="cockpit-panel__header">
          <h4>Bestellung</h4>
        </div>
        <div className="cockpit-submit__grid">
          <textarea placeholder="Notizen zur Beratung oder Sonderwünsche" rows={3} />
          <div className="cockpit-submit__actions">
            <button type="button" className="secondary">
              Entwurf sichern
            </button>
            <button type="button">Abschicken</button>
          </div>
        </div>
      </section>
    </div>
  );
}
