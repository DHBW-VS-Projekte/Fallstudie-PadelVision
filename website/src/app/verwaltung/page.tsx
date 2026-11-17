/**
 * src/app/verwaltung/page.tsx – Admin-Ansicht (Route /verwaltung)
 *
 * SERVER Component als statische Hülle: Sie enthält KEINE Daten. Alles kommt
 * erst nach dem Login über die Admin-API, die jede Anfrage gegen die
 * PHP-Session prüft. Nirgends verlinkt, noindex.
 * Bewusst ohne Website-Navbar: Auf dem Beamer soll nur das Dashboard zu sehen sein.
 */
import type { Metadata } from "next";
import "@/styles/booking.css";
import AdminApp from "@/components/admin/AdminApp";

export const metadata: Metadata = {
  title: "Verwaltung",
  description: "Interne Live-Übersicht der Demo-Buchungen.",
  robots: { index: false, follow: false },
};

export default function VerwaltungPage() {
  return (
    <main id="inhalt" className="min-h-screen flex-1 bg-background px-5 pb-16 pt-10 sm:px-8">
      <div className="mx-auto max-w-[96rem]">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">PadelVision · Verwaltung</p>
        <h1 className="mt-2 text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-tight">Live-Buchungen</h1>
        <div className="mt-8">
          <AdminApp />
        </div>
      </div>
    </main>
  );
}