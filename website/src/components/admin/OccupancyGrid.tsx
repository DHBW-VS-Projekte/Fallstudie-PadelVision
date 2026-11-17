/**
 * OccupancyGrid.tsx – Belegungsplan: Courts als Spalten, Uhrzeiten als Zeilen
 * Gebuchte Blöcke in Petrol mit Namen (in der ersten Zelle), Holds schraffiert.
 * Keine Hooks → reine Darstellung; Standort/Tag wählt AdminDashboard.
 */
import type { OccupancyResponse } from "@/lib/booking/types";

export default function OccupancyGrid({ data }: { data: OccupancyResponse | null }) {
  if (!data) return <p className="text-muted">Lade Belegungsplan …</p>;
  if (!data.open) return <p className="rounded-2xl bg-surface p-5 text-muted">{data.reason ?? "An diesem Tag geschlossen."}</p>;
  return (
    <div>
      <p className="mb-3 text-sm text-muted">{data.timezoneLabel}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th scope="col" className="w-16 text-left font-medium text-muted"><span className="sr-only">Uhrzeit</span></th>
              {data.courts.map((c) => (
                <th key={c.id} scope="col" className="px-2 py-1 text-left font-semibold">{c.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}