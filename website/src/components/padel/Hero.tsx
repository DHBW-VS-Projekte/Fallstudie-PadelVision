
/**
 * Hero.tsx – Responsive Hero-Section der Padel-Seite
 *
 * Inhaltsbasierte Höhe statt erzwungener Vollbilddarstellung.
 * Behält Hintergrund, Ken-Burns-Effekt, Wortanimationen
 * und Call-to-Action-Buttons bei.
 */

import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";

import ImageReveal from "@/components/ui/ImageReveal";
import { hero, heroVideo, images } from "@/components/padel/padelContent";

export default function Hero() {
  const words = hero.headline.split(" ");

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden"
    >
      {/* ===== Hintergrundbild und Video ===== */}
      <div className="ken-burns absolute inset-0 -z-20">
        <ImageReveal
          image={images.hero}
          sizes="100vw"
          reveal={false}
          eager
          framed={false}
          className="absolute inset-0"
        />

        <video
          className="hero-video absolute inset-0 size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={images.hero.src}
          aria-hidden="true"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      </div>

      {/* ===== Kontrastverlauf für Lesbarkeit ===== */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-hero-shade/90 via-hero-shade/65 to-hero-shade/20"
      />

      {/* ===== Hero-Inhalt ===== */}
      <div
        className="
          relative z-10 mx-auto w-full max-w-7xl
          px-5 pt-12 pb-20
          text-hero-ink
          sm:px-8 sm:pt-14 sm:pb-20
          lg:px-10
        "
      >
        {/* ===== Eyebrow ===== */}
        <p
          className="fade-up mb-5 text-xs font-bold uppercase tracking-[0.25em] text-accent sm:mb-6 sm:text-sm"
          style={{ animationDelay: "100ms" }}
        >
          Padel entdecken
        </p>

        {/* ===== Animierte Hauptüberschrift ===== */}
        <h1
          id="hero-title"
          className="
            max-w-5xl
            text-[clamp(2rem,4vw,4rem)]
            font-semibold leading-[1.08] tracking-tight
          "
        >
          <span className="sr-only">{hero.headline}</span>

          <span aria-hidden="true">
            {words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="word-in mr-[0.25em]"
                style={{
                  animationDelay: `${150 + i * 110}ms`,
                } satisfies CSSProperties}
              >
                {word}
              </span>
            ))}
          </span>
        </h1>

        {/* ===== Beschreibung ===== */}
        <p
          className="
            fade-up mt-5 max-w-xl
            text-base leading-relaxed text-hero-ink/85
            sm:mt-6 sm:text-lg
          "
          style={{ animationDelay: "900ms" }}
        >
          {hero.subline}
        </p>

        {/* ===== Call-to-Action-Buttons ===== */}
        <div
          className="fade-up mt-7 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4"
          style={{ animationDelay: "1100ms" }}
        >
          <a
            href="#was-ist-padel"
            className="
              group inline-flex min-h-12 items-center gap-3
              rounded-full bg-brand-green px-6
              font-semibold text-white shadow-lift
              transition-transform hover:-translate-y-0.5
              active:translate-y-0 sm:px-7
            "
          >
            {hero.primary}
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-1"
            />
          </a>

          <Link
            href="/booking"
            className="
              inline-flex min-h-12 items-center
              rounded-full border border-hero-ink/40
              bg-hero-ink/10 px-6
              font-semibold text-hero-ink backdrop-blur-md
              transition-colors hover:bg-hero-ink/20 sm:px-7
            "
          >
            {hero.secondary}
          </Link>
        </div>
      </div>

      {/* ===== Scroll-Hinweis ===== */}
      <div
        aria-hidden="true"
        className="
          absolute bottom-5 left-1/2
          hidden h-10 w-6 -translate-x-1/2
          justify-center rounded-full
          border-2 border-hero-ink/50 pt-2
          lg:flex
        "
      >
        <span className="scroll-dot block size-1.5 rounded-full bg-hero-ink" />
      </div>
    </section>
  );
}
