"use client";
/**
 * LocationChips.tsx – Auswahl-Leiste mit Flagge + Stadt
 * Dieselbe Auswahl wie die Karten-Pins, nur in anderer Form. Auf kleinen
 * Bildschirmen ist sie die wichtigste Bedienung (Pins sind dort klein).
 * Client Component, weil sie Klicks an CourtsExplorer meldet.
 */
import type { Location } from "@/components/courts/courtsContent";
import { toneDot } from "@/components/courts/tones";

export interface LocationChipsProps {
  locations: Location[];
  selected: string;
  onSelect: (slug: string) => void;
}

export default function LocationChips({ locations, selected, onSelect }: LocationChipsProps) {
  return (
    // Mobil horizontal scrollbar (no-scrollbar blendet den Balken aus); -mx/px lassen
    // die Leiste bis an den Rand laufen, ohne dass die Seite horizontal scrollt.
    <div role="group" aria-label="Standort auswählen" className="no-scrollbar -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {locations.map((l) => {
        const active = l.slug === selected;
        return (
          <button
            key={l.slug}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(l.slug)}
            className={`inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
              active ? "border-brand-green bg-brand-green text-white shadow-soft" : "border-line bg-card hover:border-brand-green"
            }`}
          >
            <span aria-hidden="true">{l.flag}</span>
            {l.city}
            {!active && <span aria-hidden="true" className={`size-1.5 rounded-full ${toneDot[l.tone]}`} />}
          </button>
        );
      })}
    </div>
  );
}