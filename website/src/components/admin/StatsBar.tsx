/**
 * StatsBar.tsx – Kennzahlen für den Beamer
 * Buchungen heute, gesamt, belegte Stunden, aktive Holds und Auslastung pro
 * Standort am gewählten Tag. Keine Hooks → reine Darstellung.
 */
import type { AdminStats } from "@/lib/booking/types";

export default function StatsBar({ stats }: { stats: AdminStats | null }) {
  const cards = [
    { label: "Heute gebucht", value: stats?.createdToday },
    { label: "Buchungen gesamt", value: stats?.confirmedTotal },
    { label: "Belegte Stunden", value: stats ? stats.bookedHours.toLocaleString("de-DE") : undefined },
    { label: "Gerade reserviert", value: stats?.activeHolds },
  ];
  return (
    <div>
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="flex flex-col-reverse rounded-3xl border border-line bg-card p-5 shadow-soft">
            <dt className="mt-1 text-sm font-medium uppercase tracking-[0.15em] text-muted">{c.label}</dt>
            <dd className="text-[clamp(2.25rem,4vw,3.5rem)] font-semibold leading-none tracking-tight text-accent tabular-nums">{c.value ?? "–"}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5" aria-label="Auslastung pro Standort am gewählten Tag">
        {(stats?.utilization ?? []).map((u) => (
          <li key={u.slug} className="rounded-2xl border border-line bg-card p-4">
            <p className="flex justify-between gap-2 text-sm font-medium">
              <span>{u.city}</span>
              <span className="tabular-nums">{u.open ? `${u.percent} %` : "zu"}</span>
            </p>
            <span aria-hidden="true" className="mt-2 block h-2 overflow-hidden rounded-full bg-surface">
              <span className="block h-full origin-left rounded-full bg-accent-2 transition-transform duration-700" style={{ transform: `scaleX(${u.percent / 100})` }} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}