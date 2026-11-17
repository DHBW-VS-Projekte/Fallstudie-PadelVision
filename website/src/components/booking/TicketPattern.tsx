/**
 * TicketPattern.tsx – dekoratives, QR-ARTIGES Muster aus der Buchungsnummer
 *
 * ACHTUNG: Das ist KEIN scanbarer QR-Code! Echte QR-Codes brauchen
 * Fehlerkorrektur und ein genormtes Format (dafür wäre eine Bibliothek nötig).
 * Hier wird die Buchungsnummer nur in eine Zufallsfolge umgerechnet
 * (FNV-1a-Hash als Startwert, dann ein einfacher Zufallsgenerator).
 * Gleiche Nummer = immer gleiches Muster ("deterministisch").
 * Keine Hooks → funktioniert in Server- und Client-Komponenten.
 */

const SIZE = 21;

function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/** Liegt (x, y) in einer der drei "Ecken-Quadrate" (typisch für QR-Optik)? */
function inFinder(x: number, y: number): boolean {
  const corners = [[0, 0], [SIZE - 7, 0], [0, SIZE - 7]];
  return corners.some(([cx, cy]) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7);
}

export default function TicketPattern({ code }: { code: string }) {
  let seed = hash(code) || 1;
  const next = () => {
    // xorshift32 – einfacher, schneller Zufallsgenerator
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
  const cells: [number, number][] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const r = next();
      if (!inFinder(x, y) && r > 0.52) cells.push([x, y]);
    }
  }
  const finders = [[0, 0], [SIZE - 7, 0], [0, SIZE - 7]];
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Dekoratives Muster (kein scanbarer Code)" className="size-full" shapeRendering="crispEdges">
      <rect width={SIZE} height={SIZE} className="fill-card" />
      {finders.map(([fx, fy]) => (
        <g key={`${fx}-${fy}`} className="fill-foreground">
          <path d={`M${fx} ${fy}h7v7h-7z M${fx + 1} ${fy + 1}v5h5v-5z`} fillRule="evenodd" />
          <rect x={fx + 2} y={fy + 2} width="3" height="3" />
        </g>
      ))}
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" className="fill-foreground" />
      ))}
    </svg>
  );
}