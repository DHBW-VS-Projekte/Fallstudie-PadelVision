/**
 * SectionHeading.tsx – einheitliche Abschnittsüberschrift
 * Muster: Eyebrow-Label (klein, Akzentfarbe) + große h2 + kurzer Lead-Text.
 * Server Component: rein statischer Inhalt. Die Einblend-Animation kommt
 * über die Client-Komponente Reveal, die hier nur eingebettet wird.
 */
import Reveal from "@/components/ui/Reveal";

export interface SectionHeadingProps {
  /** z. B. "Kapitel 03 · Der Court" */
  eyebrow: string;
  title: string;
  /** id der h2 – wird von <section aria-labelledby> referenziert */
  id: string;
  lead?: string;
  align?: "left" | "center";
}

export default function SectionHeading({ eyebrow, title, id, lead, align = "left" }: SectionHeadingProps) {
  const center = align === "center";
  return (
    <Reveal className={center ? "mx-auto text-center" : ""}>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
      {/* clamp(min, bevorzugt, max): Schrift wächst fließend mit der Bildschirmbreite */}
      <h2
        id={id}
        className="mt-4 text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.05] tracking-tight"
      >
        {title}
      </h2>
      {lead && (
        <p className={`mt-6 max-w-prose text-lg leading-relaxed text-muted ${center ? "mx-auto" : ""}`}>
          {lead}
        </p>
      )}
    </Reveal>
  );
}