/**
 * LiveFeed.tsx – "Gerade gebucht": die neuesten Buchungen, neueste oben
 * Jede Zeile hat die Buchungs-ID als key – neue Einträge werden neu
 * eingefügt und laufen dabei einmal durch die CSS-Animation .feed-in.
 */
import type { AdminBooking } from "@/lib/booking/types";

export default function LiveFeed({ bookings }: { bookings: AdminBooking[] }) {
  const latest = bookings.filter((b) => b.status === "confirmed").slice(0, 8);
  return (
    <section aria-labelledby="feed-title" className="rounded-3xl border border-line bg-card p-6 shadow-soft">
      <h2 id="feed-title" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
        <span aria-hidden="true" className="live-dot size-2.5 rounded-full bg-accent" /> Gerade gebucht
      </h2>
      {latest.length === 0 ? (
        <p className="mt-4 text-muted">Noch keine Buchungen – sobald jemand bucht, erscheint es hier.</p>
      ) : (
        <ol className="mt-4 space-y-2" aria-live="polite">
          {latest.map((b) => (
            <li key={b.id} className="feed-in flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-2xl bg-surface px-4 py-3">
              <span className="text-lg font-semibold">{b.fullName}</span>
              <span className="text-muted">
                {b.city} · {b.courtName} · {b.dateShort} {b.time}
              </span>
              <span className="w-full text-xs text-muted tabular-nums">gebucht {b.createdLabel}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}