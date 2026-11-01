/**
 * Hero.tsx – Vollbild-Einstieg der Seite mit Video/Bild, Ken-Burns und Wort-für-Wort-Headline
 * Server Component: Alle Animationen sind reines CSS. Das Bild nutzt
 * ImageReveal (Client-Insel) nur wegen des 404-Fallbacks.
 */
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import ImageReveal from "@/components/ui/ImageReveal";
import { hero, heroVideo, images } from "@/components/padel/padelContent";

export default function Hero() {
  const words = hero.headline.split(" ");
  return (
    // 100svh = "small viewport height": Höhe OHNE die einblendbare Browserleiste
    // auf dem Handy. 100vh wäre dort zu hoch und würde Inhalt abschneiden.
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] items-end overflow-hidden">
      {/* ===== Hintergrund: Verlauf → Bild → Video (von unten nach oben gestapelt) ===== */}
      <div className="ken-burns absolute inset-0 -z-20">
        <ImageReveal image={images.hero} sizes="100vw" reveal={false} eager framed={false} className="absolute inset-0" />
        {/* Video ist dekorativ (aria-hidden). Fehlt die Datei, bleibt das Bild sichtbar. */}
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
      {/* Lesbarkeits-Verlauf: unten dunkel → oben transparent, in beiden Themes gleich */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-hero-shade/90 via-hero-shade/45 to-hero-shade/20" />

      <div className="mx-auto w-full max-w-7xl px-5 pb-24 pt-32 text-hero-ink sm:px-8 sm:pb-32">
        {/* Die h1 enthält den ganzen Satz als sr-only für Screenreader;
            die animierten Einzelwörter sind aria-hidden, damit nichts doppelt vorgelesen wird. */}
        <h1 id="hero-title" className="max-w-4xl text-[clamp(2.75rem,8vw,6.5rem)] font-semibold leading-[0.98] tracking-tight">
          <span className="sr-only">{hero.headline}</span>
          <span aria-hidden="true">
            {words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="word-in mr-[0.25em]"
                style={{ animationDelay: `${150 + i * 110}ms` } satisfies CSSProperties}
              >
                {word}
              </span>
            ))}
          </span>
        </h1>
        <p className="fade-up mt-6 max-w-xl text-lg leading-relaxed text-hero-ink/85" style={{ animationDelay: "900ms" }}>
          {hero.subline}
        </p>

        {/* ===== Buttons ===== */}
        <div className="fade-up mt-10 flex flex-wrap gap-3" style={{ animationDelay: "1100ms" }}>
          {/* Normaler Anker-Link: weiches Scrollen kommt aus CSS (scroll-behavior) */}
          <a
            href="#was-ist-padel"
            className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-7 font-semibold text-on-accent shadow-lift transition-transform hover:-translate-y-0.5 active:translate-y-0"
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

      {/* Dezenter Scroll-Hinweis (Maus-Symbol) */}
      <div aria-hidden="true" className="absolute bottom-6 left-1/2 hidden h-10 w-6 -translate-x-1/2 justify-center rounded-full border-2 border-hero-ink/50 pt-2 sm:flex">
        <span className="scroll-dot block size-1.5 rounded-full bg-hero-ink" />
      </div>
    </section>
  );
}