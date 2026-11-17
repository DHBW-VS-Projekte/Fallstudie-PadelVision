"use client";
/**
 * DetailsStep.tsx – Schritt 5: Name, E-Mail, Extras, Einwilligung
 * Prüfung im Browser für schnelles Feedback – verbindlich prüft PHP.
 * Fehlermeldungen stehen direkt am Feld (aria-describedby + aria-invalid).
 */
import { useState, type FormEvent } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import type { Details } from "@/components/booking/wizardState";
import { catalog } from "@/lib/booking/catalog";
import { formatEuro, looksLikeEmail, validName } from "@/lib/booking/format";
import { SHOW_PRICES } from "@/lib/booking/pricing-display";

export interface DetailsStepProps {
  initial: Details;
  serverError: { field: string; message: string } | null;
  onSubmit: (details: Details) => void;
}

type Field = "fullName" | "email" | "consent";
type Errors = Partial<Record<Field, string>>;

function validate(d: Details): Errors {
  const errors: Errors = {};
  if (!validName(d.fullName)) errors.fullName = "Bitte gib deinen vollständigen Namen ein (2–80 Zeichen; Buchstaben, Leerzeichen, Punkt, Bindestrich, Apostroph).";
  if (!looksLikeEmail(d.email)) errors.email = "Bitte gib eine gültige E-Mail-Adresse ein.";
  if (!d.consent) errors.consent = "Bitte bestätige die Einwilligung, damit wir die Demo-Buchung speichern dürfen.";
  return errors;
}

interface StepperProps {
  label: string;
  value: number;
  max: number;
  priceCents: number;
  onChange: (v: number) => void;
}

function Stepper({ label, value, max, priceCents, onChange }: StepperProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-card p-4">
      <div>
        <p className="font-medium">{label}</p>
        {SHOW_PRICES && <p className="text-sm text-muted">{formatEuro(priceCents)} je Stück · Bezahlung vor Ort</p>}
      </div>
      <div className="flex items-center gap-3" role="group" aria-label={label}>
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0} aria-label={`${label}: eins weniger`} className="grid size-11 place-items-center rounded-full border border-line hover:border-accent disabled:opacity-40">
          <Minus aria-hidden="true" className="size-4" />
        </button>
        <output aria-live="polite" className="w-6 text-center text-lg font-semibold tabular-nums">{value}</output>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value === max} aria-label={`${label}: eins mehr`} className="grid size-11 place-items-center rounded-full border border-line hover:border-accent disabled:opacity-40">
          <Plus aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}

export default function DetailsStep({ initial, serverError, onSubmit }: DetailsStepProps) {
  // useState: Formularwerte (Startwert aus dem gespeicherten Zustand)
  const [d, setD] = useState<Details>(initial);
  // useState: Erst nach dem ersten Absenden zeigen wir Fehler beim Tippen
  const [submitted, setSubmitted] = useState(false);
  const errors: Errors = submitted ? validate(d) : {};
  if (serverError && (serverError.field === "fullName" || serverError.field === "email") && !errors[serverError.field]) {
    errors[serverError.field] = serverError.message;
  }
  const p = catalog.pricing;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    const found = validate(d);
    const first = (Object.keys(found) as Field[])[0];
    if (first) {
      document.getElementById(`field-${first}`)?.focus();
      return;
    }
    onSubmit({ ...d, fullName: d.fullName.trim().replace(/\s+/g, " "), email: d.email.trim() });
  }

  const inputClass = (invalid: boolean) =>
    `mt-2 block min-h-12 w-full rounded-2xl border bg-card px-4 text-base transition-colors focus:border-accent ${invalid ? "border-accent" : "border-line"}`;

  return (
    <form noValidate onSubmit={submit} className="space-y-6">
      <div>
        <label htmlFor="field-fullName" className="font-medium">Vollständiger Name</label>
        <input
          id="field-fullName" name="name" autoComplete="name" value={d.fullName} maxLength={80}
          onChange={(e) => setD({ ...d, fullName: e.target.value })}
          aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "err-fullName" : undefined}
          className={inputClass(Boolean(errors.fullName))}
        />
        {errors.fullName && <p id="err-fullName" className="mt-2 text-sm text-accent">{errors.fullName}</p>}
      </div>

      <div>
        <label htmlFor="field-email" className="font-medium">E-Mail</label>
        <input
          id="field-email" name="email" type="email" inputMode="email" autoComplete="email" value={d.email} maxLength={190}
          onChange={(e) => setD({ ...d, email: e.target.value })}
          aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "err-email" : "hint-email"}
          className={inputClass(Boolean(errors.email))}
        />
        {errors.email ? (
          <p id="err-email" className="mt-2 text-sm text-accent">{errors.email}</p>
        ) : (
          <p id="hint-email" className="mt-2 text-sm text-muted">Mit Buchungsnummer und E-Mail kannst du später stornieren. Wir verschicken keine E-Mails.</p>
        )}
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-1 font-medium">Extras <span className="font-normal text-muted">(nur Vormerkung)</span></legend>
        <Stepper label="Schläger leihen" value={d.rackets} max={p.maxRackets} priceCents={p.racketCents} onChange={(v) => setD({ ...d, rackets: v })} />
        <Stepper label="Dose Bälle" value={d.balls} max={p.maxBalls} priceCents={p.ballsCents} onChange={(v) => setD({ ...d, balls: v })} />
      </fieldset>

      <div>
        <label className="flex cursor-pointer gap-3 rounded-2xl border border-line bg-card p-4">
          <input
            id="field-consent" type="checkbox" checked={d.consent}
            onChange={(e) => setD({ ...d, consent: e.target.checked })}
            aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "err-consent" : undefined}
            className="mt-1 size-5 shrink-0 accent-[var(--accent)]"
          />
          <span className="text-sm leading-relaxed">
            Ich bin einverstanden, dass mein Name und meine E-Mail zur Verwaltung dieser Demo-Buchung gespeichert werden. Die Seite ist ein Uni-Projekt und wird nach der Präsentation offline genommen.
          </span>
        </label>
        {errors.consent && <p id="err-consent" className="mt-2 text-sm text-accent">{errors.consent}</p>}
      </div>

      <div className="flex justify-end">
        <button type="submit" className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-7 font-semibold text-on-accent shadow-lift transition-transform hover:-translate-y-0.5">
          Weiter zur Übersicht <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
}