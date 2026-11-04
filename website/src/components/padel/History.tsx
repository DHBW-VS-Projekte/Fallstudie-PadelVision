/**
 * History.tsx – Kapitel 02: Geschichte als animierter Zeitstrahl (<ol>)
 * Server Component; die füllende Linie übernimmt die Client-Insel TimelineTrack.
 */
import Reveal from "@/components/ui/Reveal";
import ImageReveal from "@/components/ui/ImageReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import TimelineTrack from "@/components/padel/TimeLineTrack";
import { eyebrowFor, history, images } from "@/components/padel/padelContent";

export default function History() {
  return (
    <section id="geschichte" aria-labelledby="geschichte-title" className="bg-surface py-24 lg:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_1fr]">
          <SectionHeading id="geschichte-title" eyebrow={eyebrowFor("geschichte")} title={history.title} lead={history.lead} />
          <ImageReveal image={images.history} sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-[4/5] max-h-[28rem] w-full lg:max-h-none" />
        </div>

        <div className="mt-20">
          <TimelineTrack>
            <ol className="space-y-12 md:space-y-16">
              {history.entries.map((entry, i) => {
                const right = i % 2 === 1; // Desktop: abwechselnd links/rechts
                return (
                  <li key={entry.year} className="relative pl-12 md:grid md:grid-cols-2 md:gap-16 md:pl-0">
                    {/* Punkt auf der Linie – leuchtet auf, sobald TimelineTrack data-reached setzt */}
                    <span
                      data-dot
                      aria-hidden="true"
                      className="absolute left-0 top-1.5 size-6 rounded-full border-4 border-surface bg-line transition-[background-color,transform] duration-500 data-[reached]:scale-110 data-[reached]:bg-accent md:left-1/2 md:-translate-x-1/2"
                    />
                    <Reveal direction={right ? "right" : "left"} className={right ? "md:col-start-2" : "md:text-right"}>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{entry.year}</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight">{entry.title}</h3>
                      <p className={`mt-2 max-w-md leading-relaxed text-muted ${right ? "" : "md:ml-auto"}`}>{entry.text}</p>
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </TimelineTrack>
        </div>
      </div>
    </section>
  );
}