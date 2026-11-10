/**
 * Footer.tsx – Kontakt/Impressum-Bereich
 * Server Component: rein statisch, kein JavaScript im Browser nötig.
 * Alle Kontaktdaten sind bewusst erkennbare PLATZHALTER (.example-Domain).
 */
import Link from "next/link";
import LogoMark from "@/components/layout/LogoMark";

export default function Footer() {

  // Hinweis zum Jahr: Die Seite wird statisch beim Build erzeugt. Das Jahr
  // "friert" also auf das Build-Jahr ein. Für ein Uni-Projekt ist das okay,
  // weil bei jedem neuen Build/Deployment aktualisiert wird. Alternative:
  // das Jahr in einer kleinen Client-Komponente berechnen.
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark />
            <p className="text-xl font-semibold tracking-tight">
              Padel<span className="text-accent">Vision</span>
            </p>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            2 Indoor-Courts, 1 Outdoor-Court, Kurse und Turniere.
          </p>
        </div>

        {/* <address> kennzeichnet semantisch Kontaktdaten */}
        <address className="text-sm not-italic leading-relaxed text-muted">
          <p className="mb-2 font-semibold text-foreground">Kontakt</p>
          Musterstraße 1<br />
          12345 Musterstadt
          <br />
          <a href="tel:+490000000000" className="inline-block py-1 hover:text-accent">+49 000 0000000</a>
          <br />
          <a href="mailto:hallo@padelvision.example" className="inline-block py-1 hover:text-accent">
            hallo@padelvision.example
          </a>
        </address>

        <div className="text-sm">
          <p className="mb-2 font-semibold">Rechtliches</p>
          <ul className="text-muted">
            <li><Link href="/impressum" className="inline-block py-1.5 hover:text-accent">Impressum</Link></li>
            <li><Link href="/datenschutz" className="inline-block py-1.5 hover:text-accent">Datenschutz</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-line py-6 text-center text-xs text-muted">© {year} PadelVision</p>
    </footer>
  );
}