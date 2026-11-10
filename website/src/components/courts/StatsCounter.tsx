"use client";
/**
 * StatsCounter.tsx – zählt eine Zahl beim Sichtbarwerden hoch
 * Client Component (kleine Insel), weil IntersectionObserver und
 * requestAnimationFrame Browser-APIs sind.
 *
 * Robustheit:
 * - Im Server-HTML steht IMMER der Endwert. Ohne JavaScript ist also
 *   sofort die richtige Zahl da.
 * - Screenreader lesen den Endwert aus dem sr-only-Text; die sichtbare,
 *   animierte Zahl ist aria-hidden (sonst würde jede Zwischenzahl vorgelesen).
 * - Bei prefers-reduced-motion bleibt der Endwert einfach stehen.
 * - Kein React-State: Die Zahl wird per textContent direkt gesetzt.
 *   Das vermeidet ~60 Re-Renders pro Sekunde und setState in Effekten.
 */
import { useCallback } from "react";

const DURATION = 1400; // Millisekunden

/** @param value Endwert, der angezeigt und hochgezählt wird */
export default function StatsCounter({ value }: { value: number }) {
  // Callback-Ref mit Aufräumfunktion (React 19). useCallback hält die
  // Funktion stabil, sonst würde React den Observer bei jedem Render neu anlegen.
  const ref = useCallback(
    (el: HTMLSpanElement | null) => {
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      let frame = 0;
      const rect = el.getBoundingClientRect();
      const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
      // Nur wenn die Zahl noch außerhalb des Bildschirms ist, auf 0 setzen –
      // sonst würde eine bereits sichtbare Zahl kurz "zurückspringen".
      if (alreadyVisible) return;
      el.textContent = "0";

      const run = () => {
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / DURATION, 1);
          // Ease-out (1 - (1-t)^3): schnell starten, sanft abbremsen
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = String(Math.round(eased * value));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      };

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer.disconnect();
            run();
          }
        },
        { threshold: 0.4 },
      );
      observer.observe(el);
      return () => {
        observer.disconnect();
        cancelAnimationFrame(frame);
        el.textContent = String(value);
      };
    },
    [value],
  );

  return (
    <>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}