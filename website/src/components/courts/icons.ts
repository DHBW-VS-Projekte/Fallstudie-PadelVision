/**
 * icons.ts – übersetzt die Ausstattungs-Schlüssel aus courtsContent.ts in lucide-Icons
 * Kein "use client": reine Zuordnung, nutzbar in Server- und Client-Components.
 * Record<AmenityIcon, LucideIcon> erzwingt, dass JEDER Schlüssel ein Icon hat –
 * ein Tippfehler oder fehlender Eintrag wird sofort von TypeScript gemeldet.
 * Verwendet werden nur weit verbreitete Icon-Namen, die in lucide-react 1.x existieren.
 */
import {
  Building2, Car, CircleDot, Coffee, GraduationCap, HeartPulse, Leaf, Repeat, ShoppingBag, ShowerHead,
  Sun, Sunset, Users, UtensilsCrossed, Waves, type LucideIcon,
} from "lucide-react";
import type { AmenityIcon, EventType } from "@/components/courts/courtsContent";

export const amenityIcons: Record<AmenityIcon, LucideIcon> = {
  rental: Repeat,
  ball: CircleDot,
  shower: ShowerHead,
  bistro: Coffee,
  food: UtensilsCrossed,
  terrace: Sun,
  lounge: Waves,
  shop: ShoppingBag,
  academy: GraduationCap,
  physio: HeartPulse,
  yoga: Leaf,
  sunset: Sunset,
  kids: Users,
  parking: Car,
};

/** Icons für Indoor/Outdoor-Darstellungen */
export const courtTypeIcons = { indoor: Building2, outdoor: Sun } as const;

/** Klassen je Event-Typ für die farbigen Badges (Tailwind braucht ausgeschriebene Klassennamen) */
export const eventTypeClasses: Record<EventType, string> = {
  turnier: "bg-accent/15 text-accent",
  kurs: "bg-accent-2/15 text-accent-2",
  community: "bg-olive/15 text-olive",
  camp: "bg-foreground/10 text-foreground",
};