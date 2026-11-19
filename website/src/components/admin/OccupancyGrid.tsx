/**
 * OccupancyGrid.tsx – Belegungsplan: Courts als Spalten, Uhrzeiten als Zeilen
 * Gebuchte Blöcke in Petrol mit Namen (in der ersten Zelle), Holds schraffiert.
 * Keine Hooks → reine Darstellung; Standort/Tag wählt AdminDashboard.
 */
import type { OccupancyResponse } from "@/lib/booking/types";
import type { AdminBooking, OccupancyEvent } from "@/lib/booking/types";
import { formatDateLong } from "@/lib/booking/format";

function minuteOfDay(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export default function OccupancyGrid({
  data,
  bookings = [],
}: {
  data: OccupancyResponse | null;
  bookings?: AdminBooking[];
}) {
  if (!data) return <p className="text-muted">Lade Belegungsplan …</p>;
  const eventGroups = new Map<string, { event: OccupancyEvent; location: string; date: string; start: number; end: number }>();
  for (const booking of bookings) {
    if (booking.bookingType !== "event" || booking.status !== "confirmed" || !booking.eventTitle) continue;
    const key = JSON.stringify([booking.locationSlug, booking.date, booking.eventTitle, booking.time, booking.endTime]);
    const group = eventGroups.get(key);
    if (group) {
      group.event.registrations++;
      continue;
    }
    const start = minuteOfDay(booking.time);
    let end = minuteOfDay(booking.endTime);
    if (end <= start) end += 24 * 60;
    eventGroups.set(key, {
      event: { id: key, title: booking.eventTitle, registrations: 1, startsHere: false },
      location: booking.locationSlug,
      date: booking.date,
      start,
      end,
    });
  }
  const fallbackEvents = [...eventGroups.values()].filter((group) => group.location === data.location && group.date === data.date);
  const hasEvents = data.rows.some((row) => (row.events?.length ?? 0) > 0) || fallbackEvents.length > 0;
  if (!data.open && !hasEvents) return <p className="rounded-2xl bg-surface p-5 text-muted">{data.reason ?? "An diesem Tag geschlossen."}</p>;
  return (
    <div>
      {!data.open && <p className="mb-3 rounded-2xl bg-surface p-4 text-muted">{data.reason ?? "An diesem Tag geschlossen."}</p>}
      <p className="mb-3 text-sm text-muted">{formatDateLong(data.date)} · {data.timezoneLabel}</p>
      <p className="mb-3 text-xs text-muted">Events erscheinen am Veranstaltungstag.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th scope="col" className="w-16 text-left font-medium text-muted"><span className="sr-only">Uhrzeit</span></th>
              {data.courts.map((c) => (
                <th key={c.id} scope="col" className="px-2 py-1 text-left font-semibold">{c.name}</th>
              ))}
              <th scope="col" className="px-2 py-1 text-left font-semibold">Events</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => {
              const rowStart = minuteOfDay(row.time);
              const events = row.events?.length
                ? row.events
                : fallbackEvents
                  .filter((group) => group.start < rowStart + 30 && group.end > rowStart)
                  .map((group) => ({
                    ...group.event,
                    startsHere: group.start >= rowStart && group.start < rowStart + 30,
                  }));
              return (
                <tr key={row.time}>
                  <th scope="row" className="pr-2 text-left font-normal tabular-nums text-muted">{row.time}</th>
                  {row.cells.map((cell, i) => (
                    <td
                      key={data.courts[i]?.id ?? i}
                      className={`h-8 rounded-lg px-2 ${
                        cell === null ? "bg-surface" : cell.type === "hold" ? "slot-hatched" : "bg-accent-2 text-background"
                      }`}
                    >
                      {cell?.type === "booked" && cell.startsHere && <span className="block truncate text-xs font-semibold">{cell.name}</span>}
                      {cell?.type === "hold" && <span className="sr-only">gerade reserviert</span>}
                      {cell?.type === "booked" && !cell.startsHere && <span className="sr-only">belegt ({cell.name})</span>}
                    </td>
                  ))}
                  <td className="min-w-48 rounded-lg bg-surface px-2 py-1 align-top">
                    {events.map((event) => (
                      <p key={`${event.id}-${event.startsHere ? "start" : "continuation"}`} className="text-xs">
                        <span className="font-semibold">{event.title}</span>
                        {event.startsHere ? ` · ${event.registrations} ${event.registrations === 1 ? "Anmeldung" : "Anmeldungen"}` : " · läuft"}
                      </p>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}