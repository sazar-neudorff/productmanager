import { useMemo, useState } from "react";

const COUNTRY_OPTIONS = ["DE", "AT", "CH"];
const SHOPIFY_COLUMNS = [
  "Handle",
  "Title",
  "Body (HTML)",
  "Vendor",
  "Type",
  "Tags",
  "Published",
  "Variant SKU",
  "Variant Barcode",
  "Variant Price",
  "Option1 Name",
  "Option1 Value",
  "Meta Description",
  "product.metafields.custom.headline",
  "product.metafields.custom.anwendungstipp",
  "product.metafields.custom.beschreibung_lang",
  "product.metafields.custom.hinweise_zur_anwendung",
  "product.metafields.custom.packungsgr_en_wirkstoff",
  "product.metafields.custom.lieferzeit",
  "product.metafields.custom.downloads",
  "product.metafields.custom.downloads_gebrauchsanweisungen",
  "product.metafields.custom.downloads_broschueren",
  "Variant Fulfillment Service",
  "Variant Inventory Tracker",
  "Image Src",
  "Image Position",
  "Variant Image",
];
const SHOPIFY_IMAGE_COLUMNS = ["Image Src", "Image Position", "Variant Image"];

const MOCK_ROWS = [
  { handle: "mulch-master", sku: "ND-2010", ean: "400524000120", status: "Bereit" },
  { handle: "spruzit-pro", sku: "ND-2011", ean: "400524000121", status: "Review" },
];

export default function ShopifyTab() {
  const [country, setCountry] = useState("DE");
  const [query, setQuery] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<Record<string, boolean>>(() =>
    SHOPIFY_COLUMNS.reduce(
      (acc, column) => ({
        ...acc,
        [column]: true,
      }),
      {} as Record<string, boolean>
    )
  );

  const columnCount = useMemo(
    () => Object.values(selectedColumns).filter(Boolean).length,
    [selectedColumns]
  );

  const toggleColumn = (column: string) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const selectOnlyImages = () => {
    setSelectedColumns(
      SHOPIFY_COLUMNS.reduce(
        (acc, column) => ({
          ...acc,
          [column]: SHOPIFY_IMAGE_COLUMNS.includes(column),
        }),
        {} as Record<string, boolean>
      )
    );
  };

  const toggleAllColumns = () => {
    const allChecked = SHOPIFY_COLUMNS.every((column) => selectedColumns[column]);
    setSelectedColumns(
      SHOPIFY_COLUMNS.reduce(
        (acc, column) => ({
          ...acc,
          [column]: !allChecked,
        }),
        {} as Record<string, boolean>
      )
    );
  };

  return (
    <div className="neudorff-tab">
      <div className="neudorff-panel">
        <div className="neudorff-panel__header">
          <div>
            <p className="neudorff-panel__eyebrow">Shopify</p>
            <h5>Exportprofil auswählen</h5>
          </div>
          <div className="neudorff-country-select">
            <label htmlFor="shopify-country">Land</label>
            <select
              id="shopify-country"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
            >
              {COUNTRY_OPTIONS.map((code) => (
                <option key={code}>{code}</option>
              ))}
            </select>
            <button type="button">Neu laden</button>
          </div>
        </div>
        <p className="neudorff-note">Zuletzt aktualisiert · 09:40 · Exportdatei für {country}</p>
      </div>

      <div className="neudorff-panel neudorff-panel--columns">
        <div className="neudorff-panel__header">
          <div>
            <p className="neudorff-panel__eyebrow">Spaltenauswahl</p>
            <h5>Shopify CSV Felder</h5>
          </div>
          <span className="neudorff-pill">{columnCount} aktiv</span>
        </div>
        <div className="neudorff-columns neudorff-columns--two">
          {SHOPIFY_COLUMNS.map((column) => (
            <label key={column} className="neudorff-checkbox">
              <input
                type="checkbox"
                checked={!!selectedColumns[column]}
                onChange={() => toggleColumn(column)}
              />
              <span>{column}</span>
            </label>
          ))}
        </div>
        <div className="neudorff-panel__actions">
          <button type="button" onClick={selectOnlyImages}>
            Nur Bilder auswählen
          </button>
          <button type="button" onClick={toggleAllColumns}>
            Alle umschalten
          </button>
        </div>
      </div>

      <div className="neudorff-panel">
        <div className="neudorff-panel__header">
          <div>
            <p className="neudorff-panel__eyebrow">Filter</p>
            <h5>EAN · SKU · Produktname</h5>
          </div>
        </div>
        <div className="neudorff-filter-row">
          <label htmlFor="shopify-filter">Suchfeld</label>
          <input
            id="shopify-filter"
            placeholder="EAN, SKU oder Produktname eingeben ..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="button">Filtern</button>
          <button type="button" className="secondary">
            CSV Export
          </button>
        </div>
      </div>

      <div className="neudorff-panel neudorff-panel--table">
        <div className="neudorff-panel__header">
          <div>
            <p className="neudorff-panel__eyebrow">Produktliste</p>
            <h5>Mockdaten</h5>
          </div>
          <span className="neudorff-pill">{MOCK_ROWS.length} Varianten</span>
        </div>
        <div className="neudorff-table-wrapper">
          <table className="neudorff-table">
            <thead>
              <tr>
                <th>Handle</th>
                <th>SKU</th>
                <th>EAN</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ROWS.map((row) => (
                <tr key={row.sku}>
                  <td>{row.handle}</td>
                  <td>{row.sku}</td>
                  <td>{row.ean}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
