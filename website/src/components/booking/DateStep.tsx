"use client";
/**
 * DateStep.tsx – Schritt 3: Datum wählen
 * Horizontale Leiste mit 14 Tagen (Scroll-Snap) und Auslastungs-Balken.
 * Geschlossene oder ausgebuchte Tage sind deaktiviert und begründet.
 * Die Tage kommen fertig vom Server – in der Ortszeit des Standorts.
 */
import { useEffect, useState } from "react";
import { useLiveVersion } from "@/components/booking/usePolling";
import { api } from "@/lib/booking/api";
import type { DaysResponse } from "@/lib/booking/types";

export interface DateStepProps {
  courtId: string;
  selected: string | null;
  onSelect: (date: string) => void;
}

export default function DateStep({ courtId, selected, onSelect }: DateStepProps) {
  const { version } = useLiveVersion(5000);
  const [days, setDays] = useState<DaysResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      api
        .days(courtId, controller.signal)
        .then((d) => {
          setDays(d);
          setFailed(false);
        })
        .catch(() => {
          if (!controller.signal.aborted) setFailed(true);
        });
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [courtId, version]);

  const current = days?.courtId === courtId ? days : null;
  if (!current) {
    return <p className="text-muted">{failed ? "Die Tage konnten nicht geladen werden – wir versuchen es automatisch erneut." : "Lade die nächsten 14 Tage …"}</p>;
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted">{current.timezoneLabel}</p>
      <ul className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 sm:mx-0 sm:flex-wrap sm:px-0">
        {current.days.map((d) => {
          const active = selected === d.date;
          const ratio = d.total > 0 ? d.free / d.total : 0;
          const reasonId = `day-reason-${d.date}`;
          return (
            <li key={d.date} className="w-24 shrink-0 snap-start">
              <button
                type="button"
                disabled={!d.bookable}
                aria-pressed={active}
                aria-describedby={d.reason ? reasonId : undefined}
                onClick={() => onSelect(d.date)}
                className={`flex w-full flex-col items-center rounded-3xl border px-3 py-4 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  active ? "border-accent bg-accent text-on-accent" : "border-line bg-card hover:border-accent"
                }`}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.15em]">{d.weekday}</span>
                <span className="mt-1 text-3xl font-semibold leading-none tracking-tight">{d.day}</span>
                <span className="mt-1 text-xs">{d.month}</span>
                {/* Auslastungs-Indikator: Anteil freier Startzeiten (scaleX statt Breite → keine Layout-Neuberechnung) */}
                <span aria-hidden="true" className={`mt-3 block h-1.5 w-full overflow-hidden rounded-full ${active ? "bg-on-accent/25" : "bg-surface"}`}>
                  <span className={`block h-full origin-left rounded-full ${active ? "bg-on-accent" : "bg-accent-2"}`} style={{ transform: `scaleX(${ratio})` }} />
                </span>
                <span className="mt-2 text-[11px] leading-tight">{d.bookable ? `${d.free} frei` : "—"}</span>
              </button>
              {d.reason && (
                <span id={reasonId} className="mt-1 block text-center text-[11px] leading-tight text-muted">{d.reason}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}