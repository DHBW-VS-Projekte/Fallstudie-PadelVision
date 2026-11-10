/**
 * EventsTimeline.tsx – alle Events aller Standorte als horizontale Leiste
 *
 * SERVER Component: Sortierung und Zählung passieren hier (stats.ts), die
 * Karten stehen fertig im HTML. Nur die Filter-Chips (EventFilter) sind
 * eine Client-Insel. Scroll-Snap sorgt dafür, dass die Leiste beim Wischen
 * sauber an einer Karte einrastet (snap-x snap-mandatory + snap-start).
 */
import SectionHeading from "@/components/ui/SectionHeading";
import EventFilter, { type EventFilterValue } from "@/components/courts/EventFilter";
import { eventTypeLabels, eventsSection, levelLabels, locations } from "@/components/courts/courtsContent";
import { eventTypeClasses } from "@/components/courts/icons";
import { toneDot } from "@/components/courts/tones";
import { FEW_SPOTS, allEventsSorted, dateParts, spotsLabel } from "@/components/courts/stats";

export default function EventsTimeline() {
  const events = allEventsSorted(locations);
  const counts: Record<EventFilterValue, number> = {
    alle: events.length,
    turnier: events.filter((e) => e.type === "turnier").length,
    kurs: events.filter((e) => e.type === "kurs").length,
    community: events.filter((e) => e.type === "community").length,
    camp: events.filter((e) => e.type === "camp").length,
  };

  return (
    <section id="events" aria-labelledby="events-title" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading id="events-title" eyebrow={eventsSection.eyebrow} title={eventsSection.title} lead={eventsSection.lead} />
        <div className="mt-10">
          <EventFilter counts={counts}>
            {/* tabIndex=0 + role="region": Die Leiste ist per Tastatur fokussierbar
                und lässt sich dann mit den Pfeiltasten horizontal scrollen. */}
            <div role="region" aria-label="Eventliste, horizontal scrollbar" tabIndex={0} className="-mx-5 mt-2 rounded-3xl sm:mx-0">
              <ol data-event-track className="no-scrollbar flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-6 pt-2 sm:scroll-px-0 sm:px-0">
                {events.map((e) => {
                  const d = dateParts(e.date);
                  return (
                    <li
                      key={e.id}
                      data-type={e.type}
                      className="interactive-card flex w-[17rem] shrink-0 snap-start flex-col rounded-3xl border border-line bg-card p-6 shadow-soft"
                    >
                      {/* Datum groß – <time> liefert Maschinen das ISO-Datum */}
                      <time dateTime={e.date} className="flex items-baseline gap-2">
                        <span className="text-5xl font-semibold leading-none tracking-tight">{d.day}</span>
                        <span className="text-sm font-medium uppercase tracking-[0.15em] text-muted">
                          {d.month} {d.year}
                        </span>
                      </time>
                      <h3 className="mt-4 text-lg font-semibold leading-snug">{e.title}</h3>
                      <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                        <span aria-hidden="true" className={`size-2.5 rounded-full ${toneDot[e.locationTone]}`} />
                        {e.locationCity}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                        <span className={`rounded-full px-2.5 py-1 font-medium ${eventTypeClasses[e.type]}`}>{eventTypeLabels[e.type]}</span>
                        <span className="text-muted">{levelLabels[e.level]}</span>
                      </div>
                      <p className={`mt-auto pt-4 text-sm font-medium ${e.spotsLeft < FEW_SPOTS ? "text-accent" : "text-accent-2"}`}>
                        {spotsLabel(e.spotsLeft)}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </EventFilter>
        </div>
      </div>
    </section>
  );
}