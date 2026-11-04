"use client";

/**
 * ThemeToggle.tsx – Hell/Dunkel-Schalter
 * Verwendung: in der Navbar (Desktop und mobiles Menü).
 * Client Component, weil er auf Klicks reagiert und localStorage schreibt.
 *
 * Keine Hydration-Fehler: Beide Icons werden IMMER gerendert und nur per
 * CSS (dark:-Variante) umgeschaltet. Das sichtbare Icon stimmt dadurch sofort,
 * auch bevor React geladen ist.
 */
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "padelvision-theme";

/** Meldet Änderungen der Klasse an <html> (z. B. durch andere Toggle-Instanzen) */
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const getSnapshot = () => document.documentElement.classList.contains("dark");
/** Auf dem Server gibt es kein Theme → neutraler Wert "hell" */
const getServerSnapshot = () => false;

export default function ThemeToggle({ className = "" }: { className?: string }) {
  // useSyncExternalStore: liest einen Zustand, der AUSSERHALB von React lebt
  // (die Klasse an <html>). Ohne ihn müssten wir per useEffect + setState
  // synchronisieren – das verbietet die ESLint-Regel set-state-in-effect.
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  /** Theme umschalten, speichern und kurz einen sanften Farbübergang aktivieren */
  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.add("theme-transition");
    root.classList.toggle("dark", next);
    root.style.colorScheme = next ? "dark" : "light";
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Speichern nicht möglich (z. B. privater Modus) – Theme gilt dann nur bis zum Neuladen
    }
    window.setTimeout(() => root.classList.remove("theme-transition"), 350);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Zum hellen Modus wechseln" : "Zum dunklen Modus wechseln"}
      className={`relative grid size-11 place-items-center rounded-full border border-current/20 transition-colors hover:bg-current/10 ${className}`}
    >
      {/* Sonne: sichtbar im Hellmodus. Im Dunkelmodus dreht sie sich weg und verblasst. */}
      <Sun
        aria-hidden="true"
        className="size-5 transition-all duration-500 ease-out-soft dark:rotate-90 dark:scale-50 dark:opacity-0"
      />
      <Moon
        aria-hidden="true"
        className="absolute size-5 -rotate-90 scale-50 opacity-0 transition-all duration-500 ease-out-soft dark:rotate-0 dark:scale-100 dark:opacity-100"
      />
    </button>
  );
}