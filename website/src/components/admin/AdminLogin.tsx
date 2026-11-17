"use client";
/**
 * AdminLogin.tsx – Passwort-Anmeldung für /verwaltung
 * Das Passwort wird nur an /api/admin/login.php geschickt und dort mit
 * password_verify() gegen den Hash aus config.php geprüft. Nach 5 Fehlversuchen
 * pro Gerät sperrt der Server 1 Minute lang.
 */
import { useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { api, asApiError } from "@/lib/booking/api";
import { errorMessage } from "@/lib/booking/errors";

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.admin.login(password);
      onSuccess();
    } catch (e) {
      const err = asApiError(e);
      setError(errorMessage(err.code, err.message));
      setPassword("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md rounded-3xl border border-line bg-card p-8 shadow-lift">
      <span className="grid size-12 place-items-center rounded-2xl bg-accent/12 text-accent"><Lock aria-hidden="true" className="size-6" /></span>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight">Anmelden</h2>
      <p className="mt-2 text-muted">Nur für das PadelVision-Team.</p>
      <label htmlFor="admin-password" className="mt-6 block font-medium">Passwort</label>
      <input
        id="admin-password" type="password" autoComplete="current-password" required value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-invalid={Boolean(error)} aria-describedby={error ? "admin-error" : undefined}
        className="mt-2 block min-h-12 w-full rounded-2xl border border-line bg-background px-4 text-base focus:border-accent"
      />
      {error && <p id="admin-error" role="alert" className="mt-3 text-sm font-medium text-accent">{error}</p>}
      <button type="submit" disabled={busy || password === ""} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent font-semibold text-on-accent disabled:opacity-50">
        {busy ? "Prüfe …" : "Anmelden"}
      </button>
    </form>
  );
}