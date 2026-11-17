"use client";
/**
 * CancelForm.tsx – Buchung stornieren mit Buchungsnummer + E-Mail
 * Die Fehlermeldung ist bewusst neutral ("Wir konnten keine passende Buchung
 * finden."), damit niemand ausprobieren kann, welche Nummern existieren.
 * Nach dem Stornieren ist der Slot beim nächsten Polling bei allen wieder frei.
 */
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { api, asApiError } from "@/lib/booking/api";
import { errorMessage } from "@/lib/booking/errors";
import { formatDateLong } from "@/lib/booking/format";
import type { BookingResult } from "@/lib/booking/types";

export default function CancelForm() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<BookingResult | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      setDone(await api.cancel(code.trim().toUpperCase(), email.trim()));
    } catch (e) {
      const err = asApiError(e);
      setError(err.code === "NOT_FOUND" || err.code === "VALIDATION" ? "Wir konnten keine passende Buchung finden." : errorMessage(err.code, err.message));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div role="status" className="rounded-3xl border border-line bg-card p-8 shadow-soft">
        <Check aria-hidden="true" className="size-10 text-accent-2" />
        <p className="mt-4 text-2xl font-semibold tracking-tight">Storniert.</p>
        <p className="mt-2 text-muted">
          Deine Buchung {done.code} ({done.city}, {done.courtName}, {formatDateLong(done.date)}, {done.time} Uhr) ist storniert. Der Slot ist wieder frei.
        </p>
        <Link href="/buchung" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-accent px-6 font-semibold text-on-accent">
          Neuen Court buchen
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-3xl border border-line bg-card p-6 shadow-soft sm:p-8">
      <div>
        <label htmlFor="cancel-code" className="font-medium">Buchungsnummer</label>
        <input
          id="cancel-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="PV-XXXXXX" required autoComplete="off"
          aria-invalid={Boolean(error)} aria-describedby={error ? "cancel-error" : undefined}
          className="mt-2 block min-h-12 w-full rounded-2xl border border-line bg-background px-4 font-mono text-base uppercase tracking-wider focus:border-accent"
        />
      </div>
      <div>
        <label htmlFor="cancel-email" className="font-medium">E-Mail</label>
        <input
          id="cancel-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          aria-invalid={Boolean(error)} aria-describedby={error ? "cancel-error" : undefined}
          className="mt-2 block min-h-12 w-full rounded-2xl border border-line bg-background px-4 text-base focus:border-accent"
        />
      </div>
      {error && <p id="cancel-error" role="alert" className="rounded-2xl bg-accent/10 p-4 font-medium text-accent">{error}</p>}
      <button type="submit" disabled={busy} className="inline-flex min-h-12 items-center rounded-full bg-accent px-6 font-semibold text-on-accent disabled:opacity-60">
        {busy ? "Wird geprüft …" : "Buchung stornieren"}
      </button>
    </form>
  );
}