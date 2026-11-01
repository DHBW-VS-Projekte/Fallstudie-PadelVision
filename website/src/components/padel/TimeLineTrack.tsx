"use client";
/**
 * TimelineTrack.tsx – Client-Insel für die Geschichte: füllende Zeitstrahl-Linie
 * Warum eigene Datei? So bleibt History.tsx eine Server Component; nur
 * dieser kleine Teil braucht JavaScript (Scrollposition).
 *
 * Die Einträge kommen als `children` vom Server. Wir messen, wie weit der
 * Zeitstrahl durchgescrollt ist, setzen transform: scaleY(...) auf die Linie
 * (transform-origin: top → wächst von oben nach unten) und markieren
 * erreichte Punkte mit data-reached.
 */
import { useCallback, type ReactNode } from "react";

export default function TimelineTrack({ children }: { children: ReactNode }) {
  // Callback-Ref mit Aufräumfunktion – useCallback, damit Listener nur einmal angemeldet werden.
  const ref = useCallback((root: HTMLDivElement | null) => {
    if (!root) return;
    const fill = root.querySelector<HTMLElement>("[data-fill]");
    const dots = Array.from(root.querySelectorAll<HTMLElement>("[data-dot]"));
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      // "Lesepunkt" = 60 % der Fensterhöhe. Fortschritt = wie weit dieser Punkt im Zeitstrahl liegt.
      const marker = window.innerHeight * 0.6;
      const progress = Math.min(Math.max((marker - rect.top) / rect.height, 0), 1);
      if (fill) fill.style.transform = `scaleY(${progress})`;
      for (const dot of dots) {
        const reached = dot.getBoundingClientRect().top < marker;
        dot.toggleAttribute("data-reached", reached);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Graue Grundlinie + farbige Fortschrittslinie. Mobil links, ab md mittig. */}
      <div aria-hidden="true" className="absolute bottom-0 left-[11px] top-0 w-0.5 bg-line md:left-1/2 md:-translate-x-1/2">
        <div data-fill className="h-full origin-top scale-y-0 bg-accent" />
      </div>
      {children}
    </div>
  );
}