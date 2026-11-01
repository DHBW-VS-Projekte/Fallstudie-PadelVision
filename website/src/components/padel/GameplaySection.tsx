/**
 * GameplaySection.tsx – Kapitel 06: Spielablauf & Wandspiel
 * Server Component; Grafik mit Abspielen-Button ist eine Client-Insel.
 */
import { CircleDot } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import ImageReveal from "@/components/ui/ImageReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import WallPlayDiagram from "@/components/padel/WallPlayDiagram";
import { eyebrowFor, gameplay, images } from "@/components/padel/padelContent";

export default function GameplaySection() {
  return (
    <section id="spielablauf" aria-labelledby="spielablauf-title" className="bg-surface py-24 lg:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <ImageReveal image={images.wallPlay} sizes="(min-width: 1024px) 50vw, 100vw" className="order-last aspect-[4/5] lg:order-first" />
          <div>
            <SectionHeading id="spielablauf-title" eyebrow={eyebrowFor("spielablauf")} title={gameplay.title} lead={gameplay.lead} />
            <ul className="mt-8 space-y-4">
              {gameplay.points.map((p, i) => (
                <Reveal as="li" key={p} delay={i * 100} className="flex gap-3 leading-relaxed">
                  <CircleDot aria-hidden="true" className="mt-1 size-5 shrink-0 text-accent" />
                  {p}
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-16"><WallPlayDiagram steps={gameplay.steps} /></div>
      </div>
    </section>
  );
}