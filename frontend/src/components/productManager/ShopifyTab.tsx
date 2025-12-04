import { useState } from "react";

const COUNTRY_OPTIONS = ["DE", "AT", "CH"];
const MOCK_ROWS = [
  { handle: "mulch-master", sku: "ND-2010", ean: "400524000120", status: "Bereit" },
  { handle: "spruzit-pro", sku: "ND-2011", ean: "400524000121", status: "Review" },
];

export default function ShopifyTab() {
  const [country, setCountry] = useState("DE");
  const [search, setSearch] = useState("");
  const [eanFilter, setEanFilter] = useState("");

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
        <p className="neudorff-note">
          Zuletzt aktualisiert · 09:40 · Exportdatei für {country}
        </p>
      </div>

      <div className="neudorff-panel">
        <div className="neudorff-panel__header">
          <div>
            <p className="neudorff-panel__eyebrow">Filter</p>
            <h5>Handles & Varianten</h5>
          </div>
        </div>
        <div className="neudorff-filter-row">
          <label htmlFor="shopify-ean">EAN / ArtNr</label>
          <input
            id="shopify-ean"
            placeholder="400524..."
            value={eanFilter}
            onChange={(event) => setEanFilter(event.target.value)}
          />
          <label htmlFor="shopify-search">Handle</label>
          <input
            id="shopify-search"
            placeholder="mulch-master ..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
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
