"use client";
/**
 * MapPin.tsx – ein Standort-Pin auf der 3D-Karte (echter <button>)
 *
 * Client Component: reagiert auf Klick, Tastatur und Hover.
 * Wird ausschließlich von EuropeMap gerendert; Auswahl-Logik und Fokus-
 * steuerung (Pfeiltasten) liegen dort. Der Pin meldet nur Ereignisse.
 *
 * Aufbau:
 * 1. <button> – steht "aufrecht" auf der gekippten Karte (Gegenrotation, CSS .map-pin)
 *    enthält Marker-SVG und Tooltip
 * 2. Bodenschatten + Puls-Ring – liegen FLACH auf der Karte (nicht gegengedreht)
 *    und reagieren über die Tailwind-Variante "peer-*" auf Hover/Fokus des Buttons
 */
import type { KeyboardEvent, Ref } from "react";
import MapTooltip, { type MapTooltipProps } from "@/components/courts/MapTooltip";
import { cssVars } from "@/components/ui/cssVars";

export interface MapPinProps {
  slug: string;
  /** Position des Pin-Fußes in Prozent der Kartenfläche */
  left: number;
  top: number;
  isHeadquarters: boolean;
  selected: boolean;
  /** Roving Tabindex: nur der ausgewählte Pin ist per Tab erreichbar */
  tabbable: boolean;
  /** Tooltip nach Escape ausgeblendet */
  tipHidden: boolean;
  /** Reihenfolge für das gestaffelte "Einfallen" (ms) */
  dropDelay: number;
  ariaLabel: string;
  tooltip: Omit<MapTooltipProps, "id">;
  buttonRef: Ref<HTMLButtonElement>;
  onSelect: (slug: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, slug: string) => void;
  onTipReset: () => void;
}

export default function MapPin({
  slug, left, top, isHeadquarters, selected, tabbable, tipHidden, dropDelay, ariaLabel, tooltip, buttonRef,
  onSelect, onKeyDown, onTipReset,
}: MapPinProps) {
  const tipId = `map-tip-${slug}`;
  const size = isHeadquarters ? "size-12" : "size-10";

  return (
    // display: contents → der Wrapper erzeugt selbst keine Box (stört Layout und
    // 3D-Raum nicht), begrenzt aber die "peer"-Variante auf DIESEN Pin. Ohne ihn
    // würde das Hovern eines Pins auch die Bodenringe aller folgenden Pins vergrößern.
    <div className="contents">
      {/* ===== Pin (aufrecht) ===== */}
      <button
        ref={buttonRef}
        type="button"
        aria-pressed={selected}
        aria-label={ariaLabel}
        aria-describedby={tipId}
        tabIndex={tabbable ? 0 : -1}
        data-tip-hidden={tipHidden ? "" : undefined}
        onClick={() => onSelect(slug)}
        onKeyDown={(e) => onKeyDown(e, slug)}
        onMouseLeave={onTipReset}
        onBlur={onTipReset}
        style={{ left: `${left}%`, top: `${top}%` }}
        className="map-pin peer absolute flex min-h-11 min-w-11 items-end justify-center rounded-full"
      >
        {/* Innerer Wrapper: trägt die "Einfall"-Animation (Verzögerung als CSS-Variable) */}
        <span className="map-pin-drop block" style={cssVars({ "--pin-delay": `${dropDelay}ms` })}>
          <svg
            viewBox="0 0 40 52"
            aria-hidden="true"
            className={`map-pin-marker block drop-shadow-md transition-transform duration-300 ease-out-soft ${size} ${
              selected ? "scale-115" : ""
            }`}
          >
            {/* Tropfenform der Stecknadel */}
            <path d="M20 51 C 20 51 3 31 3 19 A 17 17 0 0 1 37 19 C 37 31 20 51 20 51 Z" className={selected ? "fill-accent" : "fill-accent/90"} />
            <circle cx="20" cy="19" r="10.5" className="fill-card" />
            {/* Mini-Padelball mit Naht */}
            <circle cx="20" cy="19" r="6.5" className={isHeadquarters ? "fill-accent-2" : "fill-olive"} />
            <path d="M14.2 16.5 q 5.8 2.5 0 6" className="fill-none stroke-card" strokeWidth="1.3" />
            <path d="M25.8 16.5 q -5.8 2.5 0 6" className="fill-none stroke-card" strokeWidth="1.3" />
          </svg>
        </span>
        <MapTooltip id={tipId} {...tooltip} />
      </button>

      {/* ===== Boden: Schatten + pulsierender Ring (flach auf der Karte) =====
          peer-hover / peer-focus-visible: reagiert auf den Zustand des Buttons davor. */}
      <span
        aria-hidden="true"
        style={{ left: `${left}%`, top: `${top}%` }}
        className={`map-pin-base pointer-events-none absolute block -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 peer-hover:scale-125 peer-focus-visible:scale-125 ${
          selected ? "scale-125" : ""
        }`}
      >
        <span className={`map-pulse absolute left-1/2 top-1/2 block size-8 rounded-full border-2 ${selected ? "border-accent" : "border-accent-2"}`} />
        <span className="block h-2 w-6 rounded-[50%] bg-hero-shade/35 blur-[2px]" />
      </span>
    </div>
  );
}