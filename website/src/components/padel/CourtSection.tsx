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
    <section id="court" aria-labelledby="court-title" className="py-24 lg:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading id="court-title" eyebrow={eyebrowFor("court")} title={court.title} lead={court.lead} />
        <Reveal><p className="mt-4 max-w-prose leading-relaxed text-muted">{court.detail}</p></Reveal>

        <Reveal className="mt-14"><CourtDiagram /></Reveal>

        {/* ===== Indoor vs. Outdoor + Bild ===== */}
        <div className="mt-20 grid items-center gap-10 lg:grid-cols-2">
          <ImageReveal image={images.court} sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[16/10]" />
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