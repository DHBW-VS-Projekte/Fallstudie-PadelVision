"use client";
/**
 * BookingsTable.tsx – Tabelle aller Buchungen mit Suche, Filtern und Sortierung
 * Voller Name sichtbar, E-Mail kommt bereits GEKÜRZT aus PHP (m***@gmail.com).
 * Sortieren per Klick auf die Spaltenköpfe (aria-sort zeigt die Richtung an).
 */
import { useState } from "react";
import { Search, X } from "lucide-react";
import { catalog } from "@/lib/booking/catalog";
import { formatEuro } from "@/lib/booking/format";
import type { AdminBooking } from "@/lib/booking/types";

type SortKey = "code" | "fullName" | "city" | "date" | "priceCents" | "status" | "createdAt";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "code", label: "Nr." },
  { key: "fullName", label: "Name" },
  { key: "city", label: "Standort / Court" },
  { key: "date", label: "Termin (Ortszeit)" },
  { key: "priceCents", label: "Preis" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Gebucht am" },
];

function sortValue(b: AdminBooking, key: SortKey): string | number {
  if (key === "date") return `${b.date} ${b.time}`;
  return b[key];
}

export interface BookingsTableProps {
  bookings: AdminBooking[];
  presentation: boolean;
  onCancel: (booking: AdminBooking) => void;
}

export default function BookingsTable({ bookings, presentation, onCancel }: BookingsTableProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [bookingType, setBookingType] = useState<"" | "court" | "event">("");
  const [eventTitle, setEventTitle] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "createdAt", dir: -1 });

  const eventOptions = Array.from(new Set(bookings.filter((b) => b.bookingType === "event" && b.eventTitle).map((b) => b.eventTitle as string))).sort();
  const q = query.trim().toLowerCase();
  const rows = bookings
    .filter((b) => !q || `${b.code} ${b.fullName} ${b.emailMasked} ${b.courtName} ${b.eventTitle ?? ""} ${b.eventType ?? ""}`.toLowerCase().includes(q))
    .filter((b) => !location || b.locationSlug === location)
    .filter((b) => !date || b.date === date)
    .filter((b) => !status || b.status === status)
    .filter((b) => !bookingType || b.bookingType === bookingType)
    .filter((b) => !eventTitle || b.eventTitle === eventTitle)
    .sort((a, b) => {
      const va = sortValue(a, sort.key);
      const vb = sortValue(b, sort.key);
      return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir;
    });

  const toggleSort = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }));
  const filterClass = "min-h-11 rounded-2xl border border-line bg-background px-3 text-sm";

  return (
    <section id="event-buchungen" aria-labelledby="table-title" className="rounded-3xl border border-line bg-card p-6 shadow-soft">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="table-title" className="text-xl font-semibold tracking-tight">Alle Buchungen <span className="text-muted">({rows.length})</span></h2>
        {!presentation && (
          <div className="flex flex-wrap gap-2">
            <label className="relative">
              <span className="sr-only">Suche</span>
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, Nr., Court …" className={`${filterClass} w-52 pl-9`} />
            </label>
            <label>
              <span className="sr-only">Standort</span>
              <select value={location} onChange={(e) => setLocation(e.target.value)} className={filterClass}>
                <option value="">Alle Standorte</option>
                {catalog.locations.map((l) => <option key={l.slug} value={l.slug}>{l.city}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Datum</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={filterClass} />
            </label>
            <label>
              <span className="sr-only">Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={filterClass}>
                <option value="">Alle Status</option>
                <option value="confirmed">Bestätigt</option>
                <option value="cancelled">Storniert</option>
              </select>
            </label>
            <label>
              <span className="sr-only">Buchungsart</span>
              <select value={bookingType} onChange={(e) => setBookingType(e.target.value as "" | "court" | "event")} className={filterClass}>
                <option value="">Alle Buchungen</option>
                <option value="court">Nur Court-Buchungen</option>
                <option value="event">Nur Event-Buchungen</option>
              </select>
            </label>
            {eventOptions.length > 0 && (
              <label>
                <span className="sr-only">Event</span>
                <select value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className={filterClass}>
                  <option value="">Alle Events</option>
                  {eventOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-muted">
              {COLUMNS.map((c) => (
                <th key={c.key} scope="col" aria-sort={sort.key === c.key ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className="py-2 pr-3 font-medium">
                  <button type="button" onClick={() => toggleSort(c.key)} className="min-h-11 font-medium hover:text-foreground">
                    {c.label} {sort.key === c.key ? (sort.dir === 1 ? "▲" : "▼") : ""}
                  </button>
                </th>
              ))}
              <th scope="col" className="py-2 font-medium">E-Mail · Extras</th>
              {!presentation && <th scope="col" className="py-2"><span className="sr-only">Aktionen</span></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className={`border-b border-line/70 ${b.status === "cancelled" ? "text-muted line-through decoration-muted/50" : ""}`}>
                <td className="py-3 pr-3 font-mono">{b.code}</td>
                <td className="py-3 pr-3 font-semibold">{b.fullName}</td>
                <td className="py-3 pr-3">
                  {b.bookingType === "event" && b.eventTitle ? (
                    <>
                      <span className="font-medium text-accent">{b.eventTitle}</span><br />
                      <span className="text-muted">{b.city} · {b.courtName}</span>
                    </>
                  ) : (
                    <>
                      {b.city}<br /><span className="text-muted">{b.courtName}</span>
                    </>
                  )}
                </td>
                <td className="py-3 pr-3 tabular-nums">{b.dateShort} {b.time}–{b.endTime}</td>
                <td className="py-3 pr-3 tabular-nums">{formatEuro(b.priceCents)}</td>
                <td className="py-3 pr-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${b.status === "confirmed" ? "bg-accent-2/15 text-accent-2" : "bg-surface text-muted"}`}>
                    {b.status === "confirmed" ? "Bestätigt" : "Storniert"}
                  </span>
                </td>
                <td className="py-3 pr-3 tabular-nums">{b.createdLabel}</td>
                <td className="py-3 pr-3 text-muted">
                  {b.emailMasked}
                  <br />
                  {b.rackets > 0 || b.balls > 0 ? `${b.rackets} Schläger · ${b.balls} Bälle` : "keine Extras"}
                </td>
                {!presentation && (
                  <td className="py-3 text-right">
                    {b.status === "confirmed" && (
                      <button type="button" onClick={() => onCancel(b)} aria-label={`Buchung ${b.code} von ${b.fullName} stornieren`} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line px-3 text-xs font-semibold hover:border-accent hover:text-accent">
                        <X aria-hidden="true" className="size-3.5" /> Stornieren
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-6 text-center text-muted">Keine Buchungen gefunden.</p>}
      </div>
    </section>
  );
}