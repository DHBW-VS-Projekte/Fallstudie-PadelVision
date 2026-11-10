/**
 * stats.ts – reine Hilfsfunktionen für Kennzahlen und Events
 *
 * Verwendet von: StatsBand, IndoorOutdoor, LocationGrid, LocationDetail,
 * EventsTimeline, EuropeMap (Tooltip). Kein React → Server und Client.
 *
 * Grundsatz: Gesamtzahlen werden NIE von Hand eingetragen, sondern aus den
 * Standortdaten berechnet. Kommt ein Court oder Event dazu, stimmen alle
 * Zahlen auf der Seite automatisch.
 */
import type { CourtEvent, CourtSplit, Location, LocationTone } from "@/components/courts/courtsContent";

/** Courts eines Standorts insgesamt (Panorama zählt NICHT extra – es ist ein Indoor- oder Outdoor-Court) */
export function courtsOf(split: CourtSplit): number {
  return split.indoor + split.outdoor;
}

export function totalCourts(locations: readonly Location[]): number {
  return locations.reduce((sum, l) => sum + courtsOf(l.courts), 0);
}

export function totalIndoor(locations: readonly Location[]): number {
  return locations.reduce((sum, l) => sum + l.courts.indoor, 0);
}

export function totalOutdoor(locations: readonly Location[]): number {
  return locations.reduce((sum, l) => sum + l.courts.outdoor, 0);
}

/** Anzahl verschiedener Länder (Set entfernt Duplikate, z. B. 2 × Griechenland) */
export function countCountries(locations: readonly Location[]): number {
  return new Set(locations.map((l) => l.country)).size;
}

export function countEvents(locations: readonly Location[]): number {
  return locations.reduce((sum, l) => sum + l.events.length, 0);
}

/** Event plus Infos zum Standort – für den gemeinsamen Zeitstrahl */
export interface EventWithLocation extends CourtEvent {
  locationSlug: string;
  locationCity: string;
  locationTone: LocationTone;
}

/**
 * Alle Events aller Standorte, chronologisch sortiert.
 * ISO-Daten ("2027-03-14") lassen sich direkt als Text vergleichen,
 * weil Jahr, Monat und Tag von groß nach klein und mit führender Null stehen.
 */
export function allEventsSorted(locations: readonly Location[]): EventWithLocation[] {
  return locations
    .flatMap((l) => l.events.map((e) => ({ ...e, locationSlug: l.slug, locationCity: l.city, locationTone: l.tone })))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Nächstes (= frühestes) Event eines Standorts.
 * Bewusst NICHT relativ zu "heute" berechnet: Die Seite wird statisch
 * gebaut; ein Vergleich mit dem Build-Datum würde einfrieren. Da alle
 * Beispiel-Events in der Zukunft liegen, ist "frühestes" = "nächstes".
 */
export function nextEvent(location: Location): CourtEvent | null {
  const sorted = [...location.events].sort((a, b) => a.date.localeCompare(b.date));
  return sorted[0] ?? null;
}

/** "2027-03-14" → "14.03.2027" – ohne Date-Objekt, damit keine Zeitzonen-Fehler entstehen */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/** Kurzform für große Datumsanzeige: { day: "14", month: "Mär", year: "2027" } */
const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
export function dateParts(iso: string): { day: string; month: string; year: string } {
  const [y, m, d] = iso.split("-");
  return { day: d, month: MONTHS[Number(m) - 1] ?? m, year: y };
}

/** "6 Courts · 2 Indoor · 4 Outdoor" (Teile mit 0 werden weggelassen) */
export function courtSummary(split: CourtSplit): string {
  const parts = [`${courtsOf(split)} Courts`];
  if (split.indoor > 0) parts.push(`${split.indoor} Indoor`);
  if (split.outdoor > 0) parts.push(`${split.outdoor} Outdoor`);
  return parts.join(" · ");
}

/** Wenige Plätze (unter 5) sollen hervorgehoben werden */
export const FEW_SPOTS = 5;
export function spotsLabel(spots: number): string {
  if (spots === 0) return "Ausgebucht";
  if (spots < FEW_SPOTS) return `Nur noch ${spots} ${spots === 1 ? "Platz" : "Plätze"}`;
  return `${spots} Plätze frei`;
}

/** Sortiert Standorte von West nach Ost (Tab-Reihenfolge der Karten-Pins) */
export function sortWestToEast(locations: readonly Location[]): Location[] {
  return [...locations].sort((a, b) => a.coords.lon - b.coords.lon);
}

/* =====================================================================
   BEISPIELRECHNUNGEN (mit den Daten aus courtsContent.ts geprüft)
   totalCourts   = 3 + 6 + 3 + 3 + 5 = 20
   totalIndoor   = 2 + 2 + 0 + 1 + 2 = 7
   totalOutdoor  = 1 + 4 + 3 + 2 + 3 = 13
   countCountries = 4 (Deutschland, Spanien, Frankreich, Griechenland)
   countEvents   = 3 + 3 + 3 + 2 + 3 = 14
   allEventsSorted()[0] → "Bodensee Winter Cup" (12.12.2026)
   nextEvent(Porto-Vecchio) → "Corsica Padel Camp" (26.04.2027)
   sortWestToEast → Marbella, Konstanz, Porto-Vecchio, Chania, Santorini
   formatDate("2027-03-14") → "14.03.2027"
   spotsLabel(3) → "Nur noch 3 Plätze", spotsLabel(12) → "12 Plätze frei"
   ===================================================================== */