import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import "../styles/AuthPage.css";

type Mode = "login" | "register";

function friendlyError(message: string) {
  switch (message) {
    case "invalid_credentials":
      return "E-Mail oder Passwort ist falsch.";
    case "email_exists":
      return "Diese E-Mail ist bereits registriert.";
    case "registration_disabled":
      return "Registrierung ist aktuell deaktiviert.";
    case "password_policy":
      return "Passwort entspricht nicht der Richtlinie.";
    default:
      return "Das hat leider nicht geklappt. Bitte nochmal versuchen.";
  }
}

export default function AuthPage() {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const title = useMemo(() => (mode === "login" ? "Willkommen zurück" : "Konto anlegen"), [mode]);
  const subtitle = useMemo(
    () =>
      mode === "login"
        ? "Melde dich an, um die Neudorff Plattform zu öffnen."
        : "Erstelle ein Konto. Du bleibst eingeloggt, bis du dich abmeldest.",
    [mode]
  );

  const canSubmit = email.trim() && password.trim().length >= 6;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setIsBusy(true);
    setError(null);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? friendlyError(e.message) : friendlyError("unknown"));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-backdrop" aria-hidden="true" />

      <section className="auth-card" aria-label="Login">
        <header className="auth-card__header">
          <div className="auth-brand">
            <span className="auth-brand__badge">Neudorff</span>
            <span className="auth-brand__meta">Interne Plattform</span>
          </div>
          <h2>{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
        </header>

        <div className="auth-mode">
          <button
            type="button"
            className={`auth-mode__btn ${mode === "login" ? "is-active" : ""}`}
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            aria-pressed={mode === "login"}
            disabled={isBusy}
          >
            Anmelden
          </button>
          <button
            type="button"
            className={`auth-mode__btn ${mode === "register" ? "is-active" : ""}`}
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            aria-pressed={mode === "register"}
            disabled={isBusy}
          >
            Registrieren
          </button>
          <span className={`auth-mode__indicator ${mode === "register" ? "is-right" : ""}`} />
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <div className={`auth-form__grid ${mode === "register" ? "is-register" : ""}`}>
            <div className="auth-field auth-field--half">
              <label htmlFor="firstName">Vorname</label>
              <input
                id="firstName"
                className="input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                disabled={isBusy || mode !== "register"}
              />
            </div>
            <div className="auth-field auth-field--half">
              <label htmlFor="lastName">Nachname</label>
              <input
                id="lastName"
                className="input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                disabled={isBusy || mode !== "register"}
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="email">E-Mail</label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={isBusy}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Passwort</label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              disabled={isBusy}
              required
              minLength={6}
            />
            <p className="auth-hint">Mindestens 6 Zeichen.</p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={!canSubmit || isBusy}>
            {isBusy ? "Bitte warten…" : mode === "login" ? "Anmelden" : "Konto erstellen"}
          </button>
        </form>

        <footer className="auth-footnote">
          <p>
            Durch das Anmelden wird eine Session erstellt, damit nachvollziehbar ist, wer aktuell eingeloggt ist.
          </p>
        </footer>
      </section>
    </div>
  );
}

