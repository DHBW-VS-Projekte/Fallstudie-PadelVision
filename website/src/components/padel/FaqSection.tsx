/**
 * FaqSection.tsx – Kapitel 09: FAQ für Einsteiger
 * Server Component mit nativem <details>/<summary>.
 * Warum nicht ein JS-Akkordeon? <details> ist von Haus aus barrierefrei
 * (Tastatur, Screenreader-Zustand "erweitert/reduziert"), funktioniert
 * OHNE JavaScript und spart eine Client-Komponente. Die Öffnen-Animation
 * kommt per CSS (::details-content in globals.css).
 */
import { ChevronDown } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { eyebrowFor, faq } from "@/components/padel/padelContent";

export default function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-24 lg:py-36">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeading id="faq-title" eyebrow={eyebrowFor("faq")} title={faq.title} align="center" />
        <div className="mt-12 space-y-3">
          {faq.items.map((item, i) => (
            <Reveal key={item.question} delay={i * 70}>
              {/* group-open: Tailwind-Variante, wenn das <details> offen ist → Chevron dreht sich */}
              <details className="interactive-card faq group rounded-2xl border border-line bg-card shadow-soft">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-semibold">
                  <h3 className="text-base">{item.question}</h3>
                  <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-accent transition-transform duration-500 group-open:rotate-180" />
                </summary>
                <p className="px-6 pb-6 leading-relaxed text-muted">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}