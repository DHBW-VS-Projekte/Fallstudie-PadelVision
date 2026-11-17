/**
 * src/app/buchung/page.tsx – Buchungsseite (Route /buchung)
 *
 * SERVER Component: liefert nur den Rahmen (Navbar, Überschrift, Footer).
 * Der Ablauf selbst (BookingWizard) ist eine Client Component, weil er
 * ?standort= aus der URL liest. Beim statischen Export ("output: export") gibt
 * es keinen Server, der pro Anfrage rendern könnte – useSearchParams braucht
 * deshalb eine Suspense-Grenze; bis der Browser übernimmt, ist der Fallback sichtbar.
 * Nicht im Menü verlinkt, nur über "Court buchen"-Buttons erreichbar; noindex.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import "@/styles/booking.css";
import HomeNavbar from "@/components/layout/HomeNavbar";
import ScrollProgress from "@/components/layout/ScrollProgress";
import Footer from "@/components/layout/Footer";
import BookingWizard, { WizardSkeleton } from "@/components/booking/BookingWizard";
import ErrorBoundary from "@/components/booking/ErrorBoundary";

export const metadata: Metadata = {
  title: "Court buchen",
  description: "Buche deinen Padel-Court bei PadelVision – live, in wenigen Schritten. Bezahlung vor Ort.",
  robots: { index: false, follow: false },
};

export default function BuchungPage() {
  return (
    <>
      <a href="#inhalt" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-on-accent">
        Zum Inhalt springen
      </a>
      <ScrollProgress />
      <HomeNavbar />
      <main id="inhalt" className="flex-1 bg-background pb-24 pt-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Court buchen</p>
          <h1 className="mt-3 text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-tight">Dein nächstes Match wartet.</h1>
          <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted">
            Standort, Court und Uhrzeit wählen – wir halten dir den Slot 5 Minuten frei. Bezahlt wird vor Ort.
          </p>
          <div className="mt-10">
            <ErrorBoundary>
              <Suspense fallback={<WizardSkeleton />}>
                <BookingWizard />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}