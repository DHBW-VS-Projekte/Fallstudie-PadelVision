/**
 * LocationGrid.tsx – alle Standorte als Karten-Raster
 *
 * SERVER Component: Alle Inhalte stehen vollständig im HTML. Das Raster ist
 * damit gleichzeitig die barrierefreie und JavaScript-freie Alternative zur
 * interaktiven Karte. Nur der Link "Auf der Karte zeigen" ist eine Client-Insel.
 */
import { CalendarDays } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import ImageReveal from "@/components/ui/ImageReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ShowOnMapButton from "@/components/courts/ShowOnMapButton";
import { gridSection, locations } from "@/components/courts/courtsContent";
import { courtSummary, formatDate, nextEvent } from "@/components/courts/stats";

export default function LocationGrid() {
  return (
    <section id="standorte" aria-labelledby="standorte-title" className="bg-surface py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading id="standorte-title" eyebrow={gridSection.eyebrow} title={gridSection.title} lead={gridSection.lead} />
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((l, i) => {
            const upcoming = nextEvent(l);
            return (
              <Reveal
                as="li"
                key={l.slug}
                delay={(i % 3) * 120}
                className="interactive-card flex flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-soft"
              >
                <div className="relative">
                  <ImageReveal image={l.image} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" framed={false} className="aspect-[4/3]" />
                  <span className="absolute left-4 top-4 rounded-full bg-card/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent backdrop-blur-md">
                    {l.badge}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-semibold tracking-tight">{l.name}</h3>
                  <p className="mt-1 text-sm text-muted">
                    <span aria-hidden="true">{l.flag}</span> {l.city}, {l.country}
                  </p>
                  <p className="mt-4 text-sm font-medium">{courtSummary(l.courts)}</p>
                  {upcoming && (
                    <p className="mt-2 flex gap-2 text-sm text-muted">
                      <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
                      <span>
                        Nächstes Event: <span className="text-foreground">{upcoming.title}</span> · {formatDate(upcoming.date)}
                      </span>
                    </p>
                  )}
                  <div className="mt-auto pt-6">
                    <ShowOnMapButton slug={l.slug} city={l.city} />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}