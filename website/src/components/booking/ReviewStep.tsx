"use client";
/**
 * ReviewStep.tsx – Schritt 6: alles prüfen und verbindlich buchen
 * Preisaufschlüsselung als Vorschau – den verbindlichen Preis berechnet PHP
 * beim Buchen (er steht danach auf dem Ticket). Während des Sendens ist der
 * Button deaktiviert; zusätzlich schützt der Idempotenz-Schlüssel vor
 * doppelten Buchungen.
 */
import { Check, Pencil } from "lucide-react";
import type { Details, HeldSlot } from "@/components/booking/wizardState";
import { catalog } from "@/lib/booking/catalog";
import { formatDateLong, formatEuro } from "@/lib/booking/format";
import { SHOW_PRICES, estimateParts } from "@/lib/booking/pricing-display";
import type { CatalogCourt, CatalogLocation } from "@/lib/booking/types";
import { eventTypeLabels } from "@/components/courts/courtsContent";

export interface ReviewStepProps {
  location: CatalogLocation;
  court: CatalogCourt;
  hold: HeldSlot;
  details: Details;
  submitting: boolean;
  error: string | null;
  onEdit: () => void;
  onBook: () => void;
  eventTitle?: string | null;
  eventType?: string | null;
}

export default function ReviewStep({ location, court, hold, details, submitting, error, onEdit, onBook, eventTitle, eventType }: ReviewStepProps) {
  const parts = estimateParts(court, hold.prime, details.rackets, details.balls, catalog.pricing);
  const priceRows: [string, number][] = [
    [`${court.kind === "indoor" ? "Indoor" : "Outdoor"}-Court · 90 Min.`, parts.baseCents],
    ["Panorama-Zuschlag", parts.panoramaCents],
    ["Prime-Time-Zuschlag", parts.primeCents],
    [`Schläger × ${details.rackets}`, parts.racketsCents],
    [`Bälle × ${details.balls}`, parts.ballsCents],
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-line bg-card p-6 shadow-soft">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div><dt className="text-sm text-muted">Standort</dt><dd className="font-semibold"><span aria-hidden="true">{location.flag}</span> {location.city} „{location.nickname}“</dd></div>
          {eventTitle && (
            <div><dt className="text-sm text-muted">Event</dt><dd className="font-semibold">{eventTitle}{eventType ? ` · ${eventTypeLabels[eventType as keyof typeof eventTypeLabels] ?? eventType}` : ""}</dd></div>
          )}
          {!eventTitle && <div><dt className="text-sm text-muted">Court</dt><dd className="font-semibold">{court.name}</dd></div>}
          <div><dt className="text-sm text-muted">Datum</dt><dd className="font-semibold">{formatDateLong(hold.date)}</dd></div>
          <div><dt className="text-sm text-muted">Uhrzeit (Ortszeit)</dt><dd className="font-semibold">{hold.time}–{hold.endTime} Uhr</dd></div>
          <div><dt className="text-sm text-muted">Name</dt><dd className="font-semibold">{details.fullName}</dd></div>
          <div><dt className="text-sm text-muted">E-Mail</dt><dd className="break-all font-semibold">{details.email}</dd></div>
        </dl>
        <button type="button" onClick={onEdit} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent">
          <Pencil aria-hidden="true" className="size-4" /> Daten ändern
        </button>
      </div>

      {SHOW_PRICES && !eventTitle && (
        <div className="rounded-3xl border border-line bg-card p-6 shadow-soft">
          <h3 className="font-semibold">Preis</h3>
          <dl className="mt-4 space-y-2 text-sm">
            {priceRows
              .filter(([, cents]) => cents > 0)
              .map(([label, cents]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-muted">{label}</dt>
                  <dd>{formatEuro(cents)}</dd>
                </div>
              ))}
            <div className="flex justify-between gap-4 border-t border-line pt-3 text-base font-semibold">
              <dt>Gesamt</dt>
              <dd>{formatEuro(parts.totalCents)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-muted">Bezahlung vor Ort. Es wird nichts online abgebucht.</p>
        </div>
      )}

      {error && <p role="alert" className="rounded-2xl bg-accent/10 p-4 font-medium text-accent">{error}</p>}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onBook}
          disabled={submitting}
          aria-busy={submitting}
          className="inline-flex min-h-14 items-center gap-2 rounded-full bg-accent px-8 text-lg font-semibold text-on-accent shadow-lift transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
        >
          <Check aria-hidden="true" className="size-5" />
          {submitting ? "Wird gebucht …" : "Jetzt verbindlich buchen"}
        </button>
      </div>
    </div>
  );
}