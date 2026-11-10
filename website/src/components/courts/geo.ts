/**
 * geo.ts – Kartengeometrie der Courts-Seite (reine Funktionen, kein React)
 *
 * Verwendet von: MapLand.tsx (Landflächen), EuropeMap.tsx (Pins, Bögen),
 * europeShapes.ts (Inseln als "Blobs").
 * Weder Server- noch Client-Component: reine Rechenlogik, nutzbar in beiden.
 *
 * Koordinatensystem: SVG-viewBox "0 0 MAP_WIDTH MAP_HEIGHT".
 * x wächst nach Osten, y wächst nach SÜDEN (SVG zählt von oben nach unten).
 */

/** Kartenausschnitt in Grad: 11° W bis 32° O, 34° N bis 58° N */
export const MAP_BOUNDS = { west: -11, east: 32, south: 34, north: 58 } as const;

/**
 * Breitenkorrektur: Ein Längengrad ist am Äquator ~111 km breit, Richtung
 * Pol schrumpft er mit cos(Breite). In der Mitte unseres Ausschnitts (46° N)
 * ist er nur ~69 % so breit wie ein Breitengrad hoch ist. Ohne diesen Faktor
 * wäre Europa stark in die Breite gezogen.
 */
export const LAT_CORRECTION = Math.cos((46 * Math.PI) / 180); // ≈ 0,6947

/** 1 Grad Breite = 40 SVG-Einheiten (frei gewählt, bestimmt nur die Auflösung) */
export const MAP_SCALE = 40;

export const MAP_WIDTH = Math.round((MAP_BOUNDS.east - MAP_BOUNDS.west) * LAT_CORRECTION * MAP_SCALE); // 1195
export const MAP_HEIGHT = (MAP_BOUNDS.north - MAP_BOUNDS.south) * MAP_SCALE; // 960

export interface Point {
  x: number;
  y: number;
}

/** Stützpunkt als [Längengrad, Breitengrad] – Reihenfolge wie bei GeoJSON */
export type LonLat = readonly [number, number];

/**
 * Äquirektanguläre Projektion mit Breitenkorrektur.
 * @param lat Breitengrad (Nord positiv)
 * @param lon Längengrad (Ost positiv, West negativ)
 * @returns Position in SVG-Einheiten
 */
export function project(lat: number, lon: number): Point {
  return {
    x: (lon - MAP_BOUNDS.west) * LAT_CORRECTION * MAP_SCALE,
    y: (MAP_BOUNDS.north - lat) * MAP_SCALE,
  };
}

/** Wandelt einen SVG-Punkt in Prozent der Kartenfläche um (für absolut positionierte Pins) */
export function toPercent(p: Point): { left: number; top: number } {
  return { left: (p.x / MAP_WIDTH) * 100, top: (p.y / MAP_HEIGHT) * 100 };
}

/** Rundet auf eine Nachkommastelle – hält die SVG-Pfade kurz */
const r = (n: number) => Math.round(n * 10) / 10;

/**
 * Erzeugt aus [lon, lat]-Stützpunkten einen geschlossenen SVG-Pfad.
 * Weil alle Formen DIESE Funktion nutzen, liegen Land und Pins garantiert
 * im selben Koordinatensystem.
 */
export function pathFromCoords(coords: readonly LonLat[]): string {
  return (
    coords
      .map(([lon, lat], i) => {
        const p = project(lat, lon);
        return `${i === 0 ? "M" : "L"}${r(p.x)} ${r(p.y)}`;
      })
      .join(" ") + " Z"
  );
}

/**
 * Kreisähnliche "Insel" um einen Mittelpunkt (für sehr kleine Inseln wie
 * die Kykladen). Der Radius ist in Breitengraden angegeben; die Längen-
 * ausdehnung wird durch LAT_CORRECTION geteilt, damit die Form rund aussieht.
 */
export function blob(lon: number, lat: number, radius: number, points = 10): LonLat[] {
  const out: LonLat[] = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    // leichte Unregelmäßigkeit, damit es nicht nach Kreis aus dem Zirkel aussieht
    const wobble = 1 + 0.18 * Math.sin(a * 3);
    out.push([lon + (Math.cos(a) * radius * wobble) / LAT_CORRECTION, lat + Math.sin(a) * radius * wobble]);
  }
  return out;
}

/**
 * Vergrößert eine Form um ihren Mittelpunkt (stilisierte Darstellung
 * winziger Inseln, damit sie auf der Karte überhaupt sichtbar sind).
 */
export function scaleShape(coords: readonly LonLat[], factor: number): LonLat[] {
  const cx = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const cy = coords.reduce((s, c) => s + c[1], 0) / coords.length;
  return coords.map(([lon, lat]) => [cx + (lon - cx) * factor, cy + (lat - cy) * factor] as const);
}

/**
 * Gebogener Verbindungsbogen als quadratische Bézierkurve.
 * Eine quadratische Bézierkurve "Q" hat Start, Ende und EINEN Kontrollpunkt.
 * Wir legen den Kontrollpunkt auf die Mitte der Strecke und schieben ihn
 * senkrecht zur Strecke nach oben (Norden). So entsteht ein Bogen wie
 * bei einer Flugroute.
 * @param bend Stärke der Biegung relativ zur Streckenlänge (0 = gerade)
 */
export function arcPath(from: Point, to: Point, bend = 0.22): string {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  // Start = Ziel (z. B. Stammhaus zu sich selbst): kein Bogen möglich
  if (len === 0) return `M${r(from.x)} ${r(from.y)}`;
  // Normale (senkrecht zur Strecke); Vorzeichen so wählen, dass sie nach oben zeigt
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const cx = mx + nx * len * bend;
  const cy = my + ny * len * bend;
  return `M${r(from.x)} ${r(from.y)} Q${r(cx)} ${r(cy)} ${r(to.x)} ${r(to.y)}`;
}

/**
 * Punkt-in-Polygon-Test (Ray-Casting): Von dem Punkt aus wird ein Strahl
 * nach rechts gedacht. Schneidet er die Umrisslinie ungerade oft, liegt
 * der Punkt innen. Wird zur Prüfung der Pin-Positionen genutzt.
 */
export function isInside(lon: number, lat: number, polygon: readonly LonLat[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const crosses = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

/**
 * Wohin soll sich der Tooltip eines Pins öffnen? Pins am linken/rechten
 * Rand öffnen ihn zur Kartenmitte, damit er nicht aus der Karte ragt.
 */
export function tooltipAlign(leftPercent: number): "start" | "center" | "end" {
  if (leftPercent < 25) return "start";
  if (leftPercent > 72) return "end";
  return "center";
}

/* =====================================================================
   BEISPIELRECHNUNGEN (rechnerisch geprüft, Werte gerundet)
   MAP_WIDTH = 43 × 0,6947 × 40 ≈ 1195, MAP_HEIGHT = 24 × 40 = 960

   project(47.66, 9.18)   Konstanz      → x ≈ 560,8  y ≈ 413,6  (46,9 % / 43,1 %)
   project(36.51, -4.88)  Marbella      → x ≈ 170,1  y ≈ 859,6  (14,2 % / 89,5 %)
   project(41.59, 9.28)   Porto-Vecchio → x ≈ 563,6  y ≈ 656,4  (47,2 % / 68,4 %)
   project(36.42, 25.43)  Santorini     → x ≈ 1012,3 y ≈ 863,2  (84,7 % / 89,9 %)
   project(35.51, 24.02)  Chania        → x ≈ 973,1  y ≈ 899,6  (81,4 % / 93,7 %)

   Santorini ↔ Chania liegen nur ≈ 53 Einheiten auseinander. Deshalb haben
   beide in courtsContent.ts einen pinOffset; eine kurze Führungslinie
   verbindet den echten Ort mit dem versetzten Pin.

   isInside-Prüfung (siehe europeShapes.ts): Konstanz liegt in "Deutschland",
   Marbella in "Spanien", Porto-Vecchio in "Korsika", Santorini in
   "Santorini", Chania in "Kreta" → alle true.
   ===================================================================== */