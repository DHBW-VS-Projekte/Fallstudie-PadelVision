/**
 * CourtSection.tsx – Kapitel 03: Der Court
 * Server Component; die interaktive Grafik (CourtDiagram) ist eine Client-Insel.
 */
import { Building2, Sun } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import ImageReveal from "@/components/ui/ImageReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import CourtDiagram from "@/components/padel/CourtDiagram";
import { court, eyebrowFor, images } from "@/components/padel/padelContent";

export default function CourtSection() {
  const icons = [Building2, Sun];
  return (
    <section id="court" aria-labelledby="court-title" className="py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading id="court-title" eyebrow={eyebrowFor("court")} title={court.title} lead={court.lead} />
        <Reveal><p className="mt-4 max-w-prose leading-relaxed text-muted">{court.detail}</p></Reveal>

        <Reveal className="mt-10"><CourtDiagram /></Reveal>

        {/* ===== Indoor vs. Outdoor + Bild ===== */}
        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
          <figure className="relative grid aspect-[16/10] grid-cols-2 gap-2 overflow-hidden rounded-3xl shadow-soft">
            <ImageReveal
              image={images.courtIndoor}
              sizes="(min-width: 1024px) 25vw, 50vw"
              reveal={false}
              framed={false}
              className="h-full min-h-0"
            />
            <ImageReveal
              image={images.courtOutdoor}
              sizes="(min-width: 1024px) 25vw, 50vw"
              reveal={false}
              framed={false}
              className="h-full min-h-0"
            />
            <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between gap-2 bg-gradient-to-t from-brand-green/90 via-brand-green/35 to-transparent px-4 pb-4 pt-12 text-xs font-semibold uppercase tracking-[0.16em] text-white sm:px-5 sm:text-sm">
              <span>Indoor</span>
              <span>Outdoor</span>
            </figcaption>
          </figure>
          <div>
            <div className="grid gap-5 sm:grid-cols-2">
              {court.indoorOutdoor.map((card, i) => {
                const Icon = icons[i] ?? Sun;
                return (
                  <Reveal key={card.title} delay={i * 120} className="interactive-card group rounded-3xl border border-line bg-card p-6 shadow-soft">
                    <span className="grid size-12 place-items-center rounded-2xl bg-accent-2/10 text-accent-2 transition-colors duration-500 group-hover:bg-accent-2 group-hover:text-background">
                      <Icon aria-hidden="true" className="size-6" />
                    </span>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted">{i === 0 ? "Spiel bei jedem Wetter" : "Draußen im Tageslicht"}</p>
                    <h3 className="mt-2 text-xl font-semibold">{card.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted">{card.text}</p>
                  </Reveal>
                );
              })}
            </div>
            <Reveal delay={250}>
              <p className="interactive-card mt-6 rounded-2xl bg-accent-2/10 p-5 font-medium text-accent-2">{court.padelVisionNote}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}