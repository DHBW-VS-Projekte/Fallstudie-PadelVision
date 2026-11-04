
"use client";
/**
 * Reveal.tsx – wiederverwendbare Scroll-Animation
 *
 * Verwendung: Überall auf der Padel-Seite, um Texte/Karten sanft einzublenden.
 * Client Component, weil IntersectionObserver eine Browser-API ist.
 *
 * Funktionsweise: Das Element bekommt `data-reveal="up|left|right"`.
 * Sobald es im Viewport ist, setzen wir `data-visible` direkt am DOM-Element.
 * Die eigentliche Animation steckt komplett in globals.css.
 * Warum kein useState? Wir müssen React nicht neu rendern lassen – ein
 * Attribut am DOM reicht. Das ist schneller und vermeidet ESLint-Probleme
 * (kein setState in Effekten).
 */
import { useCallback, type CSSProperties, type ReactNode } from "react";

/** Erlaubte Wrapper-Elemente – bewusst eingeschränkt, damit es typsicher bleibt */
export type RevealTag = "div" | "li" | "section" | "span" | "figure";

export interface RevealProps {
  /** Richtung, aus der das Element hereinwischt */
  direction?: "up" | "left" | "right";
  /** Verzögerung in Millisekunden (für gestaffeltes Erscheinen) */
  delay?: number;
  /** HTML-Element, das gerendert wird (Standard: div) */
  as?: RevealTag;
  className?: string;
  children: ReactNode;
}

/** CSS-Variable typsicher an `style` übergeben, ohne `any` */
type RevealStyle = CSSProperties & { "--reveal-delay"?: string };

/**
 * Beobachtet ein Element einmalig und markiert es als sichtbar.
 * Wird von Reveal und ImageReveal gemeinsam genutzt.
 * @returns Callback-Ref (React 19 erlaubt eine Aufräumfunktion als Rückgabewert)
 */
export function useRevealRef() {
  // useCallback: Ohne ihn wäre die Ref-Funktion bei jedem Render neu, und
  // React würde den Observer jedes Mal ab- und wieder anmelden.
  return useCallback((el: HTMLElement | null) => {
    if (!el || el.dataset.visible !== undefined) return;
    el.ownerDocument.documentElement.classList.add("reveal-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.dataset.visible = "true";
            observer.disconnect(); // nur EINMAL animieren
          }
        }
      },
      // rootMargin unten -8 %: startet etwas bevor das Element ganz drin ist.
      // Elemente, die beim Laden (z. B. mit #anker) schon sichtbar sind,
      // meldet der Observer sofort beim ersten Callback → kein Inhaltsverlust.
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
}

/** Blendet `children` beim Scrollen sanft ein. */
export default function Reveal({
  direction = "up",
  delay = 0,
  as: Tag = "div",
  className,
  children,
}: RevealProps) {
  const ref = useRevealRef();
  const style: RevealStyle = { "--reveal-delay": `${delay}ms` };
  return (
    <Tag ref={ref} data-reveal={direction} style={style} className={className}>
      {children}
    </Tag>
  );
}
