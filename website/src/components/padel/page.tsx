/**
 * src/app/padel/page.tsx – die Seite "Padel erklärt" (Route /padel)
 * SERVER Component (kein "use client"): setzt nur die Abschnitte zusammen.
 * Interaktive Teile sind kleine Client-Inseln innerhalb der Abschnitte.
 */
import type { Metadata } from "next";
import HomeNavbar from "@/components/layout/HomeNavbar";
import PadelEntryScroll from "@/components/padel/PadelEntryScroll";
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
      <HomeNavbar />
      <PadelEntryScroll />
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