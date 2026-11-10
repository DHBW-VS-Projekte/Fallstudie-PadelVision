/**
 * tones.ts – Farbklassen je Standort (Punkt im Zeitstrahl, Chips)
 * Tailwind erkennt nur Klassen, die im Quelltext VOLLSTÄNDIG ausgeschrieben
 * stehen. Deshalb gibt es hier eine feste Zuordnung statt zusammengebauter
 * Strings wie `bg-${tone}`.
 */
import type { LocationTone } from "@/components/courts/courtsContent";

export const toneDot: Record<LocationTone, string> = {
  accent: "bg-accent",
  "accent-2": "bg-accent-2",
  olive: "bg-olive",
  glass: "bg-glass",
  mesh: "bg-mesh",
};