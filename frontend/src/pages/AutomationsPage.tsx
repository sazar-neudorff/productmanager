import { useMemo } from "react";
import "../styles/AutomationsPage.css";

type AutomationStatus = "ok" | "attention" | "paused";

type AutomationJob = {
  id: string;
  name: string;
  summary: string;
  status: AutomationStatus;
  lastRun: string;
  nextRun: string;
  cadence: string;
  owner: string;
  runsToday: number;
};

const STATUS_LABELS: Record<AutomationStatus, string> = {
  ok: "Stabil",
  attention: "Bitte prüfen",
  paused: "Pausiert",
};

const AUTOMATION_JOBS: AutomationJob[] = [
  {
    id: "shopify-sync",
    name: "Shopify Sync",
    summary: "Schreibt freigegebene Produkte inklusive Bestand in den Shop.",
    status: "ok",
    lastRun: "Heute · 07:15 Uhr",
    nextRun: "07:45 Uhr",
    cadence: "Alle 30 Minuten",
    owner: "Produktmanagement",
    runsToday: 5,
  },
  {
    id: "obi-export",
    name: "OBI Export",
    summary: "Erstellt die CSV für den Marktplatz-Upload.",
    status: "attention",
    lastRun: "Heute · 05:40 Uhr",
    nextRun: "Morgen · 05:40 Uhr",
    cadence: "Täglich",
    owner: "Data Ops",
    runsToday: 1,
  },
  {
    id: "bauhaus-feed",
    name: "Bauhaus Feed",
    summary: "Sendet Delta-Dateien an das Partner-Portal.",
    status: "paused",
    lastRun: "Gestern · 23:10 Uhr",
    nextRun: "Wartet auf Freigabe",
    cadence: "Manuell",
    owner: "Tech Ops",
    runsToday: 0,
  },
];

export default function AutomationsPage() {
  const stats = useMemo(
    () =>
      AUTOMATION_JOBS.reduce(
        (acc, job) => {
          acc.total += 1;
          acc.runsToday += job.runsToday;
          acc.needsAttention += job.status === "attention" ? 1 : 0;
          acc.paused += job.status === "paused" ? 1 : 0;
          return acc;
        },
        { total: 0, runsToday: 0, needsAttention: 0, paused: 0 }
      ),
    []
  );

  return (
    <div className="automations-page">
      <header className="automations-hero">
        <div>
          <p className="automations-hero__eyebrow">Automatisierungen</p>
          <h2>Status Übersicht</h2>
          <p>
            Kurzer Überblick über die wichtigsten Jobs. Keine Buttons, keine Tabellen – nur die Infos,
            die man für eine schnelle Einschätzung braucht.
          </p>
        </div>
        <div className="automations-hero__stats" aria-label="Kennzahlen">
          <article>
            <p>Aktive Jobs</p>
            <strong>{stats.total}</strong>
            <small>{stats.needsAttention} brauchen Aufmerksamkeit</small>
          </article>
          <article>
            <p>Läufe heute</p>
            <strong>{stats.runsToday}</strong>
            <small>Summe aller Jobs</small>
          </article>
          <article>
            <p>Pausiert</p>
            <strong>{stats.paused}</strong>
            <small>Wartet auf Freigabe</small>
          </article>
        </div>
      </header>

      <section className="automation-list" aria-label="Jobliste">
        {AUTOMATION_JOBS.map((job) => (
          <article key={job.id} className="automation-card">
            <div className="automation-card__head">
              <span className={`status-pill ${job.status}`}>{STATUS_LABELS[job.status]}</span>
              <div>
                <h3>{job.name}</h3>
                <p>{job.summary}</p>
              </div>
            </div>
            <dl className="automation-card__meta">
              <div>
                <dt>Zuletzt gelaufen</dt>
                <dd>{job.lastRun}</dd>
              </div>
              <div>
                <dt>Nächster Lauf</dt>
                <dd>{job.nextRun}</dd>
              </div>
              <div>
                <dt>Rhythmus</dt>
                <dd>{job.cadence}</dd>
              </div>
              <div>
                <dt>Owner</dt>
                <dd>{job.owner}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </div>
  );
}
