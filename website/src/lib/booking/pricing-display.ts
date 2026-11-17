/**
 * pricing-display.ts – Preise NUR ANZEIGEN (verbindlich rechnet immer PHP)
 *
 * Die Preisregeln werden als Parameter übergeben (aus catalog.json), damit die
 * Funktionen ohne JSON-Import testbar sind.
 * SHOW_PRICES = false blendet alle Preise im Frontend mit einer Zeile aus.
 */
import type { CatalogCourt, CatalogLocation, PriceParts, PricingRules } from "@/lib/booking/types";

export const SHOW_PRICES = true;

/** Grundpreis eines Courts ohne Prime Time und Extras */
export function courtBaseCents(court: CatalogCourt, pricing: PricingRules): number {
  return (court.kind === "indoor" ? pricing.indoorCents : pricing.outdoorCents) + (court.panorama ? pricing.panoramaCents : 0);
}

/** "ab X €" für eine Standortkarte */
export function locationFromCents(location: CatalogLocation, pricing: PricingRules): number {
  return Math.min(...location.courts.map((c) => courtBaseCents(c, pricing)));
}

/** Vorschau der Aufschlüsselung (ob Prime Time gilt, sagt der Server pro Slot) */
export function estimateParts(court: CatalogCourt, prime: boolean, rackets: number, balls: number, pricing: PricingRules): PriceParts {
  const baseCents = court.kind === "indoor" ? pricing.indoorCents : pricing.outdoorCents;
  const panoramaCents = court.panorama ? pricing.panoramaCents : 0;
  const primeCents = prime ? pricing.primeTimeCents : 0;
  const racketsCents = rackets * pricing.racketCents;
  const ballsCents = balls * pricing.ballsCents;
  return { baseCents, panoramaCents, primeCents, racketsCents, ballsCents, totalCents: baseCents + panoramaCents + primeCents + racketsCents + ballsCents };
}