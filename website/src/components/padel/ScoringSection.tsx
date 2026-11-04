/**
 * ScoringSection.tsx – Kapitel 07: Zählweise inkl. interaktivem Punktezähler
 * Server Component; ScoreCounter ist die Client-Insel.
 */
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import FloatingShapes from "@/components/ui/FloatingShapes";
import ScoreCounter from "@/components/padel/ScoreCounter";
import { eyebrowFor, scoring } from "@/components/padel/padelContent";

export default function ScoringSection() {
  return (
    <section id="zaehlweise" aria-labelledby="zaehlweise-title" className="relative isolate overflow-hidden py-24 lg:py-36">
      <FloatingShapes variant="a" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading id="zaehlweise-title" eyebrow={eyebrowFor("zaehlweise")} title={scoring.title} lead={scoring.lead} />

        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <Reveal><p className="text-lg font-medium">{scoring.deuceIntro}</p></Reveal>
            <ul className="mt-6 space-y-4">
              {scoring.variants.map((v, i) => (
                <Reveal as="li" key={v.title} delay={i * 120} className="interactive-card rounded-3xl border border-line bg-card p-6 shadow-soft">
                  <h3 className="text-xl font-semibold tracking-tight">{v.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{v.text}</p>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={400}><p className="mt-5 text-sm text-muted">{scoring.casualNote}</p></Reveal>
          </div>
          <Reveal direction="right">
            <h3 className="mb-4 text-xl font-semibold tracking-tight">Probier es aus</h3>
            <ScoreCounter />
          </Reveal>
        </div>
      </div>
    </section>
  );
}