/**
 * ServeDiagram.tsx – animierte Flugbahn des Aufschlags (Draufsicht)
 * Server Component! Die Animation ist reines CSS (.draw-line, .pop-in in
 * globals.css). Sie startet, sobald der umgebende <Reveal> sichtbar wird.
 *
 * Warum eine Maske? Die Flugbahn soll GESTRICHELT sein. stroke-dasharray
 * wird aber auch für den "Zeichnen"-Trick gebraucht – beides gleichzeitig
 * geht an einem Pfad nicht. Lösung: Der sichtbare Pfad ist gestrichelt,
 * und eine Maske (durchgehender Pfad, der sich zeichnet) gibt ihn
 * Stück für Stück frei. In Masken bedeutet weiß = sichtbar.
 */
import Reveal from "@/components/ui/Reveal";
import { cssVars } from "@/components/ui/cssVars";

const PATH = "M 1850 790 Q 1150 -120 520 260";

export default function ServeDiagram() {
  return (
    <Reveal className="interactive-card rounded-3xl border border-line bg-card p-4 shadow-soft sm:p-6">
      <svg viewBox="-60 -60 2120 1120" role="img" aria-labelledby="serve-title" className="h-auto w-full">
        <title id="serve-title">Aufschlag: Der Ball wird von hinter der Aufschlaglinie diagonal ins gegenüberliegende Aufschlagfeld gespielt</title>
        <defs>
          <mask id="serve-mask">
            <path d={PATH} pathLength={1} fill="none" stroke="white" strokeWidth="40" className="draw-line" />
          </mask>
        </defs>

        {/* Court vereinfacht: Fläche, Netz, Aufschlaglinien, Mittellinie */}
        <rect width="2000" height="1000" className="fill-court" />
        <rect x="305" y="0" width="695" height="500" className="fill-accent/35 pop-in" style={cssVars({ "--pop-delay": "1.5s" })} />
        <g className="stroke-court-line" strokeWidth="8">
          <line x1="305" y1="0" x2="305" y2="1000" />
          <line x1="1695" y1="0" x2="1695" y2="1000" />
          <line x1="285" y1="500" x2="1715" y2="500" />
        </g>
        <line x1="1000" y1="-20" x2="1000" y2="1020" className="stroke-foreground" strokeWidth="14" />

        {/* Gestrichelte Flugbahn, freigegeben durch die Maske */}
        <path d={PATH} fill="none" className="stroke-hero-ink" strokeWidth="14" strokeDasharray="34 26" strokeLinecap="round" mask="url(#serve-mask)" />

        {/* Aufschläger hinter der Aufschlaglinie */}
        <circle cx="1850" cy="790" r="42" className="fill-accent" />
        <text x="1850" y="900" textAnchor="middle" className="fill-hero-ink text-[50px] font-semibold">Aufschläger</text>

        {/* Aufprallpunkt im diagonalen Feld */}
        <g className="pop-in">
          <circle cx="520" cy="260" r="30" className="fill-hero-ink" />
          <circle cx="520" cy="260" r="58" fill="none" className="stroke-hero-ink" strokeWidth="6" />
        </g>
        <text x="520" y="400" textAnchor="middle" className="fill-hero-ink text-[50px] font-semibold">Aufprall</text>
      </svg>
    </Reveal>
  );
}