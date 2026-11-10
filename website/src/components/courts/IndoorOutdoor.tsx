/**
 * IndoorOutdoor.tsx – "Zwei Welten. Ein Gefühl." (angelehnt ans Moodboard Court Culture)
 * SERVER Component: zwei große Bildkarten; die Court-Zahlen werden aus den Daten berechnet.
 */
import Reveal from "@/components/ui/Reveal";
import ImageReveal from "@/components/ui/ImageReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import FloatingShapes from "@/components/ui/FloatingShapes";
import { indoorOutdoorSection as t, locations, pageImages } from "@/components/courts/courtsContent";
import { courtTypeIcons } from "@/components/courts/icons";
import { totalIndoor, totalOutdoor } from "@/components/courts/stats";

export default function IndoorOutdoor() {
  const cards = [
    {
      key: "indoor",
      title: t.indoorTitle,
      text: t.indoorText,
      image: pageImages.indoor,
      Icon: courtTypeIcons.indoor,
      count: totalIndoor(locations),
      places: locations.filter((l) => l.courts.indoor > 0).length,
      label: "Indoor-Courts",
    },
    {
      key: "outdoor",
      title: t.outdoorTitle,
      text: t.outdoorText,
      image: pageImages.outdoor,
      Icon: courtTypeIcons.outdoor,
      count: totalOutdoor(locations),
      places: locations.filter((l) => l.courts.outdoor > 0).length,
      label: "Outdoor-Courts",
    },
  ];

  return (
    <section id="indoor-outdoor" aria-labelledby="indoor-outdoor-title" className="relative isolate overflow-hidden bg-surface py-24 lg:py-32">
      <FloatingShapes variant="b" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading id="indoor-outdoor-title" eyebrow={t.eyebrow} title={t.title} />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {cards.map((c, i) => (
            <Reveal key={c.key} direction={i === 0 ? "left" : "right"} className="interactive-card group relative isolate overflow-hidden rounded-3xl shadow-lift">
              <ImageReveal image={c.image} sizes="(min-width: 768px) 50vw, 100vw" framed={false} className="aspect-[4/5]" />
              {/* Verlauf von unten für die Lesbarkeit des hellen Textes */}
              <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-hero-shade/90 via-hero-shade/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-hero-ink sm:p-9">
                <c.Icon aria-hidden="true" className="size-8" />
                <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{c.title}</h3>
                <p className="mt-2 max-w-sm leading-relaxed text-hero-ink/85">{c.text}</p>
                <p className="mt-6 flex items-baseline gap-2">
                  <span className="text-5xl font-semibold tracking-tight">{c.count}</span>
                  <span className="text-hero-ink/85">
                    {c.label} an {c.places} Standorten
                  </span>
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}