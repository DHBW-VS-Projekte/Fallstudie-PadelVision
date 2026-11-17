"use client";
/**
 * BookingSummary.tsx – mitlaufende Zusammenfassung
 * Desktop: "sticky" Karte rechts. Mobil: einklappbare Leiste am unteren Rand.
 * Zeigt Standort, Court, Datum, Uhrzeit, Preis (Bezahlung vor Ort) und Countdown.
 */
import { useState } from "react";
import { ChevronUp, MapPin } from "lucide-react";
import HoldCountdown from "@/components/booking/HoldCountdown";
import { catalog, findCourt, findLocation } from "@/lib/booking/catalog";
import { formatDateMedium, formatEuro } from "@/lib/booking/format";
import { SHOW_PRICES } from "@/lib/booking/pricing-display";
import { holdValid, type WizardState } from "@/components/booking/wizardState";
import { findEventById } from "@/components/courts/courtsContent";

function rowsFor(state: WizardState): { label: string; value: string }[] {
  const location = findLocation(state.location);
  const court = findCourt(state.courtId)?.court;
  const rows: { label: string; value: string }[] = [];
  if (location) rows.push({ label: "Standort", value: `${location.flag} ${location.city}` });
  if (state.eventId) {
    const event = findEventById(state.eventId)?.event;
    if (event) rows.push({ label: "Event", value: event.title });
  }
  if (court && !state.eventId) rows.push({ label: "Court", value: court.name });
  if (state.date) rows.push({ label: "Datum", value: formatDateMedium(state.date) });
  if (state.hold) rows.push({ label: "Uhrzeit", value: `${state.hold.time}–${state.hold.endTime} Uhr` });
  return rows;
}

export default function BookingSummary({ state, now }: { state: WizardState; now: number }) {
  // useState: mobile Zusammenfassung auf-/zugeklappt
  const [open, setOpen] = useState(false);
  const rows = rowsFor(state);
  const hold = holdValid(state.hold, now) ? state.hold : null;
  const p = catalog.pricing;
  const extras = state.details.rackets * p.racketCents + state.details.balls * p.ballsCents;
  const price = hold ? hold.priceCents + (state.idempotencyKey ? extras : 0) : null;

  const body = (
    <>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">Wähle einen Standort, um zu starten.</p>
      ) : (
        <dl className="space-y-3 text-sm">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between gap-4">
              <dt className="text-muted">{r.label}</dt>
              <dd className="text-right font-medium">{r.value}</dd>
            </div>
          ))}
          {SHOW_PRICES && !state.eventId && price !== null && (
            <div className="flex justify-between gap-4 border-t border-line pt-3">
              <dt className="text-muted">Preis (vor Ort)</dt>
              <dd className="text-right text-base font-semibold">{formatEuro(price)}</dd>
            </div>
          )}
        </dl>
      )}
      {state.hold && !state.eventId && (
        <div className="mt-5">
          <HoldCountdown expiresAt={state.hold.localExpiresAt} now={now} />
        </div>
      )}
    </>
  );

  return (
    <>
      {/* ===== Desktop: sticky Karte ===== */}
      <aside aria-label="Zusammenfassung deiner Buchung" className="hidden lg:block">
        <div className="sticky top-24 rounded-3xl border border-line bg-card p-6 shadow-soft">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <MapPin aria-hidden="true" className="size-4" /> Deine Buchung
          </p>
          <div className="mt-5">{body}</div>
          <p className="mt-5 text-xs text-muted">Bezahlung vor Ort · Demo-Buchung</p>
        </div>
      </aside>

      {/* ===== Mobil: einklappbare Leiste unten (beim Drucken ausgeblendet) ===== */}
      {rows.length > 0 && (
        <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-background/90 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-summary"
            onClick={() => setOpen((o) => !o)}
            className="flex min-h-14 w-full items-center justify-between gap-3 px-5 text-left"
          >
            <span className="min-w-0 truncate text-sm font-medium">{rows.map((r) => r.value).join(" · ")}</span>
            <span className="flex shrink-0 items-center gap-2 text-sm">
              {hold && <HoldCountdown expiresAt={hold.localExpiresAt} now={now} compact />}
              <ChevronUp aria-hidden="true" className={`size-5 transition-transform ${open ? "rotate-180" : ""}`} />
              <span className="sr-only">{open ? "Zusammenfassung schließen" : "Zusammenfassung öffnen"}</span>
            </span>
          </button>
          <div id="mobile-summary" hidden={!open} className="max-h-[50svh] overflow-y-auto px-5 pb-6">
            {body}
          </div>
        </div>
      )}
    </>
  );
}