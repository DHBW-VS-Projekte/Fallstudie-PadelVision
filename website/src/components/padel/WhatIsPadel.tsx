/**
 * WhatIsPadel.tsx – Kapitel 01: Was ist Padel?
 * Server Component: statischer Inhalt, Animationen über Reveal-Inseln.
 */
import Reveal from "@/components/ui/Reveal";
import ImageReveal from "@/components/ui/ImageReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import FloatingShapes from "@/components/ui/FloatingShapes";
import { eyebrowFor, images, whatIsPadel } from "@/components/padel/padelContent";
import { iconMap } from "@/components/padel/icons";

export default function WhatIsPadel() {
  return (
    <section id="was-ist-padel" aria-labelledby="was-ist-padel-title" className="relative isolate overflow-hidden py-24 lg:py-36">
      <FloatingShapes variant="a" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading id="was-ist-padel-title" eyebrow={eyebrowFor("was-ist-padel")} title={whatIsPadel.title} lead={whatIsPadel.lead} />

        {/* ===== Fakten-Karten, gestaffelt eingeblendet ===== */}
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whatIsPadel.facts.map((fact, i) => {
            const Icon = iconMap[fact.icon];
            return (
              <Reveal
                as="li"
                key={fact.title}
                delay={i * 120}
                // hover: ist in Tailwind v4 an @media (hover: hover) gebunden →
                // auf Touch-Geräten "klebt" der Hover-Zustand nicht.
                className="interactive-card rounded-3xl border border-line bg-card p-7 shadow-soft"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-accent/10 text-accent">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{fact.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{fact.text}</p>
              </Reveal>
            );
          })}
        </ul>

        <ImageReveal image={images.doubles} sizes="(min-width: 1280px) 1216px, 100vw" className="mt-16 aspect-[4/3] sm:aspect-[16/9]" />
      </div>
    </section>
  );
}