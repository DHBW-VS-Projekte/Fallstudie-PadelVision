/**
 * Equipment.tsx – Kapitel 04: Ausrüstung
 * Server Component: statische Karten + Bild, Animation über Reveal.
 */
import { Check, Info } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import ImageReveal from "@/components/ui/ImageReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import FloatingShapes from "@/components/ui/FloatingShapes";
import { equipment, eyebrowFor, images } from "@/components/padel/padelContent";
import { iconMap } from "@/components/padel/icons";

export default function Equipment() {
  return (
    <section id="ausruestung" aria-labelledby="ausruestung-title" className="relative isolate overflow-hidden bg-surface py-24 lg:py-36">
      <FloatingShapes variant="b" />
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
        <div>
          <SectionHeading id="ausruestung-title" eyebrow={eyebrowFor("ausruestung")} title={equipment.title} lead={equipment.lead} />
          <ImageReveal image={images.equipment} sizes="(min-width: 1024px) 40vw, 100vw" className="mt-10 aspect-square" />
        </div>
        <div className="space-y-5">
          {equipment.items.map((item, i) => {
            const Icon = iconMap[item.icon];
            return (
              <Reveal key={item.title} direction="right" delay={i * 120} className="interactive-card rounded-3xl border border-line bg-card p-7 shadow-soft">
                <div className="flex items-center gap-4">
                  <span className="grid size-12 place-items-center rounded-2xl bg-olive/15 text-olive">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight">{item.title}</h3>
                </div>
                <ul className="mt-4 space-y-2">
                  {item.points.map((p) => (
                    <li key={p} className="flex gap-3 leading-relaxed text-muted">
                      <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-accent-2" />
                      {p}
                    </li>
                  ))}
                </ul>
              </Reveal>
            );
          })}
          <Reveal delay={400}>
            <p className="interactive-card flex gap-3 rounded-3xl bg-accent p-6 font-medium text-on-accent shadow-lift">
              <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              {equipment.rentalNote}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}