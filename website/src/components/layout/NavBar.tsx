"use client";
/**
 * Navbar.tsx – Hauptnavigation (fixed) mit Theme-Switch und Burger-Menü
 * Verwendung: auf allen Seiten.
 * Client Component: braucht den aktuellen Pfad (usePathname), die
 * Scrollposition und den Öffnen/Schließen-Zustand des Mobilmenüs.
 *
 * GEÄNDERT für /courts (nur zwei Stellen):
 *  1. NAV_LINKS: neuer Eintrag "Courts" → /courts
 *  2. PAGES_WITH_HERO: "/courts" ergänzt, damit die Navbar über dem dunklen
 *     Courts-Hero transparent mit heller Schrift startet.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Start" },
  { href: "/padel", label: "Padel erklärt" },
  { href: "/courts", label: "Courts" },
  { href: "/buchung", label: "Buchung" },
  { href: "/turniere-kurse", label: "Turniere & Kurse" },
] as const;

/** Seiten mit dunklem Vollbild-Hero: Dort ist die Navbar oben transparent */
const PAGES_WITH_HERO = ["/padel", "/courts"];

function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

export default function Navbar() {
  // usePathname: aktueller Pfad, um den aktiven Link zu markieren und zu
  // erkennen, ob wir über einem Hero sind.
  const pathname = usePathname();
  const isPadelPage = pathname === "/padel";

  // useSyncExternalStore: "Wurde gescrollt?" – ohne Effekt + setState.
  // Server-Snapshot false = transparenter Startzustand, kein Hydration-Mismatch.
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 24, () => false);
  const [padelNavVisible, setPadelNavVisible] = useState(false);

  useEffect(() => {
    if (!isPadelPage) return;
    const isInside = (element: Element | null, x: number, y: number) => {
      if (!element) return false;
      const { left, right, top, bottom } = element.getBoundingClientRect();
      return x >= left && x <= right && y >= top && y <= bottom;
    };
    const onPointerMove = (event: PointerEvent) => {
      const insideNav =
        isInside(document.querySelector("[data-padel-navbar]"), event.clientX, event.clientY) ||
        isInside(document.querySelector("[data-chapter-nav]"), event.clientX, event.clientY);
      setPadelNavVisible(insideNav);
    };
    const hideNav = () => setPadelNavVisible(false);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", hideNav);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", hideNav);
    };
  }, [isPadelPage]);

  // useState: Wir speichern, auf WELCHER Seite das Menü geöffnet wurde.
  // Wechselt die Route, passt der Pfad nicht mehr → Menü ist automatisch zu.
  // So schließen wir bei Routenwechsel ohne setState im Effekt.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  // useEffect: Escape-Taste schließt das Menü. Ein globaler Tastatur-Listener
  // ist ein "externes System" – genau dafür sind Effekte gedacht.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenOn(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const overHero = PAGES_WITH_HERO.includes(pathname) && !scrolled && !open;
  const visible = !isPadelPage || padelNavVisible || open;

  return (
    <header
      data-padel-navbar
      data-padel-nav-visible={isPadelPage ? String(visible) : undefined}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color,transform,opacity] duration-300 ${
        overHero
          ? "bg-transparent text-hero-ink"
          : // backdrop-blur: verwischt den Inhalt HINTER der Leiste → Milchglas-Effekt
            "bg-background/80 text-foreground shadow-soft backdrop-blur-xl"
      } ${visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"}`}
    >
      <nav aria-label="Hauptnavigation" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Padel<span className={overHero ? "" : "text-accent"}>Vision</span>
        </Link>

        {/* ===== Desktop-Links ===== */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors hover:bg-current/10 ${
                  active ? "bg-current/10" : "opacity-85"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <ThemeToggle className="ml-2" />
        </div>

        {/* ===== Mobil: Theme + Burger ===== */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpenOn(open ? null : pathname)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            className="grid size-11 place-items-center rounded-full border border-current/20"
          >
            {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          </button>
        </div>
      </nav>

      {/* ===== Mobiles Menü =====
          Geschlossen: unsichtbar, nach oben verschoben und "inert"
          (nicht fokussierbar, nicht klickbar). Öffnen animiert nur transform/opacity. */}
      <div
        id="mobile-menu"
        inert={!open}
        className={`absolute inset-x-0 top-16 origin-top border-t border-line bg-background/95 px-5 pb-6 pt-2 text-foreground shadow-lift backdrop-blur-xl transition-[opacity,transform] duration-500 ease-out-soft md:hidden ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <ul className="flex flex-col">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpenOn(null)}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-xl px-3 py-3.5 text-base font-medium ${active ? "text-accent" : ""}`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}