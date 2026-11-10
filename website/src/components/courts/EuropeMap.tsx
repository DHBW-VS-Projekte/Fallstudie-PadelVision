"use client";
/**
 * EuropeMap.tsx – die interaktive, leicht dreidimensionale Europakarte
 *
 * Client Component, weil sie
 *  - die Maus-Parallaxe (Pointer-Events) steuert,
 *  - beim Sichtbarwerden die Einblend-Animation auslöst,
 *  - Tastatur (Pfeiltasten, Escape) und Fokus der Pins verwaltet.
 * Die ausgewählte Location kommt als Prop von CourtsExplorer (eine Quelle der Wahrheit).
 * Meer und Länder (MapLand, Server) werden fertig gerendert als `land` hineingereicht.
 *
 * ===== So entsteht der 3D-Effekt (CSS in globals.css) =====
 * .map-stage:  perspective: 1400px → legt fest, wie weit der "Betrachter" entfernt ist.
 *              Ohne perspective sähe eine Drehung um X nur gestaucht aus, nicht räumlich.
 * .map-plane:  rotateX(28deg) kippt die Karte nach hinten (wie ein Modell auf dem Tisch),
 *              rotateZ(-2deg) dreht sie leicht. transform-style: preserve-3d sorgt dafür,
 *              dass Kinder (die Pins) im selben 3D-Raum bleiben, statt flach gedrückt zu werden.
 * .map-pin:    rotateX(-28deg) dreht jeden Pin genau zurück → er "steht" aufrecht auf der Karte.
 */
import { useCallback, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import MapPin from "@/components/courts/MapPin";
import { useRevealRef } from "@/components/ui/Reveal";
import { cssVars } from "@/components/ui/cssVars";
import type { Location } from "@/components/courts/courtsContent";
import { MAP_HEIGHT, MAP_WIDTH, arcPath, project, toPercent, tooltipAlign } from "@/components/courts/geo";
import { courtSummary, courtsOf, formatDate, nextEvent, sortWestToEast } from "@/components/courts/stats";

export interface EuropeMapProps {
  locations: Location[];
  selected: string;
  onSelect: (slug: string) => void;
  /** Server-gerendertes SVG mit Meer und Landflächen (MapLand) */
  land: ReactNode;
}

/** Maximale Neigung der Parallaxe in Grad (±4°) */
const MAX_TILT = 4;

export default function EuropeMap({ locations, selected, onSelect, land }: EuropeMapProps) {
  // Reihenfolge West → Ost: bestimmt DOM-Reihenfolge und Pfeiltasten-Logik
  const ordered = sortWestToEast(locations);
  const hq = locations.find((l) => l.isHeadquarters) ?? locations[0];
  const hqPoint = project(hq.coords.lat, hq.coords.lon);

  // useState: Bei welchem Pin wurde der Tooltip per Escape ausgeblendet?
  // Ohne diesen Zustand gäbe es keinen Weg, eine Hover-/Fokus-Vorschau zu schließen.
  const [tipHidden, setTipHidden] = useState<string | null>(null);

  // useRef: Liste der Pin-Buttons, um nach einer Pfeiltaste den Fokus zu verschieben.
  // Wird nur in Event-Handlern gelesen, nie beim Rendern (React-Hooks-Regel).
  const pinRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Wiederverwendet aus Reveal.tsx: setzt data-visible, sobald die Karte sichtbar ist.
  const revealRef = useRevealRef();

  /**
   * Callback-Ref für die Bühne: kombiniert Reveal-Beobachtung und Maus-Parallaxe.
   * Die Parallaxe schreibt zwei CSS-Variablen (--tilt-x, --tilt-y) direkt an die
   * Kartenebene – KEIN React-State, sonst würde bei jeder Mausbewegung neu gerendert.
   * requestAnimationFrame drosselt auf höchstens eine Aktualisierung pro Bildschirmbild.
   */
  const stageRef = useCallback(
    (stage: HTMLDivElement | null) => {
      if (!stage) return;
      const cleanupReveal = revealRef(stage);

      // Nur mit echter Maus (hover + feiner Zeiger) und ohne Wunsch nach reduzierter Bewegung
      const allowParallax = window.matchMedia(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      ).matches;
      const plane = stage.querySelector<HTMLElement>("[data-map-plane]");
      if (!allowParallax || !plane) return cleanupReveal;

      let frame = 0;
      let tiltX = 0;
      let tiltY = 0;
      const apply = () => {
        frame = 0;
        plane.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
        plane.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
      };
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(apply);
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const rect = stage.getBoundingClientRect();
        // -0,5 … +0,5 relativ zur Bühnenmitte
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        tiltY = px * 2 * MAX_TILT; // Maus rechts → Karte dreht sich nach rechts
        tiltX = -py * 2 * MAX_TILT; // Maus oben → oberer Rand kommt näher
        schedule();
      };
      // Maus verlässt die Karte → zurück auf 0; die CSS-Transition lässt sie weich zurückfedern
      const onLeave = () => {
        tiltX = 0;
        tiltY = 0;
        schedule();
      };
      stage.addEventListener("pointermove", onMove, { passive: true });
      stage.addEventListener("pointerleave", onLeave);
      return () => {
        stage.removeEventListener("pointermove", onMove);
        stage.removeEventListener("pointerleave", onLeave);
        cancelAnimationFrame(frame);
        cleanupReveal?.();
      };
    },
    [revealRef],
  );

  /** Pfeiltasten/Pos1/Ende wechseln den Standort (Roving Tabindex), Escape schließt den Tooltip */
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, slug: string) {
    if (event.key === "Escape") {
      setTipHidden(slug);
      return;
    }
    const index = ordered.findIndex((l) => l.slug === slug);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % ordered.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + ordered.length) % ordered.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = ordered.length - 1;
    else return;
    event.preventDefault();
    onSelect(ordered[next].slug);
    pinRefs.current[next]?.focus();
  }

  // Ist kein bekannter Standort ausgewählt, bleibt der erste Pin tabbable
  const selectedExists = ordered.some((l) => l.slug === selected);

  return (
    <div ref={stageRef} data-map className="map-stage relative w-full px-1 pb-8 pt-12 sm:pt-16">
      <div data-map-plane className="map-plane relative w-full" style={{ aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}` }}>
        {/* Weicher Schatten unter der gesamten Karte */}
        <div aria-hidden="true" className="absolute inset-x-[6%] -bottom-6 h-12 rounded-full bg-hero-shade/30 blur-2xl" />

        {land}

        {/* ===== Verbindungsbögen + Führungslinien ===== */}
        <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} aria-hidden="true" focusable="false" className="pointer-events-none absolute inset-0 size-full">
          <defs>
            {ordered
              .filter((l) => !l.isHeadquarters)
              .map((l) => (
                // Masken-Technik wie auf /padel (ServeDiagram): Der sichtbare Bogen ist
                // gestrichelt; eine durchgehende Maskenlinie "zeichnet" sich und gibt ihn frei.
                // pathLength="1" normiert die Länge, damit stroke-dashoffset 1 → 0 reicht.
                <mask key={l.slug} id={`arc-mask-${l.slug}`} maskUnits="userSpaceOnUse">
                  <path
                    d={arcPath(hqPoint, project(l.coords.lat, l.coords.lon))}
                    pathLength={1}
                    fill="none"
                    stroke="white"
                    strokeWidth="12"
                    className="map-arc-mask"
                    style={cssVars({ "--draw-delay": `${700 + ordered.indexOf(l) * 150}ms` })}
                  />
                </mask>
              ))}
          </defs>
          {ordered
            .filter((l) => !l.isHeadquarters)
            .map((l) => {
              const active = l.slug === selected;
              return (
                <path
                  key={l.slug}
                  d={arcPath(hqPoint, project(l.coords.lat, l.coords.lon))}
                  fill="none"
                  mask={`url(#arc-mask-${l.slug})`}
                  strokeDasharray="7 7"
                  strokeLinecap="round"
                  strokeWidth={active ? 3.5 : 2}
                  className={`transition-[stroke,stroke-width] duration-500 ${active ? "stroke-accent" : "stroke-accent-2/55"}`}
                />
              );
            })}
          {/* Führungslinien für versetzte Pins (Santorini/Chania liegen zu nah beieinander) */}
          {ordered
            .filter((l) => l.pinOffset)
            .map((l) => {
              const p = project(l.coords.lat, l.coords.lon);
              const dx = l.pinOffset?.dx ?? 0;
              const dy = l.pinOffset?.dy ?? 0;
              return (
                <g key={`leader-${l.slug}`}>
                  <line x1={p.x} y1={p.y} x2={p.x + dx} y2={p.y + dy} className="stroke-foreground/45" strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle cx={p.x} cy={p.y} r="4" className="fill-accent" />
                </g>
              );
            })}
        </svg>

        {/* ===== Pins (echte Buttons) – Reihenfolge West → Ost ===== */}
        <div className="map-pins absolute inset-0">
          {ordered.map((l, i) => {
            const p = project(l.coords.lat, l.coords.lon);
            const pos = toPercent({ x: p.x + (l.pinOffset?.dx ?? 0), y: p.y + (l.pinOffset?.dy ?? 0) });
            const upcoming = nextEvent(l);
            const isSelected = l.slug === selected;
            return (
              <MapPin
                key={l.slug}
                slug={l.slug}
                left={pos.left}
                top={pos.top}
                isHeadquarters={l.isHeadquarters}
                selected={isSelected}
                tabbable={selectedExists ? isSelected : i === 0}
                tipHidden={tipHidden === l.slug}
                dropDelay={i * 120}
                ariaLabel={`${l.city}, ${l.country} – ${courtsOf(l.courts)} Courts. Details anzeigen.`}
                tooltip={{
                  name: l.name,
                  flag: l.flag,
                  country: l.country,
                  badge: l.badge,
                  courtSummary: courtSummary(l.courts),
                  nextEvent: upcoming ? `${upcoming.title} · ${formatDate(upcoming.date)}` : null,
                  align: tooltipAlign(pos.left),
                }}
                buttonRef={(el) => {
                  pinRefs.current[i] = el;
                }}
                onSelect={onSelect}
                onKeyDown={handleKeyDown}
                onTipReset={() => setTipHidden(null)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}