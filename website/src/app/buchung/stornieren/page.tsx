/**
 * src/app/buchung/stornieren/page.tsx – Buchung stornieren (Route /buchung/stornieren)
 * SERVER Component als Rahmen; das Formular (CancelForm) ist eine Client Component.
 * Versteckt (noindex) und nur von der Bestätigungsseite verlinkt.
 */
import type { Metadata } from "next";
import "@/styles/booking.css";
import HomeNavbar from "@/components/layout/HomeNavbar";
import Footer from "@/components/layout/Footer";
import CancelForm from "@/components/booking/CancelForm";

export const metadata: Metadata = {
  title: "Buchung stornieren",
  description: "Storniere deine PadelVision-Demo-Buchung mit Buchungsnummer und E-Mail.",
  robots: { index: false, follow: false },
};

export default function StornierenPage() {
  return (
    <>
      <a href="#inhalt" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-on-accent">
        Zum Inhalt springen
      </a>
      <HomeNavbar />
      <main id="inhalt" className="flex-1 bg-background pb-24 pt-12">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Buchung stornieren</p>
          <h1 className="mt-3 text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-tight tracking-tight">Doch nicht dabei?</h1>
          <p className="mt-4 max-w-prose leading-relaxed text-muted">
            Gib deine Buchungsnummer (PV-…) und die E-Mail-Adresse ein, mit der du gebucht hast. Stornieren geht bis zum Beginn des Termins.
          </p>
          <div className="mt-8">
            <CancelForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}