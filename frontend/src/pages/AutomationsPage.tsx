import { useMemo, useState } from "react";
import "../styles/AutomationsPage.css";

type AutomationStatus = "success" | "warning" | "failed" | "running";

type AutomationHistoryEntry = {
  id: string;
  status: AutomationStatus;
  startedAt: string;
  duration: string;
  note: string;
  trigger: string;
  isToday: boolean;
};

type AutomationJob = {
  id: string;
  name: string;
  category: string;
  description: string;
  status: AutomationStatus;
  statusDetail: string;
  lastRun: string;
  lastRunResult: string;
  nextRun: string;
  reruns: number;
  schedule: string;
  owner: string;
  history: AutomationHistoryEntry[];
};

const STATUS_LABELS: Record<AutomationStatus, string> = {
  success: "Erfolgreich",
  warning: "Warnung",
  failed: "Fehlgeschlagen",
  running: "Laufend",
};

const AUTOMATION_JOBS: AutomationJob[] = [
  {
    id: "shopify-sync",
    name: "Shopify Produkt Sync",
    category: "Commerce",
    description: "Schreibt freigegebene Produkte inklusive Preise, Bilder und Texte nach Shopify.",
    status: "success",
    statusDetail: "Letzter Lauf ohne Abweichungen.",
    lastRun: "Heute · 07:15 Uhr",
    lastRunResult: "243 Produkte aktualisiert",
    nextRun: "07:45 Uhr",
    reruns: 0,
    schedule: "Alle 30 Minuten · HH:15 / HH:45",
    owner: "Produktmanagement",
    history: [
      {
        id: "shopify-0715",
        status: "success",
        startedAt: "11.12. · 07:15",
        duration: "02:12 min",
        note: "243 Produkte in Shopify aktualisiert",
        trigger: "Planmäßig",
        isToday: true,
      },
      {
        id: "shopify-0645",
        status: "success",
        startedAt: "11.12. · 06:45",
        duration: "02:04 min",
        note: "241 Produkte synchronisiert",
        trigger: "Planmäßig",
        isToday: true,
      },
      {
        id: "shopify-2145",
        status: "success",
        startedAt: "10.12. · 21:45",
        duration: "02:18 min",
        note: "238 Produkte aktualisiert",
        trigger: "Planmäßig",
        isToday: false,
      },
    ],
  },
  {
    id: "obi-export",
    name: "OBI FTP Export",
    category: "Marktplätze",
    description: "Erstellt CSV-Dateien für OBI und lädt sie automatisiert via SFTP hoch.",
    status: "warning",
    statusDetail: "12 Produkte ohne Preis – automatischer Retry um 05:55 Uhr.",
    lastRun: "Heute · 05:43 Uhr",
    lastRunResult: "Warnung: 12 Produkte übersprungen",
    nextRun: "Retry · 05:55 Uhr",
    reruns: 1,
    schedule: "Täglich · 05:40 Uhr",
    owner: "Data Operations",
    history: [
      {
        id: "obi-0543",
        status: "warning",
        startedAt: "11.12. · 05:43",
        duration: "03:01 min",
        note: "12 Produkte ohne Preisangabe · Lauf abgeschlossen mit Warnung",
        trigger: "Planmäßig",
        isToday: true,
      },
      {
        id: "obi-0500",
        status: "success",
        startedAt: "10.12. · 05:41",
        duration: "02:56 min",
        note: "CSV exportiert und übertragen",
        trigger: "Planmäßig",
        isToday: false,
      },
      {
        id: "obi-0500-prev",
        status: "success",
        startedAt: "09.12. · 05:41",
        duration: "02:51 min",
        note: "CSV exportiert",
        trigger: "Planmäßig",
        isToday: false,
      },
    ],
  },
  {
    id: "bauhaus-feed",
    name: "Bauhaus Delta Feed",
    category: "Marktplätze",
    description: "Berechnet Delta-Dateien und lädt sie in das Bauhaus-Portal.",
    status: "failed",
    statusDetail: "Abgebrochen nach 68 % · Endpoint antwortet nicht.",
    lastRun: "Gestern · 23:10 Uhr",
    lastRunResult: "Abgebrochen: Timeout nach 90s",
    nextRun: "Wartet auf Freigabe",
    reruns: 2,
    schedule: "Stündlich · pausiert",
    owner: "Tech Ops",
    history: [
      {
        id: "bauhaus-2310",
        status: "failed",
        startedAt: "10.12. · 23:10",
        duration: "01:32 min",
        note: "Abgebrochen · Timeout am Bauhaus-Endpoint",
        trigger: "Auto-Retry",
        isToday: false,
      },
      {
        id: "bauhaus-2240",
        status: "failed",
        startedAt: "10.12. · 22:40",
        duration: "01:28 min",
        note: "Abgebrochen nach 68 % Fortschritt",
        trigger: "Planmäßig",
        isToday: false,
      },
      {
        id: "bauhaus-2140",
        status: "success",
        startedAt: "10.12. · 21:40",
        duration: "01:36 min",
        note: "379 Datensätze übertragen",
        trigger: "Planmäßig",
        isToday: false,
      },
    ],
  },
  {
    id: "webhook-cleanup",
    name: "Shopify Webhook Clean-up",
    category: "Infrastruktur",
    description: "Bereinigt verwaiste Webhooks und archiviert alte Events.",
    status: "running",
    statusDetail: "Läuft seit 07:20 Uhr · ETA 01:12 min.",
    lastRun: "Seit 07:20 Uhr aktiv",
    lastRunResult: "Bereinigung läuft",
    nextRun: "—",
    reruns: 0,
    schedule: "Ad-hoc · manuell",
    owner: "SRE",
    history: [
      {
        id: "webhook-0720",
        status: "running",
        startedAt: "11.12. · 07:20",
        duration: "00:48 min",
        note: "Bereinigung aktiv",
        trigger: "Manuell",
        isToday: true,
      },
      {
        id: "webhook-0610",
        status: "success",
        startedAt: "11.12. · 06:10",
        duration: "01:05 min",
        note: "214 Webhooks gelöscht",
        trigger: "Planmäßig",
        isToday: true,
      },
      {
        id: "webhook-1915",
        status: "success",
        startedAt: "10.12. · 19:15",
        duration: "01:22 min",
        note: "197 Webhooks gelöscht",
        trigger: "Planmäßig",
        isToday: false,
      },
    ],
  },
];

export default function AutomationsPage() {
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>(() =>
    AUTOMATION_JOBS.reduce<Record<string, boolean>>((acc, job) => {
      acc[job.id] = job.status !== "success";
      return acc;
    }, {})
  );

  const stats = useMemo(
    () =>
      AUTOMATION_JOBS.reduce(
        (acc, job) => {
          acc.total += 1;
          acc.warning += job.status === "warning" ? 1 : 0;
          acc.failed += job.status === "failed" ? 1 : 0;
          acc.running += job.status === "running" ? 1 : 0;
          acc.todayRuns += job.history.filter((run) => run.isToday).length;
          return acc;
        },
        { total: 0, warning: 0, failed: 0, running: 0, todayRuns: 0 }
      ),
    []
  );

  const jobsNeedingAttention = stats.warning + stats.failed;

  const toggleJob = (jobId: string) => {
    setExpandedJobs((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  return (
    <div className="automations-page">
      <header className="automations-hero">
        <div>
          <p className="automations-hero__eyebrow">Automatisierungen</p>
          <h2>Jobs & Hintergrundprozesse</h2>
          <p>
            Alle Exporte, Imports und Aufräumjobs in einer Übersicht. Hier siehst du, wann ein Lauf
            gestartet wurde, ob er durchgelaufen ist und wo manuell eingegriffen werden muss.
          </p>
        </div>
        <div className="automations-hero__summary">
          <div>
            <span>Letzter grüner Lauf</span>
            <strong>Shopify Sync · 07:15 Uhr</strong>
          </div>
          <div>
            <span>Warnungen / Fehler</span>
            <strong>{jobsNeedingAttention} Jobs</strong>
          </div>
          <div>
            <span>Läufe heute</span>
            <strong>{stats.todayRuns}</strong>
          </div>
          <button
            type="button"
            className="automations-hero__cta"
            onClick={() => alert("Demo: Neue Automation anlegen")}
          >
            + Neue Automation
          </button>
        </div>
      </header>

      <section className="automations-kpis" aria-label="Status Kennzahlen">
        <article className="automation-kpi">
          <p className="automation-kpi__label">Aktive Jobs</p>
          <strong>{stats.total}</strong>
          <small>{stats.running} laufen aktuell</small>
        </article>
        <article className="automation-kpi">
          <p className="automation-kpi__label">Aufmerksamkeit</p>
          <strong>{jobsNeedingAttention}</strong>
          <small>{stats.failed} Fehler · {stats.warning} Warnungen</small>
        </article>
        <article className="automation-kpi">
          <p className="automation-kpi__label">Letzte 24h</p>
          <strong>{stats.todayRuns}</strong>
          <small>Läufe seit Mitternacht</small>
        </article>
      </section>

      <section className="automations-jobs" aria-label="Automationsliste">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">Status nach Job</p>
            <h2>Automatisierungen</h2>
          </div>
          <div className="status-legend">
            {(["success", "running", "warning", "failed"] as AutomationStatus[]).map((status) => (
              <span key={status} className={`status-pill ${status}`}>
                {STATUS_LABELS[status]}
              </span>
            ))}
          </div>
        </div>

        {AUTOMATION_JOBS.map((job) => {
          const isExpanded = Boolean(expandedJobs[job.id]);
          const detailsId = `automation-${job.id}-details`;

          return (
            <article key={job.id} className={`automation-job automation-job--${job.status}`}>
              <header className="automation-job__header">
                <div>
                  <p className="automation-job__category">{job.category}</p>
                  <div className="automation-job__title">
                    <h3>{job.name}</h3>
                    <span className={`status-pill ${job.status}`}>{STATUS_LABELS[job.status]}</span>
                  </div>
                  <p className="automation-job__description">{job.description}</p>
                </div>
                <div className="automation-job__meta">
                  <div>
                    <span>Zuletzt gelaufen</span>
                    <strong>{job.lastRun}</strong>
                  </div>
                  <div>
                    <span>Ergebnis</span>
                    <strong>{job.lastRunResult}</strong>
                  </div>
                  <div>
                    <span>Nächster Lauf</span>
                    <strong>{job.nextRun}</strong>
                  </div>
                </div>
              </header>

              <div className="automation-job__status-row">
                <p>{job.statusDetail}</p>
                <div className="automation-job__status-meta">
                  <span>Plan: {job.schedule}</span>
                  <span>Owner: {job.owner}</span>
                  {job.reruns > 0 && <span>{job.reruns}× erneut gestartet</span>}
                </div>
                <div className="automation-job__actions">
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => alert(`Demo: Protokoll für ${job.name}`)}
                  >
                    Protokoll öffnen
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`Demo: ${job.name} neu gestartet`)}
                  >
                    Neu starten
                  </button>
                </div>
              </div>

              <div
                className="automation-job__details"
                id={detailsId}
                hidden={!isExpanded}
                aria-hidden={!isExpanded}
              >
                <div className="automation-job__details-head">
                  <h4>Letzte Läufe</h4>
                  <p>Ergebnis, Dauer und Auslöser je Lauf.</p>
                </div>
                <div className="automation-history__scroller">
                  <table className="automation-history">
                    <thead>
                      <tr>
                        <th>Start</th>
                        <th>Dauer</th>
                        <th>Status</th>
                        <th>Notiz</th>
                        <th>Trigger</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.history.map((entry) => (
                        <tr key={entry.id}>
                          <td>
                            <span className={`status-dot status-dot--${entry.status}`} aria-hidden="true" />
                            {entry.startedAt}
                          </td>
                          <td>{entry.duration}</td>
                          <td>
                            <span className={`status-pill small ${entry.status}`}>
                              {STATUS_LABELS[entry.status]}
                            </span>
                          </td>
                          <td>{entry.note}</td>
                          <td>{entry.trigger}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                type="button"
                className="automation-job__toggle"
                aria-expanded={isExpanded}
                aria-controls={detailsId}
                onClick={() => toggleJob(job.id)}
              >
                {isExpanded ? "Details ausblenden" : "Details anzeigen"}
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}
