/**
 * catalog.ts – typisierter Zugriff auf src/data/catalog.json
 *
 * catalog.json ist die EINZIGE Quelle der Wahrheit für Standorte, Courts,
 * Öffnungszeiten, Preise und Regeln. PHP liest eine Kopie (api/data/), das
 * Seed-Skript erzeugt daraus die Datenbank-Einträge.
 * Die Typzuweisung ist nötig, weil TypeScript JSON-Texte nicht als
 * Union-Typen ("indoor" | "outdoor") erkennt. Den Aufbau prüft tests/booking.test.mjs.
 */
import raw from "@/data/catalog.json";
import type { Catalog, CatalogCourt, CatalogLocation } from "@/lib/booking/types";

export const catalog = raw as Catalog;

export function findLocation(slug: string | null | undefined): CatalogLocation | undefined {
  return slug ? catalog.locations.find((l) => l.slug === slug) : undefined;
}

export function findCourt(courtId: string | null | undefined): { court: CatalogCourt; location: CatalogLocation } | undefined {
  if (!courtId) return undefined;
  for (const location of catalog.locations) {
    const court = location.courts.find((c) => c.id === courtId);
    if (court) return { court, location };
  }
  return undefined;
}