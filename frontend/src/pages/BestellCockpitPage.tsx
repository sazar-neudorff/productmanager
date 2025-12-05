import { useMemo, useState } from "react";
import Select, { type SingleValue } from "react-select";
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

type ProductOption = {
  value: string;
  label: string;
  sku: string;
  ean: string;
  image: string;
  price: number;
  description: string;
};

export default function BestellCockpitPage() {
  const [selectedProductId, setSelectedProductId] = useState(MOCK_PRODUCTS[0].id);
  const [quantity, setQuantity] = useState(1);
  const [selectInputValue, setSelectInputValue] = useState("");

  const productOptions: ProductOption[] = useMemo(
    () =>
      MOCK_PRODUCTS.map((product) => ({
        value: product.id,
        label: product.title,
        sku: product.sku,
        ean: product.ean,
        image: product.image,
        price: product.price,
        description: product.description,
      })),
    []
  );

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
        <div className="cockpit-select">
          <label htmlFor="cockpit-select">EAN · SKU · Name</label>
          <Select
            inputId="cockpit-select"
            classNamePrefix="rs"
            options={productOptions}
            isSearchable
            placeholder="Produkt auswählen…"
            value={null}
            inputValue={selectInputValue}
            onInputChange={(value, { action }) => {
              if (action === "input-change") {
                setSelectInputValue(value);
              } else if (action === "menu-close") {
                setSelectInputValue("");
              }
            }}
            onChange={(option: SingleValue<ProductOption>) => {
              if (option) {
                setSelectedProductId(option.value);
                setSelectInputValue("");
              }
            }}
            filterOption={(option, inputValue) => {
              const term = inputValue.toLowerCase();
              return (
                option.label.toLowerCase().includes(term) ||
                option.data.sku.toLowerCase().includes(term) ||
                option.data.ean.includes(term)
              );
            }}
            formatOptionLabel={(option) => (
              <div className="cockpit-select-option">
                <img src={option.image} alt="" aria-hidden="true" />
                <div>
                  <p className="cockpit-select-option__title">{option.label}</p>
                  <p className="cockpit-select-option__meta">
                    SKU {option.sku} · EAN {option.ean}
                  </p>
                  <p className="cockpit-select-option__description">{option.description}</p>
                </div>
                <strong>{option.price.toFixed(2)} €</strong>
              </div>
            )}
            components={{
              IndicatorSeparator: () => null,
            }}
          />
        </div>
      </section>

      <section className="cockpit-panel cockpit-layout">
        <div className="cockpit-product">
          <div className="cockpit-panel__header">
            <h4>Produkt</h4>
          </div>
          <div className="cockpit-product__preview">
            <img src={selectedProduct.image} alt="" className="cockpit-product__image" />
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
