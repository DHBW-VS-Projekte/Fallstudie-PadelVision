/**
 * src/app/courts/page.tsx – die Seite "Courts" (Route /courts)
 *
 * SERVER Component (kein "use client"): setzt nur die Abschnitte zusammen.
 * Interaktiv sind kleine Client-Inseln: CourtsExplorer (Karte, Chips, Panel),
 * StatsCounter, EventFilter und ShowOnMapButton.
 *
 * Hinweis Layout: Euer aktuelles src/app/layout.tsx bindet Navbar, Lese-
 * fortschritt und Footer NICHT ein. Deshalb rendert diese Seite sie selbst
 * (wie vermutlich auch /padel). Falls die Navbar doppelt erscheint, sind sie
 * bereits im Layout → dann hier Skip-Link, ScrollProgress, Navbar und Footer löschen.
 */
import type { Metadata } from "next";
import HomeNavbar from "@/components/layout/HomeNavbar";
import Footer from "@/components/layout/Footer";
import SectionHeading from "@/components/ui/SectionHeading";
import FloatingShapes from "@/components/ui/FloatingShapes";
import CourtsHero from "@/components/courts/CourtsHero";
import StatsBand from "@/components/courts/StatsBand";
import CourtsExplorer from "@/components/courts/CourtsExplorer";
import MapLand from "@/components/courts/MapLand";
import LocationDetail from "@/components/courts/LocationDetail";
import LocationGrid from "@/components/courts/LocationGrid";
import EventsTimeline from "@/components/courts/EventsTimeLine";
import IndoorOutdoor from "@/components/courts/IndoorOutdoor";
import CourtsFaq from "@/components/courts/CourtsFaq";
import CourtsCta from "@/components/courts/CourtsCta";
import { locations, mapSection } from "@/components/courts/courtsContent";

// Wird durch das Titel-Template im Layout zu "Courts | PadelVision"
export const metadata: Metadata = {
  title: "Courts",
  description:
    "Alle PadelVision-Standorte auf einen Blick: Konstanz, Marbella, Porto-Vecchio, Santorini und Chania – mit interaktiver Karte, Courts, Ausstattung und kommenden Events.",
};

export default function CourtsPage() {
  // Die fünf Detail-Panels werden HIER auf dem Server gerendert und als
  // fertige React-Elemente an den Client-Explorer übergeben.
  const details = Object.fromEntries(locations.map((l) => [l.slug, <LocationDetail key={l.slug} location={l} />]));

  return (
    <>
      {/* ===== Skip-Link: erstes fokussierbares Element, nur bei Tastaturfokus sichtbar ===== */}
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-on-accent"
      >
        Zum Inhalt springen
      </a>
      <HomeNavbar />

      <main id="inhalt" className="flex-1">
        {/* ===== Abschnitt: Hero ===== */}
        <CourtsHero />

        {/* ===== Abschnitt: Kennzahlen ===== */}
        <StatsBand />

        {/* ===== Abschnitt: Interaktive Karte + Detail-Panel ===== */}
        <section id="karte" aria-labelledby="karte-title" className="relative isolate overflow-hidden py-24 lg:py-32">
          <FloatingShapes variant="a" />
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading id="karte-title" eyebrow={mapSection.eyebrow} title={mapSection.title} lead={mapSection.lead} />
            <div className="mt-12">
              <CourtsExplorer locations={locations} land={<MapLand />} details={details} />
            </div>
          </div>
        </section>

        {/* ===== Abschnitt: Alle Standorte ===== */}
        <LocationGrid />

        {/* ===== Abschnitt: Event-Zeitstrahl ===== */}
        <EventsTimeline />

        {/* ===== Abschnitt: Indoor vs. Outdoor ===== */}
        <IndoorOutdoor />

        {/* ===== Abschnitt: FAQ ===== */}
        <CourtsFaq />

        {/* ===== Abschnitt: Abschluss ===== */}
        <CourtsCta />
      </main>

      <Footer />
    </>
  );
}