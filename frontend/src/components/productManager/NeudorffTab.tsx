import { useMemo, useState } from "react";
import "../../styles/NeudorffTab.css";

const COUNTRY_OPTIONS = ["DE", "ES", "AT", "CH", "NO", "SE", "FI", "UK"];

const COLUMN_OPTIONS = [
  "SKU",
  "EAN",
  "Title",
  "Title 2",
  "Einleitungstext",
  "Produkt Kategorie",
  "UVP",
  "Subline",
  "Bulletpoints",
  "Produktbeschreibung",
  "Produktbeschreibung (clean)",
  "Anwendungstext",
  "Packungsgroeße",
  "Hero",
  "Bild 1",
  "Bild 2",
  "Bild 3",
  "Bild 4",
  "Bild 5",
  "Bild 6",
  "Bild 7",
  "Bild 8",
  "Bild 9",
  "Sicherheitsblatt",
  "Sicherheitsblatt 2",
  "Sicherheitsblatt 3",
  "Gebrauchsanweisungen",
  "CLP",
];

const IMAGE_LABELS = ["Hero", ...Array.from({ length: 9 }, (_, idx) => `Bild ${idx + 1}`)];

const MOCK_ROWS = [
  {
    sku: "ND-1001",
    ean: "400524000001",
    title: "Schädlingsfrei Naturen",
    uvp: "12,99 €",
    status: "Hauptartikel",
  },
  {
    sku: "ND-1002",
    ean: "400524000002",
    title: "Blattlausfrei Provanto",
    uvp: "9,49 €",
    status: "Variante",
  },
  {
    sku: "ND-1003",
    ean: "400524000003",
    title: "Unkrautfrei Plus",
    uvp: "15,99 €",
    status: "Variante",
  },
];

export default function NeudorffTab() {
  const [country, setCountry] = useState("DE");
  const [selectedColumns, setSelectedColumns] = useState<Record<string, boolean>>(() =>
    COLUMN_OPTIONS.reduce((acc, col) => {
      acc[col] = !col.startsWith("Sicherheitsblatt") && !col.startsWith("CLP") ? true : col === "Sicherheitsblatt";
      return acc;
    }, {} as Record<string, boolean>)
  );
  const [imageSelections, setImageSelections] = useState<Record<string, boolean>>(() =>
    IMAGE_LABELS.reduce(
      (acc, label) => ({
        ...acc,
        [label]: label === "Hero",
      }),
      {}
    )
  );
  const [filterValue, setFilterValue] = useState("");
  const [note, setNote] = useState<string | null>(null);

  const safetyChecked = selectedColumns["Sicherheitsblatt"];

  const toggleColumn = (column: string) => {
    if (column === "Sicherheitsblatt") {
      const next = !selectedColumns["Sicherheitsblatt"];
      setSelectedColumns((prev) => ({
        ...prev,
        "Sicherheitsblatt": next,
        "Sicherheitsblatt 2": next,
        "Sicherheitsblatt 3": next,
      }));
      return;
    }

    if (column === "CLP") {
      setSelectedColumns((prev) => ({
        ...prev,
        CLP: !prev.CLP,
      }));
      return;
    }

    setSelectedColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const selectOnlyImages = () => {
    setSelectedColumns(
      COLUMN_OPTIONS.reduce(
        (acc, col) => ({
          ...acc,
          [col]: col.startsWith("Bild"),
        }),
        {} as Record<string, boolean>
      )
    );
  };

  const toggleAllColumns = () => {
    const allChecked = COLUMN_OPTIONS.every((col) => selectedColumns[col]);
    setSelectedColumns(
      COLUMN_OPTIONS.reduce(
        (acc, col) => ({
          ...acc,
          [col]: !allChecked,
        }),
        {} as Record<string, boolean>
      )
    );
  };

  const toggleImage = (label: string) => {
    setImageSelections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleReload = () => {
    setNote(`Daten für ${country} werden vorbereitet...`);
    setTimeout(() => setNote(null), 2500);
  };

  const selectedColumnCount = useMemo(
    () => Object.values(selectedColumns).filter(Boolean).length,
    [selectedColumns]
  );

  return (
    <div className="neudorff-tab">
      <div className="neudorff-panel">
        <div className="neudorff-panel__header">
          <div>
            <p className="neudorff-panel__eyebrow">Exportquelle</p>
            <h5>Land auswählen</h5>
          </div>
          <div className="neudorff-country-select">
            <label htmlFor="neudorff-country">Land</label>
            <select
              id="neudorff-country"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
            >
              {COUNTRY_OPTIONS.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleReload}>
              Neu laden
            </button>
          </div>
        </div>
        {note && <p className="neudorff-note">{note}</p>}
      </div>

      <div className="neudorff-grid">
        <div className="neudorff-panel neudorff-panel--columns">
          <div className="neudorff-panel__header">
            <div>
              <p className="neudorff-panel__eyebrow">Exportfelder</p>
              <h5>Spalten auswählen</h5>
            </div>
            <span className="neudorff-pill">{selectedColumnCount} aktiv</span>
          </div>
          <div className="neudorff-columns">
            {COLUMN_OPTIONS.map((column) => (
              <label key={column} className="neudorff-checkbox">
                <input
                  type="checkbox"
                  checked={!!selectedColumns[column]}
                  disabled={
                    (column === "Sicherheitsblatt 2" || column === "Sicherheitsblatt 3") && !safetyChecked
                  }
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

        <div className="neudorff-panel neudorff-panel--images">
          <div className="neudorff-panel__header">
            <div>
              <p className="neudorff-panel__eyebrow">Bilder</p>
              <h5>ZIP Download vorbereiten</h5>
            </div>
            <button type="button">Als ZIP herunterladen</button>
          </div>

          <div className="neudorff-images">
            {IMAGE_LABELS.map((label) => (
              <label key={label} className="neudorff-checkbox">
                <input
                  type="checkbox"
                  checked={!!imageSelections[label]}
                  onChange={() => toggleImage(label)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="neudorff-panel">
        <div className="neudorff-panel__header">
          <div>
            <p className="neudorff-panel__eyebrow">Filter</p>
            <h5>EAN oder Artikelnummer</h5>
          </div>
        </div>
        <div className="neudorff-filter-row">
          <label htmlFor="neudorff-filter">EAN(s) oder ArtNr(n)</label>
          <input
            id="neudorff-filter"
            type="text"
            placeholder="400524000001 400524000002 ..."
            value={filterValue}
            onChange={(event) => setFilterValue(event.target.value)}
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
            <h5>Vorschau (Mockdaten)</h5>
          </div>
          <span className="neudorff-pill">{MOCK_ROWS.length} Produkte</span>
        </div>
        <div className="neudorff-table-wrapper">
          <table className="neudorff-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>EAN</th>
                <th>Titel</th>
                <th>UVP</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ROWS.map((row) => (
                <tr key={row.sku}>
                  <td>{row.sku}</td>
                  <td>{row.ean}</td>
                  <td>{row.title}</td>
                  <td>{row.uvp}</td>
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
