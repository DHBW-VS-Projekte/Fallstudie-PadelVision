/**
 * Ticket.tsx – Buchungsticket mit perforiertem Rand
 * Die Perforation entsteht per CSS-Maske (.ticket in booking.css): Halbkreise
 * werden aus den Seiten "ausgestanzt", dazu eine gestrichelte Trennlinie.
 * Keine Hooks → reine Darstellung. Beim Drucken bleibt nur das Ticket sichtbar.
 */
import TicketPattern from "@/components/booking/TicketPattern";
import { formatDateLong, formatEuro } from "@/lib/booking/format";
import { SHOW_PRICES } from "@/lib/booking/pricing-display";
import type { BookingResult } from "@/lib/booking/types";

export default function Ticket({ booking }: { booking: BookingResult }) {
  const extras = [booking.rackets > 0 ? `${booking.rackets} × Schläger` : "", booking.balls > 0 ? `${booking.balls} × Dose Bälle` : ""].filter(Boolean).join(", ");
  return (
    <article aria-label={`Ticket ${booking.code}`} className="print-area ticket mx-auto max-w-xl overflow-hidden rounded-3xl bg-card text-foreground shadow-lift">
      <div className="bg-accent px-7 py-6 text-on-accent">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] opacity-85">
          {booking.bookingType === "event" ? "PadelVision · Event-Ticket" : "PadelVision · Court-Ticket"}
        </p>
        <p className="mt-2 text-sm opacity-85">Buchungsnummer</p>
        <p className="font-mono text-4xl font-semibold tracking-wider sm:text-5xl">{booking.code}</p>
      </div>
      <div className="ticket-divider" aria-hidden="true" />
      <div className="grid gap-6 px-7 pb-7 pt-5 sm:grid-cols-[1fr_8rem]">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div className="col-span-2"><dt className="text-muted">Standort</dt><dd className="font-semibold">{booking.locationName}</dd></div>
          {booking.bookingType === "event" && booking.eventTitle ? (
            <div className="col-span-2"><dt className="text-muted">Event</dt><dd className="font-semibold">{booking.eventTitle}</dd></div>
          ) : (
            <div className="col-span-2"><dt className="text-muted">Court</dt><dd className="font-semibold">{booking.courtName}</dd></div>
          )}
          <div className="col-span-2"><dt className="text-muted">Datum</dt><dd className="font-semibold">{formatDateLong(booking.date)}</dd></div>
          <div><dt className="text-muted">Uhrzeit</dt><dd className="font-semibold">{booking.time}–{booking.endTime}</dd></div>
          <div><dt className="text-muted">Name</dt><dd className="font-semibold">{booking.fullName}</dd></div>
          <div className="col-span-2"><dt className="text-muted">Extras</dt><dd className="font-semibold">{extras || "keine"}</dd></div>
          {SHOW_PRICES && booking.bookingType !== "event" && (
            <div className="col-span-2"><dt className="text-muted">Preis</dt><dd className="font-semibold">{formatEuro(booking.price.totalCents)} · Bezahlung vor Ort</dd></div>
          )}
          <p className="col-span-2 text-xs text-muted">{booking.timezoneLabel}</p>
        </dl>
        <div className="mx-auto size-32 rounded-xl border border-line p-2 sm:mx-0">
          <TicketPattern code={booking.code} />
        </div>
      </div>
    </article>
  );
}