/**
 * MapLand.tsx – Meer und Landflächen der Europakarte als Inline-SVG
 *
 * SERVER Component: Die Landformen ändern sich nie. Deshalb wird dieses
 * SVG auf dem Server fertig gerendert und nur als `children` an die
 * Client-Komponente EuropeMap durchgereicht. Die vielen Koordinaten aus
 * europeShapes.ts landen so NICHT im JavaScript-Bundle des Browsers.
 * (Abweichung vom Dateiplan: zusätzliche Datei, verkleinert den Client-Anteil.)
 *
 * Rein dekorativ → aria-hidden. Die Bedeutung tragen die Pin-Buttons.
 */
import { MAP_HEIGHT, MAP_WIDTH, pathFromCoords, project } from "@/components/courts/geo";
import { baseLand, highlightedLand } from "@/components/courts/europeShapes";

/** Dicke der "Landplatte" in SVG-Einheiten (Extrusions-Trick, siehe unten) */
const EXTRUDE = 7;

const seaLabels = [
  { text: "Atlantik", lat: 45.5, lon: -8.5 },
  { text: "Mittelmeer", lat: 38.4, lon: 5.2 },
  { text: "Nordsee", lat: 56.2, lon: 3.2 },
] as const;

export default function MapLand() {
  // Pfade einmal berechnen und für "Seite" und "Oberfläche" wiederverwenden
  const base = baseLand.map((shape) => ({ id: shape.id, d: pathFromCoords(shape.coords) }));
  const highlight = highlightedLand.map((shape) => ({ id: shape.id, d: pathFromCoords(shape.coords) }));

  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      aria-hidden="true"
      focusable="false"
      className="absolute inset-0 size-full"
    >
      <defs>
        {/* Meer: sanfter Verlauf von hellerem zu tieferem Petrol (Tokens sea / sea-deep) */}
        <linearGradient id="map-sea" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" className="[stop-color:var(--sea)]" />
          <stop offset="1" className="[stop-color:var(--sea-deep)]" />
        </linearGradient>
        {/* Dezentes Wellenmuster: eine kleine Kachel mit einer Welle, die sich wiederholt */}
        <pattern id="map-waves" width="36" height="22" patternUnits="userSpaceOnUse">
          <path d="M2 12 q 7 -6 14 0 t 14 0" fill="none" className="stroke-accent-2/15" strokeWidth="1.4" strokeLinecap="round" />
        </pattern>
        {/* Abgerundete Kartenkante. Wir schneiden per clipPath statt overflow-hidden,
            weil overflow-hidden am 3D-Element den 3D-Raum "flachdrücken" würde. */}
        <clipPath id="map-clip">
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} rx="36" />
        </clipPath>
      </defs>

      <g clipPath="url(#map-clip)">
        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#map-sea)" />
        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#map-waves)" />

        {seaLabels.map((label) => {
          const p = project(label.lat, label.lon);
          return (
            <text key={label.text} x={p.x} y={p.y} textAnchor="middle" className="fill-accent-2/45 text-[22px] font-medium italic tracking-[0.3em]">
              {label.text.toUpperCase()}
            </text>
          );
        })}

        {/* ===== Extrusions-Trick =====
            Jede Landfläche wird zweimal gezeichnet: zuerst eine dunklere Kopie
            (land-side), um EXTRUDE Einheiten nach unten verschoben, darüber die
            eigentliche Fläche. Die sichtbare dunkle Kante wirkt wie die Seite
            einer wenige Millimeter dicken Platte – ganz ohne 3D-Engine. */}
        <g transform={`translate(0 ${EXTRUDE})`} className="fill-land-side">
          {base.map((s) => (
            <path key={`side-${s.id}`} d={s.d} />
          ))}
        </g>
        <g className="fill-land stroke-line" strokeWidth="1.2" strokeLinejoin="round">
          {base.map((s) => (
            <path key={`top-${s.id}`} d={s.d} />
          ))}
        </g>

        {/* Länder mit PadelVision-Standort, leicht kräftiger hervorgehoben */}
        <g className="fill-land-strong stroke-land-side/40" strokeWidth="1" strokeLinejoin="round">
          {highlight.map((s) => (
            <path key={`hl-${s.id}`} d={s.d} />
          ))}
        </g>
      </g>
    </svg>
  );
}