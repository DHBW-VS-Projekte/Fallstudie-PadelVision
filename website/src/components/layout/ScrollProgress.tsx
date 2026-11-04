"use client";
/**
 * ScrollProgress.tsx – dünner Lesefortschrittsbalken oben am Bildschirm
 * Client Component, weil er auf Scroll-Ereignisse reagiert.
 *
 * Performance: Wir animieren nur transform: scaleX(...) mit transform-origin
 * links (kein width → keine Layout-Neuberechnung). Der Wert wird direkt am
 * DOM gesetzt (kein React-State → kein Neu-Rendern bei jedem Scroll-Pixel)
 * und per requestAnimationFrame auf max. 1× pro Frame gedrosselt.
 */
import { useCallback } from "react";

export default function ScrollProgress() {
  // Callback-Ref mit Aufräumfunktion (React 19): meldet die Listener an,
  // sobald das Element existiert, und ab, wenn es verschwindet.
  // useCallback verhindert, dass das bei jedem Render neu passiert.
  const ref = useCallback((bar: HTMLDivElement | null) => {
    if (!bar) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      bar.style.transform = `scaleX(${progress})`;
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
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div ref={ref} className="h-full origin-left scale-x-0 bg-accent" />
    </div>
  );
}