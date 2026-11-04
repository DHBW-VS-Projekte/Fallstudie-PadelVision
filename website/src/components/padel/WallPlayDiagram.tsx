"use client";
/**
 * WallPlayDiagram.tsx – Seitenansicht: Aufspringen → Glaswand → Rückspiel
 * Client Component nur wegen des "Abspielen"-Buttons.
 * Trick zum Wiederholen: Wir ändern den `key` des SVG-Inhalts. React
 * erzeugt die Elemente dann neu, und die CSS-Animationen starten von vorn.
 */
import { useState } from "react";
import { Play } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { cssVars } from "@/components/ui/cssVars";

const PATH = "M 130 145 C 320 100 480 170 610 345 C 700 245 810 200 885 220 C 825 285 710 315 560 280 C 445 252 350 248 260 270";
const STATIONS = [
  { x: 610, y: 345, n: 1, label: "Boden", delay: "0.6s" },
  { x: 885, y: 220, n: 2, label: "Glas", delay: "1.1s" },
  { x: 300, y: 270, n: 3, label: "Rückspiel", delay: "1.6s" },
];

export default function WallPlayDiagram({ steps }: { steps: string[] }) {
  // useState: Zähler, der bei jedem Klick hochgeht → neuer key → Animation startet neu.
  const [run, setRun] = useState(0);

  return (
    <Reveal className="interactive-card overflow-hidden rounded-3xl border border-line bg-card p-4 shadow-soft sm:p-6">
      <div className="overflow-hidden rounded-2xl bg-surface">
        <svg key={run} viewBox="0 0 1000 470" role="img" aria-labelledby="wall-title" className="h-auto w-full">
          <title id="wall-title">Seitenansicht: Der Ball springt zuerst auf dem Court-Boden auf, prallt von der Glaswand zurück und wird gespielt</title>
          <defs>
            <linearGradient id="court-floor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--court)" />
              <stop offset="1" stopColor="var(--accent-2)" />
            </linearGradient>
            <linearGradient id="glass-wall" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="var(--glass)" stopOpacity="0.12" />
              <stop offset="1" stopColor="var(--glass)" stopOpacity="0.65" />
            </linearGradient>
            <pattern id="wall-grid" width="18" height="18" patternUnits="userSpaceOnUse">
              <path d="M 18 0 L 0 0 0 18" fill="none" className="stroke-foreground/10" strokeWidth="1" />
            </pattern>
          </defs>

          <rect x="60" y="60" width="880" height="310" rx="18" className="fill-card" />
          <path d="M 75 370 L 925 370 L 955 415 L 45 415 Z" fill="url(#court-floor)" />
          <path d="M 75 370 L 925 370" className="stroke-court-line" strokeWidth="5" />
          <path d="M 95 390 L 905 390" className="stroke-court-line/35" strokeWidth="2" strokeDasharray="9 12" />

          {/* Glasfläche und Rahmen geben der Seitenansicht räumliche Tiefe. */}
          <rect x="875" y="78" width="48" height="292" rx="5" fill="url(#glass-wall)" className="stroke-glass" strokeWidth="4" />
          <path d="M 875 100 L 923 100 M 875 348 L 923 348" className="stroke-glass" strokeWidth="3" />
          <rect x="78" y="78" width="797" height="292" fill="url(#wall-grid)" />
          <text x="900" y="58" textAnchor="middle" className="fill-muted text-[21px] font-semibold">GLASWAND</text>

          {/* Der Ball nimmt den Weg: Boden → Glas → zurück zum Spieler. */}
          <path d={PATH} fill="none" className="stroke-accent-2/30" strokeWidth="16" strokeLinecap="round" />
          <path d={PATH} pathLength={1} fill="none" className="draw-line stroke-accent" strokeWidth="6" strokeLinecap="round" style={cssVars({ "--draw-delay": "0.1s" })} />
          <circle cx="610" cy="345" r="18" className="fill-accent/15" />
          <circle cx="885" cy="220" r="18" className="fill-accent/15" />

          {/* Spieler mit Schläger – als klare Silhouette statt abstrakter Punkte. */}
          <g className="stroke-foreground/75" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <circle cx="205" cy="231" r="17" className="fill-foreground/75 stroke-none" />
            <path d="M 205 250 L 220 304 L 195 350 M 218 302 L 245 348 M 212 270 L 172 294 M 212 270 L 251 248" />
            <path d="M 251 248 L 270 229" strokeWidth="5" />
            <ellipse cx="277" cy="222" rx="8" ry="17" transform="rotate(35 277 222)" strokeWidth="4" />
          </g>

          {/* Nummerierte Stationen verbinden die Erklärung mit den echten Kontaktpunkten. */}
          {STATIONS.map((station) => (
            <g key={station.n} className="pop-in" style={cssVars({ "--pop-delay": station.delay })}>
              <circle cx={station.x} cy={station.y} r="17" className="fill-accent-2" />
              <text x={station.x} y={station.y + 7} textAnchor="middle" className="fill-background text-[20px] font-bold">{station.n}</text>
              <text
                x={station.x}
                y={station.n === 1 ? 325 : station.n === 2 ? 185 : 302}
                textAnchor="middle"
                className="fill-foreground text-[17px] font-semibold"
              >
                {station.label}
              </text>
            </g>
          ))}
          <circle r="8" className="fill-hero-ink">
            <animateMotion
              key={run}
              dur="4.8s"
              begin="0.35s"
              fill="freeze"
              path={PATH}
            />
          </circle>
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <ol className="space-y-1 text-sm text-muted">
          {steps.map((step, i) => (
            <li key={step}><span className="font-semibold text-accent-2">{i + 1}.</span> {step}</li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium hover:border-accent"
        >
          <Play aria-hidden="true" className="size-4" /> Abspielen
        </button>
      </div>
    </Reveal>
  );
}