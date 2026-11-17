import Link from "next/link";
import { ArrowDown, ArrowRight, CalendarDays, MapPin } from "lucide-react";
import type { Metadata } from "next";
import EventFilter, { type EventFilterValue } from "@/components/courts/EventFilter";
import { eventTypeClasses } from "@/components/courts/icons";
import { toneDot } from "@/components/courts/tones";
import Footer from "@/components/layout/Footer";
import HomeNavbar from "@/components/layout/HomeNavbar";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  eventTypeLabels,
  eventsSection,
  levelLabels,
  locations,
} from "@/components/courts/courtsContent";
import { allEventsSorted, dateParts, FEW_SPOTS, spotsLabel } from "@/components/courts/stats";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Entdecke die Turniere, Kurse, Camps und Community-Events von PadelVision an allen Standorten.",
};

export default function EventsPage() {
  const events = allEventsSorted(locations);
  const counts: Record<EventFilterValue, number> = {
    alle: events.length,
    turnier: events.filter((event) => event.type === "turnier").length,
    kurs: events.filter((event) => event.type === "kurs").length,
    community: events.filter((event) => event.type === "community").length,
    camp: events.filter((event) => event.type === "camp").length,
  };
  const nextEvent = events[0];
  const nextDate = nextEvent ? dateParts(nextEvent.date) : null;

  return (
    <>
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-on-accent"
      >
        Zum Inhalt springen
      </a>
      <HomeNavbar />

      <main id="inhalt">
        <section className="relative isolate overflow-hidden bg-brand-green text-white" aria-labelledby="events-hero-title">
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 size-[30rem] rounded-full border border-white/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-64 left-[38%] size-[34rem] rounded-full border border-white/10" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
                <CalendarDays aria-hidden="true" className="size-4" />
                PadelVision · Events
              </p>
              <h1 id="events-hero-title" className="mt-6 max-w-3xl text-[clamp(2.75rem,7vw,5.75rem)] font-semibold leading-[0.98] tracking-tight">
                Gemeinsam spielen.
                <span className="mt-2 block text-[#e7b89e]">Mehr erleben.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
                Turniere, Kurse, Camps und Community-Events – entdecke, was an unseren Standorten als Nächstes ansteht.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a href="#termine" className="inline-flex min-h-12 items-center gap-3 rounded-full bg-accent px-6 font-semibold text-on-accent transition-transform hover:-translate-y-0.5">
                  Events entdecken
                  <ArrowDown aria-hidden="true" className="size-4" />
                </a>
                <span className="text-sm text-white/65">{events.length} Events · {locations.length} Standorte</span>
              </div>
            </div>

            {nextEvent && nextDate && (
              <article className="relative rounded-[2rem] border border-white/15 bg-white/[0.08] p-6 shadow-2xl backdrop-blur-sm sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">Als Nächstes</p>
                <div className="mt-6 flex items-start justify-between gap-5">
                  <div>
                    <p className="text-sm font-medium text-white/70">{nextDate.month} {nextDate.year}</p>
                    <p className="mt-1 text-6xl font-semibold leading-none tracking-tight">{nextDate.day}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${eventTypeClasses[nextEvent.type]}`}>
                    {eventTypeLabels[nextEvent.type]}
                  </span>
                </div>
                <h2 className="mt-7 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{nextEvent.title}</h2>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/70">{nextEvent.description}</p>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
                  <span className="inline-flex items-center gap-2">
                    <MapPin aria-hidden="true" className="size-4 text-[#e7b89e]" />
                    {nextEvent.locationCity}
                  </span>
                  <span>{nextEvent.time} Uhr</span>
                </div>
                <Link
                  href={`/buchung?event=${encodeURIComponent(nextEvent.id)}`}
                  className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-5 font-semibold text-brand-green transition-colors hover:bg-[#f1e7db]"
                >
                  Platz sichern
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </article>
            )}
          </div>
        </section>

        <section id="termine" aria-labelledby="event-list-title" className="scroll-mt-8 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              id="event-list-title"
              eyebrow={eventsSection.eyebrow}
              title={eventsSection.title}
              lead={eventsSection.lead}
            />
            <div className="mt-10">
              <EventFilter counts={counts} layout="grid">
                {events.length > 0 ? (
                  <ul data-event-track className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {events.map((event) => {
                      const date = dateParts(event.date);
                      return (
                        <li
                          key={event.id}
                          data-type={event.type}
                          className="interactive-card relative flex min-h-[22rem] flex-col overflow-hidden rounded-3xl border border-line bg-card p-6 shadow-soft transition-transform hover:-translate-y-1"
                        >
                          <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${toneDot[event.locationTone]}`} />
                          <div className="flex items-start justify-between gap-4">
                            <time dateTime={event.date} className="flex items-baseline gap-2">
                              <span className="text-5xl font-semibold leading-none tracking-tight">{date.day}</span>
                              <span className="text-sm font-medium uppercase tracking-[0.12em] text-muted">
                                {date.month} {date.year}
                              </span>
                            </time>
                            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${eventTypeClasses[event.type]}`}>
                              {eventTypeLabels[event.type]}
                            </span>
                          </div>

                          <p className="mt-6 flex items-center gap-2 text-sm font-medium text-muted">
                            <span aria-hidden="true" className={`size-2.5 rounded-full ${toneDot[event.locationTone]}`} />
                            {event.locationCity}
                            <span aria-hidden="true">·</span>
                            {event.time} Uhr
                          </p>
                          <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight">{event.title}</h3>
                          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{event.description}</p>

                          <div className="mt-auto pt-6">
                            <div className="mb-4 flex items-center justify-between gap-3 text-sm">
                              <span className="text-muted">{levelLabels[event.level]}</span>
                              <span className={`font-semibold ${event.spotsLeft < FEW_SPOTS ? "text-accent" : "text-accent-2"}`}>
                                {spotsLabel(event.spotsLeft)}
                              </span>
                            </div>
                            <Link
                              href={`/buchung?event=${encodeURIComponent(event.id)}`}
                              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-on-accent shadow-lift transition-transform hover:-translate-y-0.5"
                            >
                              Event buchen
                              <ArrowRight aria-hidden="true" className="size-4" />
                            </Link>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-6 rounded-3xl border border-line bg-card p-8 text-center text-muted">
                    Aktuell sind keine Events eingetragen.
                  </p>
                )}
              </EventFilter>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
