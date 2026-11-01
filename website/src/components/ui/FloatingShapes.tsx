/**
 * FloatingShapes.tsx – langsam schwebende Deko-Formen
 * Server Component: Die Bewegung ist reines CSS (Klassen float-a/float-b),
 * daher ist kein JavaScript nötig.
 * aria-hidden + pointer-events-none: rein dekorativ, nicht klickbar.
 * Der umgebende Abschnitt braucht `relative isolate overflow-hidden`,
 * damit nichts horizontales Scrollen verursacht und die Formen hinter dem Inhalt liegen.
 */
export interface FloatingShapesProps {
  /** Variante bestimmt Position/Farbe, damit nicht jeder Abschnitt gleich aussieht */
  variant?: "a" | "b";
}

/** Stilisierter Padelball: Kreis + geschwungene Naht */
function Ball({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="46" className="fill-olive/25" />
      <path d="M8 40 C 35 30, 35 70, 8 62" className="fill-none stroke-hero-ink/50" strokeWidth="3" />
      <path d="M92 38 C 65 30, 65 70, 92 60" className="fill-none stroke-hero-ink/50" strokeWidth="3" />
    </svg>
  );
}

export default function FloatingShapes({ variant = "a" }: FloatingShapesProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {variant === "a" ? (
        <>
          {/* blur-3xl macht aus harten Kreisen weiche Farbwolken */}
          <div className="float-a absolute -left-24 top-10 size-72 rounded-full bg-accent/15 blur-3xl" />
          <div className="float-b absolute -right-20 bottom-0 size-80 rounded-full bg-accent-2/15 blur-3xl" />
          <Ball className="float-b absolute right-[8%] top-16 size-14 opacity-70" />
        </>
      ) : (
        <>
          <div className="float-b absolute -right-24 top-1/4 size-72 rounded-full bg-olive/15 blur-3xl" />
          <div className="float-a absolute -left-16 bottom-10 size-64 rounded-full bg-accent/10 blur-3xl" />
          <Ball className="float-a absolute left-[6%] top-24 size-10 opacity-60" />
        </>
      )}
    </div>
  );
}