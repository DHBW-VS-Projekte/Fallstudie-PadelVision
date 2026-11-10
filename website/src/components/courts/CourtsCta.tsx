/**
 * CourtsCta.tsx – emotionaler Abschluss mit Hintergrundbild
 * SERVER Component; das Bild nutzt ImageReveal nur für den 404-Fallback-Verlauf.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import ImageReveal from "@/components/ui/ImageReveal";
import { ctaSection, pageImages } from "@/components/courts/courtsContent";

export default function CourtsCta() {
  return (
    <section aria-labelledby="courts-cta-title" className="px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="relative isolate overflow-hidden rounded-[2rem] px-6 py-28 text-center text-hero-ink sm:py-40">
        <ImageReveal image={pageImages.cta} sizes="100vw" reveal={false} framed={false} className="absolute inset-0 -z-20" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-hero-shade/60" />
        <Reveal>
          <h2 id="courts-cta-title" className="mx-auto max-w-3xl text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[1.02] tracking-tight">
            {ctaSection.title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-hero-ink/85">{ctaSection.text}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/buchung" className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-green px-7 font-semibold text-white shadow-lift transition-transform hover:-translate-y-0.5">
              {ctaSection.primary}
              <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/turniere-kurse" className="inline-flex min-h-12 items-center rounded-full border border-hero-ink/40 bg-hero-ink/10 px-7 font-semibold backdrop-blur-md transition-colors hover:bg-hero-ink/20">
              {ctaSection.secondary}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}