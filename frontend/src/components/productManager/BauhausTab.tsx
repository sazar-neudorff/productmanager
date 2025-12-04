import { useMemo, useState } from "react";

const BAUHAUS_COLUMNS = [
  "Article Number",
  "GTIN- Neudorff",
  "Artikelnummer-Neudorff",
  "Produktbeschreibung",
  "Einleitungstext",
  "Type",
  "USP 1 Detail [de]",
  "USP 2 Detail [de]",
  "USP 3 Detail [de]",
  "USP 4 Detail [de]",
  "USP 5 Detail [de]",
  "USP 6 Detail [de]",
  "Product Line",
  "Product Name Category",
  "Anwendungstext",
  "Länge",
  "Breite",
  "Höhe",
  "Nettovolumen",
  "Nettomasse",
  "Gesamtstückzahl",
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
const BAUHAUS_IMAGE_COLUMNS = ["Bild 1", "Bild 2", "Bild 3", "Bild 4", "Bild 5", "Bild 6", "Bild 7", "Bild 8", "Bild 9"];

const MOCK_ROWS = [
  { sku: "ND-4100", ean: "400524000410", title: "BioTrissol Dünger", line: "BioTrissol" },
  { sku: "ND-4102", ean: "400524000411", title: "Ferramol Schneckenkorn", line: "Ferramol" },
];

export default function BauhausTab() {
  const [query, setQuery] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<Record<string, boolean>>(() =>
    BAUHAUS_COLUMNS.reduce(
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
      BAUHAUS_COLUMNS.reduce(
        (acc, column) => ({
          ...acc,
          [column]: BAUHAUS_IMAGE_COLUMNS.includes(column),
        }),
        {} as Record<string, boolean>
      )
    );
  };

  const toggleAllColumns = () => {
    const allChecked = BAUHAUS_COLUMNS.every((column) => selectedColumns[column]);
    setSelectedColumns(
      BAUHAUS_COLUMNS.reduce(
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
            <p className="neudorff-panel__eyebrow">Bauhaus Routing</p>
            <h5>Produktlinien & Attribute</h5>
          </div>
        </div>
        <p className="neudorff-note">
          Aufbereitung für Bauhaus mit Product Line, USP-Slots und Nettovolumen/Nettomasse.
        </p>
      </div>

      <div className="neudorff-panel neudorff-panel--columns">
        <div className="neudorff-panel__header">
          <div>
            <p className="neudorff-panel__eyebrow">Spaltenauswahl</p>
            <h5>Bauhaus Felder</h5>
          </div>
          <span className="neudorff-pill">{columnCount} aktiv</span>
        </div>
        <div className="neudorff-columns">
          {BAUHAUS_COLUMNS.map((column) => (
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
          <label htmlFor="bauhaus-filter">Suchfeld</label>
          <input
            id="bauhaus-filter"
            placeholder="EAN, SKU oder Produktname ..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
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
