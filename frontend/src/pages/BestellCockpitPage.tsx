import { useMemo, useState } from "react";
import "../styles/BestellCockpitPage.css";

const MOCK_PRODUCTS = [
  {
    id: "p-0001",
  title: "Ferramol Schneckenkorn",
  sku: "ND-4100",
  ean: "400524000410",
  price: 12.99,
  description: "Biologisches Schneckenkorn mit Eisen-III-Phosphat.",
    image: "https://api.neudorff.de/fileadmin/media-pim/bild_1.png",
  },
  {
    id: "p-0002",
    title: "Finalsan AF UnkrautFrei",
    sku: "ND-4105",
    ean: "400524000415",
    price: 9.49,
    description: "Anwendungsfertiger Unkrautvernichter für Wege und Plätze.",
    image: "https://api.neudorff.de/fileadmin/media-pim/bild_2.png",
  },
];

export default function BestellCockpitPage() {
  const [search, setSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(MOCK_PRODUCTS[0].id);
  const [quantity, setQuantity] = useState(1);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return MOCK_PRODUCTS;
    const term = search.toLowerCase();
    return MOCK_PRODUCTS.filter(
      (product) =>
        product.title.toLowerCase().includes(term) ||
        product.ean.includes(term) ||
        product.sku.toLowerCase().includes(term)
    );
  }, [search]);

  const selectedProduct =
    MOCK_PRODUCTS.find((product) => product.id === selectedProductId) ?? MOCK_PRODUCTS[0];

  const totalPrice = useMemo(() => {
    return (selectedProduct.price * quantity).toFixed(2);
  }, [selectedProduct.price, quantity]);

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
        <div className="cockpit-search">
          <label htmlFor="cockpit-query">EAN · SKU · Name</label>
          <div className="cockpit-search__field">
            <input
              id="cockpit-query"
              placeholder="z.B. Ferramol, 400524..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {search && (
              <button
                type="button"
                className="cockpit-search__clear"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setSearch("")}
                aria-label="Eingabe leeren"
              >
                ×
              </button>
            )}
          </div>
          {isSearchFocused && filteredProducts.length > 0 && (
            <div className="cockpit-search__combo" role="listbox">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className={`cockpit-search__item ${
                    selectedProductId === product.id ? "is-selected" : ""
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setSelectedProductId(product.id);
                    setSearch("");
                  }}
                >
                  <img src={product.image} alt="" aria-hidden="true" />
                  <div>
                    <p className="cockpit-search__item-title">{product.title}</p>
                    <p className="cockpit-search__item-meta">
                      SKU {product.sku} · EAN {product.ean}
                    </p>
                  </div>
                  <strong>{product.price.toFixed(2)} €</strong>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="cockpit-panel cockpit-layout">
        <div className="cockpit-product">
          <div className="cockpit-panel__header">
            <h4>Produkt</h4>
          </div>
          <div className="cockpit-product__preview">
            <img
              src={selectedProduct.image}
              alt=""
              className="cockpit-product__image"
            />
            <div>
              <p className="cockpit-product__title">{selectedProduct.title}</p>
              <p className="cockpit-product__meta">
                SKU {selectedProduct.sku} · EAN {selectedProduct.ean}
              </p>
              <p className="cockpit-product__description">{selectedProduct.description}</p>
            </div>
          </div>

          <div className="cockpit-product__form">
            <label htmlFor="cockpit-qty">Menge</label>
            <input
              id="cockpit-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
            />

            <label htmlFor="cockpit-price">Einzelpreis</label>
            <input
              id="cockpit-price"
              type="text"
              value={`${selectedProduct.price.toFixed(2)} €`}
              readOnly
            />
          </div>
        </div>

        <div className="cockpit-costs">
          <div className="cockpit-panel__header">
            <h4>Kosten</h4>
          </div>
        <div className="cockpit-costs__row">
          <span>Zwischensumme</span>
          <strong>{(selectedProduct.price * quantity).toFixed(2)} €</strong>
        </div>
        <div className="cockpit-costs__row">
          <span>Versand</span>
          <strong>0,00 €</strong>
        </div>
        <div className="cockpit-costs__row is-total">
          <span>Gesamt</span>
          <strong>{totalPrice} €</strong>
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
