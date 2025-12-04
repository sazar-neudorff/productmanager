import { useState } from "react";

const MOCK_ROWS = [
  { sku: "ND-3100", ean: "400524000310", title: "Ferramol Schneckenkorn", status: "Bereit" },
  { sku: "ND-3101", ean: "400524000311", title: "Finalsan AF UnkrautFrei", status: "ToDo" },
];

export default function ObiTab() {
  const [eanFilter, setEanFilter] = useState("");

  return (
    <div className="neudorff-tab">
      <div className="neudorff-panel">
        <div className="neudorff-panel__header">
          <div>
            <p className="neudorff-panel__eyebrow">OBI Export</p>
            <h5>Spalten & Bilder</h5>
          </div>
        </div>
        <p className="neudorff-note">
          Bild- und CSV-Export für OBI. Matching erfolgt über GTIN- und Lieferanten-Nummern.
        </p>
      </div>

      <div className="neudorff-panel">
        <div className="neudorff-panel__header">
          <div>
            <p className="neudorff-panel__eyebrow">Filter</p>
            <h5>EAN oder Lief.-Art.-Nr</h5>
          </div>
        </div>
        <div className="neudorff-filter-row">
          <label htmlFor="obi-filter">Werte eingeben</label>
          <input
            id="obi-filter"
            placeholder="400524..."
            value={eanFilter}
            onChange={(event) => setEanFilter(event.target.value)}
          />
          <button type="button">Filtern</button>
          <button type="button" className="secondary">
            Exportieren
          </button>
        </div>
      </div>

      <div className="neudorff-panel neudorff-panel--table">
        <div className="neudorff-panel__header">
          <div>
            <p className="neudorff-panel__eyebrow">Produktliste</p>
            <h5>Mockdaten</h5>
          </div>
          <span className="neudorff-pill">{MOCK_ROWS.length} Datensätze</span>
        </div>
        <div className="neudorff-table-wrapper">
          <table className="neudorff-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>EAN</th>
                <th>Produkt</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ROWS.map((row) => (
                <tr key={row.sku}>
                  <td>{row.sku}</td>
                  <td>{row.ean}</td>
                  <td>{row.title}</td>
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
