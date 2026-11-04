/**
 * RulesSection.tsx – Kapitel 08: Die wichtigsten Regeln
 * Server Component; die Tabs (RulesTabs) sind eine Client-Insel.
 */
import { Lightbulb } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import RulesTabs from "@/components/padel/RulesTabs";
import { eyebrowFor, rules } from "@/components/padel/padelContent";

export default function RulesSection() {
  return (
    <section id="regeln" aria-labelledby="regeln-title" className="bg-surface py-24 lg:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading id="regeln-title" eyebrow={eyebrowFor("regeln")} title={rules.title} lead={rules.lead} />
        <Reveal className="mt-12"><RulesTabs categories={rules.categories} /></Reveal>
        <Reveal delay={200} className="interactive-card mt-10 flex gap-4 rounded-3xl bg-olive/15 p-7">
          <Lightbulb aria-hidden="true" className="size-7 shrink-0 text-olive" />
          <div>
            <h3 className="font-semibold">Profi-Tipp</h3>
            <p className="mt-1 leading-relaxed">{rules.proTip}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}