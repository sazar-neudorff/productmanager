import { useState } from "react";

const MOCK_ROWS = [
  { sku: "ND-4100", ean: "400524000410", title: "BioTrissol Dünger", line: "BioTrissol" },
  { sku: "ND-4102", ean: "400524000411", title: "Ferramol Schneckenkorn", line: "Ferramol" },
];

export default function BauhausTab() {
  const [filter, setFilter] = useState("");

  return (
    <div className="neudorff-tab">
      <div className="neudorff-panel">
        <div className="neudorff-panel__header">
          <div>
            <p className="neudorff-panel__eyebrow">Bauhaus Routing</p>
            <h5>Produktlinien & Attribute</h5>
          </div>
        </div>
        <p className="neudorff-note">
          Aufbereitung für Bauhaus mit Product Line, USP-Slots und Nettovolumen/Nettomasse.
        </p>
      </div>

      <div className="neudorff-panel">
        <div className="neudorff-panel__header">
          <div>
            <p className="neudorff-panel__eyebrow">Suche</p>
            <h5>Product Line oder Name</h5>
          </div>
        </div>
        <div className="neudorff-filter-row">
          <label htmlFor="bauhaus-filter">Begriff</label>
          <input
            id="bauhaus-filter"
            placeholder="BioTrissol ..."
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
          <button type="button">Filtern</button>
          <button type="button" className="secondary">
            Export
          </button>
        </div>
      </div>

      <div className="neudorff-panel neudorff-panel--table">
        <div className="neudorff-panel__header">
          <div>
            <p className="neudorff-panel__eyebrow">Produktliste</p>
            <h5>Mockdaten</h5>
          </div>
          <span className="neudorff-pill">{MOCK_ROWS.length} Produkte</span>
        </div>
        <div className="neudorff-table-wrapper">
          <table className="neudorff-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>EAN</th>
                <th>Produkt</th>
                <th>Product Line</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ROWS.map((row) => (
                <tr key={row.sku}>
                  <td>{row.sku}</td>
                  <td>{row.ean}</td>
                  <td>{row.title}</td>
                  <td>{row.line}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
