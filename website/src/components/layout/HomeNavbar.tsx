"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoMark from "@/components/layout/LogoMark";
import PadelEntryLink from "@/components/layout/PadelEntryLink";

const links = [
  { href: "/", label: "Home" },
  { href: "/courts", label: "Courts" },
  { href: "/padel", label: "Padel entdecken" },
  { href: "/community", label: "Community" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
] as const;

export default function HomeNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="pv">
      <header className="pv-header">
        <div className="pv-container pv-header-inner">
          <Link className="pv-logo" href="/" aria-label="PadelVision Startseite">
            <LogoMark />
            <span>
              PADELVISION<small>SPORT. COMMUNITY. PADEL.</small>
            </span>
          </Link>
          <nav
            id="primary-navigation"
            className={`pv-nav ${menuOpen ? "pv-nav-open" : ""}`}
            aria-label="Hauptnavigation"
          >
            {links.map((link) => {
              const active = pathname === link.href;
              const className = active ? "pv-current" : undefined;
              if (link.href === "/padel") {
                return (
                  <PadelEntryLink
                    key={link.href}
                    aria-current={active ? "page" : undefined}
                    className={className}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </PadelEntryLink>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={className}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <Link className="pv-btn pv-btn-dark pv-nav-cta" href="/booking">
            Court buchen <span aria-hidden="true">↗</span>
          </Link>
          <button
            className="pv-menu-toggle"
            type="button"
            aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>
    </div>
  );
}