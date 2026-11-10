/**
 * CourtsHero.tsx – kompakter Einstieg der Courts-Seite
 * Server Component: Ken-Burns-Zoom, Wort-für-Wort-Headline und Scroll-Hinweis
 * sind reines CSS (Klassen aus globals.css, wie auf /padel). Nur das Bild
 * nutzt ImageReveal (Client-Insel) wegen des 404-Fallbacks.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ImageReveal from "@/components/ui/ImageReveal";
import { hero, pageImages } from "@/components/courts/courtsContent";

export default function CourtsHero() {
  const words = hero.headline.split(" ");
  return (
    // min-h-[70svh]: 70 % der "kleinen" Viewport-Höhe (ohne einblendbare Browserleiste auf dem Handy)
    <section aria-labelledby="courts-hero-title" className="relative isolate flex min-h-[70svh] items-end overflow-hidden">
      {/* ===== Hintergrund: Fallback-Verlauf + Bild mit langsamem Ken-Burns-Zoom ===== */}
      <div className="ken-burns absolute inset-0 -z-20">
        <ImageReveal image={pageImages.hero} sizes="100vw" reveal={false} eager framed={false} className="absolute inset-0" />
      </div>
      {/* Lesbarkeits-Verlauf von unten (in beiden Themes gleich, weil der Text immer hell ist) */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-hero-shade/90 via-hero-shade/50 to-hero-shade/25" />

      <div className="mx-auto w-full max-w-7xl px-5 pb-20 pt-32 text-hero-ink sm:px-8 sm:pb-24">
        <p className="fade-up text-xs font-semibold uppercase tracking-[0.25em] text-hero-ink/80">{hero.eyebrow}</p>
        {/* Einzige h1 der Seite. Screenreader lesen den sr-only-Volltext,
            die animierten Einzelwörter sind aria-hidden. */}
        <h1 id="courts-hero-title" className="mt-4 max-w-4xl text-[clamp(2.6rem,7vw,5.75rem)] font-semibold leading-[0.98] tracking-tight">
          <span className="sr-only">{hero.headline}</span>
          <span aria-hidden="true">
            {words.map((word, i) => (
              <span key={`${word}-${i}`} className="word-in mr-[0.25em]" style={{ animationDelay: `${150 + i * 110}ms` }}>
                {word}
              </span>
            ))}
          </span>
        </h1>
        <p className="fade-up mt-6 max-w-xl text-lg leading-relaxed text-hero-ink/85" style={{ animationDelay: "850ms" }}>
          {hero.lead}
        </p>
        <div className="fade-up mt-10 flex flex-wrap gap-3" style={{ animationDelay: "1000ms" }}>
          <a
            href="#karte"
            className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-green px-7 font-semibold text-white shadow-lift transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {hero.primary}
            <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
          <Link
            href="/buchung"
            className="inline-flex min-h-12 items-center rounded-full border border-hero-ink/40 bg-hero-ink/10 px-7 font-semibold backdrop-blur-md transition-colors hover:bg-hero-ink/20"
          >
            {hero.secondary}
          </Link>
        </div>
      </div>

      {/* Animierter Scroll-Hinweis wie auf /padel */}
      <div aria-hidden="true" className="absolute bottom-6 left-1/2 hidden h-10 w-6 -translate-x-1/2 justify-center rounded-full border-2 border-hero-ink/50 pt-2 sm:flex">
        <span className="scroll-dot block size-1.5 rounded-full bg-hero-ink" />
      </div>
    </section>
  );
}