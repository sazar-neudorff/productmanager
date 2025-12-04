import { useMemo, useState } from "react";

const OBI_COLUMNS = [
  "Land",
  "Artikel",
  "Lieferant",
  "GTIN- Neudorff",
  "Lieferanten-Name",
  "Sprache",
  "Lief.-Art.-Nr",
  "Produkttitel OnlineShop",
  "Artikelbeschreibung",
  "Bulletpoints",
  "Höhe netto in mm",
  "Tiefe netto in mm",
  "Gewicht netto in kg",
  "UVP",
  "Bild 1",
  "Bild 2",
  "Bild 3",
  "Bild 4",
  "Bild 5",
  "Bild 6",
  "Bild 7",
  "Bild 8",
  "Bild 9",
];
const OBI_IMAGE_COLUMNS = ["Bild 1", "Bild 2", "Bild 3", "Bild 4", "Bild 5", "Bild 6", "Bild 7", "Bild 8", "Bild 9"];

const MOCK_ROWS = [
  { sku: "ND-3100", ean: "400524000310", title: "Ferramol Schneckenkorn", status: "Bereit" },
  { sku: "ND-3101", ean: "400524000311", title: "Finalsan AF UnkrautFrei", status: "ToDo" },
];

export default function ObiTab() {
  const [eanFilter, setEanFilter] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<Record<string, boolean>>(() =>
    OBI_COLUMNS.reduce(
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
      OBI_COLUMNS.reduce(
        (acc, column) => ({
          ...acc,
          [column]: OBI_IMAGE_COLUMNS.includes(column),
        }),
        {} as Record<string, boolean>
      )
    );
  };

  const toggleAllColumns = () => {
    const allChecked = OBI_COLUMNS.every((column) => selectedColumns[column]);
    setSelectedColumns(
      OBI_COLUMNS.reduce(
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
            <p className="neudorff-panel__eyebrow">OBI Export</p>
            <h5>Spalten & Bilder</h5>
          </div>
        </div>
        <p className="neudorff-note">
          Bild- und CSV-Export für OBI. Matching erfolgt über GTIN- und Lieferanten-Nummern.
        </p>
      </div>

      <div className="neudorff-panel neudorff-panel--columns">
        <div className="neudorff-panel__header">
          <div>
            <p className="neudorff-panel__eyebrow">Spaltenauswahl</p>
            <h5>OBI Felder</h5>
          </div>
          <span className="neudorff-pill">{columnCount} aktiv</span>
        </div>
        <div className="neudorff-columns">
          {OBI_COLUMNS.map((column) => (
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
