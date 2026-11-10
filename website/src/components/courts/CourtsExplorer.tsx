"use client";
/**
 * CourtsExplorer.tsx – verbindet Karte, Standort-Chips und Detail-Panel
 *
 * Client Component: Hier liegt der EINZIGE Auswahl-State der Seite
 * (welcher Standort ist gewählt?). Karte, Chips und Panel lesen ihn alle
 * von hier – so können sie nie auseinanderlaufen.
 *
 * Server-Inhalte kommen als Props herein:
 *  - `land`: das fertige SVG von Meer und Ländern (MapLand)
 *  - `details`: die fünf fertig gerenderten Detail-Panels (LocationDetail)
 * Beides sind React-Elemente – serialisierbar, also erlaubt. Funktionen
 * werden NICHT vom Server übergeben.
 *
 * Bewusst KEINE Synchronisierung mit der URL (?standort=…): Dafür bräuchte
 * man useSearchParams, und Next.js verlangt dann eine Suspense-Grenze um
 * die Komponente. Für eine Präsentationsseite lohnt sich der Aufwand nicht.
 */
import { useEffect, useState, type ReactNode } from "react";
import EuropeMap from "@/components/courts/EuropeMap";
import LocationChips from "@/components/courts/LocationChips";
import { DEFAULT_SLUG, SELECT_LOCATION_EVENT, mapSection, type Location } from "@/components/courts/courtsContent";

export interface CourtsExplorerProps {
  locations: Location[];
  land: ReactNode;
  details: Record<string, ReactNode>;
}

export default function CourtsExplorer({ locations, land, details }: CourtsExplorerProps) {
  // useState: der ausgewählte Standort (Slug). Startwert = Stammhaus Konstanz,
  // damit das Panel nie leer ist – auch nicht beim Server-Rendering.
  const [selected, setSelected] = useState<string>(DEFAULT_SLUG);

  // useEffect: hört auf das Browser-Ereignis aus dem Standort-Raster
  // ("Auf der Karte zeigen"). Ein globaler Listener ist ein externes System –
  // genau dafür sind Effekte gedacht. setSelected läuft im Listener, nicht
  // direkt im Effekt (erfüllt die Regel react-hooks/set-state-in-effect).
  useEffect(() => {
    const onSelectEvent = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const slug: unknown = event.detail;
      if (typeof slug === "string" && locations.some((l) => l.slug === slug)) setSelected(slug);
    };
    window.addEventListener(SELECT_LOCATION_EVENT, onSelectEvent);
    return () => window.removeEventListener(SELECT_LOCATION_EVENT, onSelectEvent);
  }, [locations]);

  return (
    // Desktop: Karte links (~60 %), Panel rechts (~40 %) und "sticky". Mobil: untereinander.
    <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:items-start">
      <div className="min-w-0">
        <LocationChips locations={locations} selected={selected} onSelect={setSelected} />
        <EuropeMap locations={locations} selected={selected} onSelect={setSelected} land={land} />

        {/* ===== Legende ===== */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
          <span className="inline-flex items-center gap-2">
            <svg viewBox="0 0 40 52" aria-hidden="true" className="h-6 w-5"><path d="M20 51 C 20 51 3 31 3 19 A 17 17 0 0 1 37 19 C 37 31 20 51 20 51 Z" className="fill-accent" /><circle cx="20" cy="19" r="7" className="fill-accent-2" /></svg>
            {mapSection.legendHq}
          </span>
          <span className="inline-flex items-center gap-2">
            <svg viewBox="0 0 40 52" aria-hidden="true" className="h-5 w-4"><path d="M20 51 C 20 51 3 31 3 19 A 17 17 0 0 1 37 19 C 37 31 20 51 20 51 Z" className="fill-accent/90" /><circle cx="20" cy="19" r="7" className="fill-olive" /></svg>
            {mapSection.legendLocation}
          </span>
          <span className="inline-flex items-center gap-2">
            <svg viewBox="0 0 32 8" aria-hidden="true" className="h-2 w-8"><line x1="1" y1="4" x2="31" y2="4" className="stroke-accent-2" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" /></svg>
            {mapSection.legendArc}
          </span>
        </div>
        <p className="mt-3 text-xs text-muted">{mapSection.disclaimer}</p>
      </div>

      {/* ===== Detail-Panel =====
          Alle fünf Panels sind im HTML (Server-gerendert), nur das gewählte ist
          sichtbar. Wird ein Panel sichtbar, startet die CSS-Animation .detail-in
          neu (Crossfade + leichtes Hochgleiten). aria-live meldet den Wechsel. */}
      <div aria-live="polite" className="lg:sticky lg:top-24">
        {locations.map((l) => (
          <div key={l.slug} hidden={l.slug !== selected} className="detail-in">
            {details[l.slug]}
          </div>
        ))}
      </div>
    </div>
  );
}