"use client";
/**
 * EventFilter.tsx – Filter-Chips über dem Event-Zeitstrahl
 *
 * Client Component (kleine Insel). Die Event-Karten selbst werden auf dem
 * Server gerendert und als `children` hereingereicht. Gefiltert wird per CSS:
 * Der Wrapper bekommt data-filter="turnier" usw., und eine Regel in
 * globals.css blendet alle Karten mit anderem data-type aus. So muss React
 * die Liste beim Filtern nicht neu aufbauen.
 * Ohne JavaScript bleibt "Alle" aktiv – alle Events sind sichtbar.
 */
import { useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { eventTypeLabels, type EventType } from "@/components/courts/courtsContent";

export type EventFilterValue = EventType | "alle";

export interface EventFilterProps {
  /** Anzahl Events je Filter – auf dem Server berechnet */
  counts: Record<EventFilterValue, number>;
  children: ReactNode;
}

const FILTERS: EventFilterValue[] = ["alle", "turnier", "kurs", "community", "camp"];

export default function EventFilter({ counts, children }: EventFilterProps) {
  // useState: aktiver Filter. Bestimmt aria-pressed und data-filter.
  const [filter, setFilter] = useState<EventFilterValue>("alle");
  // useRef: Wrapper der Liste, um nach einem Filterwechsel an den Anfang zu scrollen.
  // Nur im Klick-Handler genutzt, nie beim Rendern.
  const wrapperRef = useRef<HTMLDivElement>(null);

  function choose(value: EventFilterValue) {
    setFilter(value);
    wrapperRef.current?.querySelector("[data-event-track]")?.scrollTo({ left: 0, behavior: "instant" });
  }

  function scrollEvents(direction: -1 | 1) {
    const track = wrapperRef.current?.querySelector<HTMLOListElement>("[data-event-track]");
    track?.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "instant" });
  }

  return (
    <div>
      <div role="group" aria-label="Events nach Typ filtern" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={active}
              onClick={() => choose(f)}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
                active ? "border-brand-green bg-brand-green text-white" : "border-line bg-card hover:border-brand-green"
              }`}
            >
              {f === "alle" ? "Alle" : eventTypeLabels[f]}
              <span className={`tabular-nums ${active ? "opacity-80" : "text-muted"}`}>{counts[f]}</span>
            </button>
          );
        })}
      </div>
      {/* role="status": Screenreader hören nach dem Filtern, wie viele Events übrig sind */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <p role="status" className="text-sm text-muted">
          {counts[filter]} {counts[filter] === 1 ? "Event" : "Events"}
        </p>
        <div role="group" aria-label="Eventliste verschieben" className="flex shrink-0 gap-2">
          <button
            type="button"
            aria-label="Vorherige Events"
            title="Vorherige Events"
            onClick={() => scrollEvents(-1)}
            className="grid size-10 place-items-center rounded-full border border-line bg-card text-foreground transition-colors hover:border-brand-green hover:bg-brand-green hover:text-white"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Nächste Events"
            title="Nächste Events"
            onClick={() => scrollEvents(1)}
            className="grid size-10 place-items-center rounded-full border border-line bg-card text-foreground transition-colors hover:border-brand-green hover:bg-brand-green hover:text-white"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
      <div ref={wrapperRef} data-filter={filter} className="event-filter">
        {children}
      </div>
    </div>
  );
}