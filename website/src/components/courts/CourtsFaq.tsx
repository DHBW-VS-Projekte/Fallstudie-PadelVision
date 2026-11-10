/**
 * CourtsFaq.tsx – Kurz-FAQ zu den Standorten
 * SERVER Component mit nativem <details>/<summary> wie auf /padel:
 * von Haus aus barrierefrei, funktioniert ohne JavaScript, Animation per
 * CSS (Klasse "faq", ::details-content in globals.css).
 */
import { ChevronDown } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { faqSection } from "@/components/courts/courtsContent";

export default function CourtsFaq() {
  return (
    <section id="faq" aria-labelledby="courts-faq-title" className="py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeading id="courts-faq-title" eyebrow={faqSection.eyebrow} title={faqSection.title} align="center" />
        <div className="mt-12 space-y-3">
          {faqSection.items.map((item, i) => (
            <Reveal key={item.question} delay={i * 70}>
              <details className="faq group rounded-2xl border border-line bg-card shadow-soft">
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