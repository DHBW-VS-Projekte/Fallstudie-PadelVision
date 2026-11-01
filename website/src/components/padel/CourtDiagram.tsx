"use client";
/**
 * CourtDiagram.tsx – interaktive, maßstabsgetreue Draufsicht des Padel-Courts
 * Client Component: Hover/Fokus/Klick heben Bereiche hervor (Zustand nötig).
 *
 * Maßstab: 1 Einheit in der viewBox = 1 cm. Spielfeld = 2000 × 1000
 * (20 × 10 m). Die viewBox hat rundum 140 Einheiten Rand für Wände und Beschriftungen.
 * Bedienung vollständig über die Legenden-Buttons möglich (Tastatur!);
 * die SVG-Flächen sind zusätzlich mit der Maus klickbar.
 */
import { useState } from "react";
import { ArrowDownLeft, ArrowLeftRight, Grid2X2, Grid3X3, MoveDiagonal, Network } from "lucide-react";
import { courtAreas, type CourtAreaId } from "@/components/padel/padelContent";

const AREA_ICONS = {
  aufschlagfeld: Grid2X2,
  aufschlaglinie: MoveDiagonal,
  mittellinie: ArrowLeftRight,
  netz: Network,
  glaswand: Grid3X3,
  gitter: ArrowDownLeft,
} satisfies Record<CourtAreaId, typeof Grid2X2>;

// Wichtige Maße in cm
const LENGTH = 2000;
const WIDTH = 1000;
const NET_X = LENGTH / 2;
const SERVICE = 695; // Aufschlaglinie 6,95 m vom Netz
const LEFT_SERVICE_X = NET_X - SERVICE; // 305
const RIGHT_SERVICE_X = NET_X + SERVICE; // 1695
const CENTER_OVERHANG = 20; // Mittellinie ragt ca. 20 cm über die Aufschlaglinie
const GLASS_SIDE = 400; // vereinfachte Darstellung: 4 m Glas an jeder Seitenecke

export default function CourtDiagram() {
  // useState: per Klick/Button fest ausgewählter Bereich
  const [selected, setSelected] = useState<CourtAreaId>("aufschlagfeld");
  // useState: Bereich unter der Maus (Vorschau). Hat Vorrang vor `selected`.
  const [hovered, setHovered] = useState<CourtAreaId | null>(null);
  const active = hovered ?? selected;
  const activeArea = courtAreas.find((a) => a.id === active) ?? courtAreas[0];

  /** Klassen für ein SVG-Element: aktiver Bereich voll, andere abgedimmt */
  const dim = (id: CourtAreaId) =>
    `cursor-pointer transition-opacity duration-300 ${active === id ? "opacity-100" : "opacity-30"}`;
  /** Maus-Events für einen Bereich */
  const handlers = (id: CourtAreaId) => ({
    onMouseEnter: () => setHovered(id),
    onMouseLeave: () => setHovered(null),
    onClick: () => setSelected(id),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <figure className="interactive-card rounded-3xl border border-line bg-card p-4 shadow-soft sm:p-6">
        <svg
          viewBox={`-140 -140 ${LENGTH + 280} ${WIDTH + 280}`}
          role="img"
          aria-labelledby="court-svg-title"
          className="h-auto w-full"
        >
          <title id="court-svg-title">
            Draufsicht eines Padel-Courts: 20 mal 10 Meter, Netz in der Mitte, Aufschlaglinien 6,95 Meter vom Netz, Glaswände und Gitter
          </title>

          {/* ===== Spielfläche ===== */}
          <rect x="0" y="0" width={LENGTH} height={WIDTH} className="fill-court" />

          {/* ===== Aufschlagfelder (4 Stück) ===== */}
          <g className={dim("aufschlagfeld")} {...handlers("aufschlagfeld")}>
            {[LEFT_SERVICE_X, NET_X].map((x) =>
              [0, WIDTH / 2].map((y) => (
                <rect key={`${x}-${y}`} x={x} y={y} width={SERVICE} height={WIDTH / 2} className="fill-accent-2/45" />
              )),
            )}
          </g>

          {/* ===== Aufschlaglinien ===== */}
          <g className={dim("aufschlaglinie")} {...handlers("aufschlaglinie")}>
            {[LEFT_SERVICE_X, RIGHT_SERVICE_X].map((x) => (
              <line key={x} x1={x} y1="0" x2={x} y2={WIDTH} className="stroke-court-line" strokeWidth="10" />
            ))}
          </g>

          {/* ===== Mittellinie ===== */}
          <g className={dim("mittellinie")} {...handlers("mittellinie")}>
            <line x1={LEFT_SERVICE_X - CENTER_OVERHANG} y1={WIDTH / 2} x2={RIGHT_SERVICE_X + CENTER_OVERHANG} y2={WIDTH / 2} className="stroke-court-line" strokeWidth="10" />
          </g>

          {/* ===== Netz ===== */}
          <g className={dim("netz")} {...handlers("netz")}>
            <line x1={NET_X} y1="-20" x2={NET_X} y2={WIDTH + 20} className="stroke-foreground" strokeWidth="16" strokeDasharray="20 10" />
          </g>

          {/* ===== Glaswände: Rückwände komplett + Seitenecken (vereinfacht) ===== */}
          <g className={dim("glaswand")} {...handlers("glaswand")}>
            <rect x="-40" y="-40" width="40" height={WIDTH + 80} className="fill-glass" />
            <rect x={LENGTH} y="-40" width="40" height={WIDTH + 80} className="fill-glass" />
            {[0, LENGTH - GLASS_SIDE].map((x) =>
              [-40, WIDTH].map((y) => <rect key={`${x}-${y}`} x={x} y={y} width={GLASS_SIDE} height="40" className="fill-glass" />),
            )}
          </g>

          {/* ===== Gitter: mittlerer Teil der Seitenwände (vereinfacht) ===== */}
          <g className={dim("gitter")} {...handlers("gitter")}>
            {[-40, WIDTH].map((y) => (
              <rect key={y} x={GLASS_SIDE} y={y} width={LENGTH - 2 * GLASS_SIDE} height="40" className="fill-mesh" strokeDasharray="8 8" />
            ))}
          </g>

          {/* ===== Maßangaben ===== */}
          <g className="fill-muted text-[52px] font-medium">
            <text x={NET_X} y={-75} textAnchor="middle">20 m</text>
            <text x={-75} y={WIDTH / 2} textAnchor="middle" transform={`rotate(-90 -75 ${WIDTH / 2})`}>10 m</text>
            <text x={(LEFT_SERVICE_X + NET_X) / 2} y={WIDTH + 110} textAnchor="middle">6,95 m</text>
            <text x={(RIGHT_SERVICE_X + NET_X) / 2} y={WIDTH + 110} textAnchor="middle">6,95 m</text>
          </g>
        </svg>
        <figcaption className="mt-3 text-xs text-muted">
          Maßstabsgetreue Draufsicht. Aufteilung der Seitenwände in Glas und Gitter: vereinfachte Darstellung – das FIP-Regelwerk erlaubt mehrere Varianten.
        </figcaption>
      </figure>

      <div>
        {/* ===== Legende als echte Buttons (Tastaturbedienung) ===== */}
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Bereiche des Courts">
          {courtAreas.map((area) => {
            const Icon = AREA_ICONS[area.id];
            const isSelected = selected === area.id;
            return (
              <button
                key={area.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelected(area.id)}
                onMouseEnter={() => setHovered(area.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(area.id)}
                onBlur={() => setHovered(null)}
                className={`interactive-card group flex min-h-14 items-center gap-3 rounded-2xl border px-3 py-2 text-left text-sm font-medium ${
                  isSelected ? "border-accent bg-accent text-on-accent" : "border-line bg-card hover:text-foreground"
                }`}
              >
                <Icon aria-hidden="true" className={`size-5 shrink-0 ${isSelected ? "" : "text-accent-2"}`} />
                {area.label}
              </button>
            );
          })}
        </div>

        {/* ===== Infopanel: aria-live liest Änderungen höflich vor ===== */}
        <div aria-live="polite" className="interactive-card mt-6 rounded-3xl border border-line bg-card p-7 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-2">Court-Detail</p>
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted">
              {String(courtAreas.findIndex((area) => area.id === active) + 1).padStart(2, "0")} / {String(courtAreas.length).padStart(2, "0")}
            </span>
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">{activeArea.label}</h3>
          <p className="mt-2 leading-relaxed text-muted">{activeArea.text}</p>
          <div className="mt-6 flex items-center gap-4 rounded-2xl bg-surface p-4">
            <span className="size-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            <div>
              <p className="text-lg font-semibold tracking-tight">{activeArea.factValue}</p>
              <p className="text-sm text-muted">{activeArea.factLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}