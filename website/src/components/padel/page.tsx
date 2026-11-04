/**
 * src/app/padel/page.tsx – die Seite "Padel erklärt" (Route /padel)
 * SERVER Component (kein "use client"): setzt nur die Abschnitte zusammen.
 * Interaktive Teile sind kleine Client-Inseln innerhalb der Abschnitte.
 */
import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/padel/Hero";
import ChapterNav from "@/components/padel/ChapterNav";
import WhatIsPadel from "@/components/padel/WhatIsPadel";
import History from "@/components/padel/History";
import CourtSection from "@/components/padel/CourtSection";
import Equipment from "@/components/padel/Equipment";
import ServeSection from "@/components/padel/ServeSection";
import GameplaySection from "@/components/padel/GameplaySection";
import ScoringSection from "@/components/padel/ScoringSection";
import RulesSection from "@/components/padel/RulesSection";
import FaqSection from "@/components/padel/FaqSection";
import FinalCta from "@/components/padel/FinalCta";
import { chapters } from "@/components/padel/padelContent";

// Wird durch das Template im Layout zu "Padel erklärt | PadelVision"
export const metadata: Metadata = {
  title: "Padel erklärt",
  description:
    "Was ist Padel? Court, Ausrüstung, Aufschlag, Wandspiel, Zählweise und Regeln – verständlich erklärt für Einsteiger. Danach direkt bei PadelVision buchen.",
};

export default function PadelPage() {
  return (
    <>
    {/* ===== PadelVision Hauptnavigation ===== */}
      <header className="relative z-50 border-b border-white/10 bg-[#103B31] text-white">
        <nav
          aria-label="Hauptnavigation"
          className="mx-auto flex min-h-20 max-w-[1440px] items-center justify-between gap-4 px-5 md:px-10"
        >
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight md:text-2xl"
          >
            PADELVISION
          </Link>

          <div className="flex items-center gap-4 md:gap-8">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-[#EC8167]"
            >
              Home
            </Link>

            <Link
              href="/padel"
              aria-current="page"
              className="hidden text-sm font-medium text-[#EC8167] sm:inline"
            >
              Padel entdecken
            </Link>

            <Link
              href="/booking"
              className="rounded-full bg-[#EC8167] px-4 py-3 text-xs font-bold text-[#103B31] transition-colors hover:bg-[#FFA18A] sm:px-5 sm:text-sm"
            >
              Court buchen
            </Link>
          </div>
        </nav>
      </header>
      {/* ===== Abschnitt: Hero ===== */}
      <Hero />
      {/* ===== Klebende Kapitelnavigation ===== */}
      <ChapterNav chapters={chapters} />
      {/* ===== Kapitel 01–09 ===== */}
      <WhatIsPadel />
      <History />
      <CourtSection />
      <Equipment />
      <ServeSection />
      <GameplaySection />
      <ScoringSection />
      <RulesSection />
      <FaqSection />
      {/* ===== Abschluss ===== */}
      <FinalCta />
    </>
  );
}