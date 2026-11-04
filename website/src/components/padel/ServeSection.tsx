/**
 * ServeSection.tsx – Kapitel 05: Der Aufschlag, Schritt für Schritt (<ol>)
 * Server Component; Schritte blenden über Reveal nacheinander ein.
 */
import Reveal from "@/components/ui/Reveal";
import ImageReveal from "@/components/ui/ImageReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ServeDiagram from "@/components/padel/ServeDiagram";
import { eyebrowFor, images, serve } from "@/components/padel/padelContent";
import { iconMap } from "@/components/padel/icons";

export default function ServeSection() {
  return (
    <section id="aufschlag" aria-labelledby="aufschlag-title" className="py-24 lg:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading id="aufschlag-title" eyebrow={eyebrowFor("aufschlag")} title={serve.title} lead={serve.lead} />

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          <ol className="space-y-4">
            {serve.steps.map((step, i) => {
              const Icon = iconMap[step.icon];
              return (
                <Reveal as="li" key={step.text} direction="left" delay={i * 110} className="interactive-card flex gap-5 rounded-2xl border border-line bg-card p-5 shadow-soft">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent font-semibold text-on-accent">{i + 1}</span>
                  <div className="flex gap-3 pt-2">
                    <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent-2" />
                    <p className="leading-relaxed">{step.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </ol>
          <div className="space-y-8">
            <ServeDiagram />
            <ImageReveal image={images.serve} sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[4/5] sm:aspect-[3/2]" />
          </div>
        </div>
      </div>
    </section>
  );
}