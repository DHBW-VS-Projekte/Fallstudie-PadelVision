"use client";
/**
 * usePolling.ts – Live-Aktualisierung OHNE WebSockets (Shared Hosting erlaubt keine Dauerverbindungen)
 *
 * useLiveVersion fragt regelmäßig /api/version.php ab: EINE Zahl, ein SELECT
 * auf eine Zeile – extrem billig. Nur wenn sich die Zahl ändert, laden die
 * Komponenten die eigentlichen Daten neu.
 *  - Intervall: 5 s
 *  - Jitter 0–500 ms: 30 Geräte fragen nicht exakt gleichzeitig an
 *  - Hintergrund-Tab: keine Abfragen; beim Zurückkehren sofort
 *  - Fehler: Backoff 5 s → 10 s → 20 s → max. 30 s, Status "reconnecting"
 * setState passiert nur in Timer-/Promise-Callbacks, nie direkt im Effekt;
 * im Cleanup werden Timer, Listener und laufende Anfragen beendet.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import { api } from "@/lib/booking/api";

export type LiveStatus = "connecting" | "live" | "reconnecting";

export interface LiveVersion {
  version: number | null;
  status: LiveStatus;
}

export function useLiveVersion(intervalMs: number, enabled = true): LiveVersion {
  // useState: letzte bekannte Version + Verbindungsstatus. Ändert sich die
  // Version, rendern die Abnehmer neu und laden ihre Daten nach.
  const [state, setState] = useState<LiveVersion>({ version: null, status: "connecting" });

  // useEffect: Polling ist ein "externes System" (Timer + Netzwerk) – genau dafür sind Effekte da.
  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    let failures = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | null = null;

    const schedule = (delay: number) => {
      clearTimeout(timer);
      timer = setTimeout(() => void tick(), delay + Math.random() * 500);
    };

    async function tick() {
      if (stopped || document.visibilityState === "hidden") return; // pausiert, bis der Tab wieder sichtbar ist
      controller = new AbortController();
      try {
        const version = await api.version(controller.signal);
        if (stopped) return;
        failures = 0;
        setState((prev) => (prev.version === version && prev.status === "live" ? prev : { version, status: "live" }));
        schedule(intervalMs);
      } catch (error) {
        if (stopped || (error instanceof DOMException && error.name === "AbortError")) return;
        failures += 1;
        setState((prev) => (prev.status === "reconnecting" ? prev : { ...prev, status: "reconnecting" }));
        schedule(Math.min(intervalMs * 2 ** (failures - 1), 30000));
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") schedule(0);
    };
    document.addEventListener("visibilitychange", onVisibility);
    schedule(0);

    return () => {
      stopped = true;
      clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intervalMs, enabled]);

  return state;
}

/* ===================== Gemeinsame Uhr ===================== */
// Eine einzige Uhr für alle Komponenten (Countdown, abgelaufene Holds).
// Umgesetzt als "externer Store" für useSyncExternalStore: So ruft keine
// Komponente Date.now() während des Renderns auf (React-19-Regel "purity").
let clockNow = 0;
let clockTimer: ReturnType<typeof setInterval> | undefined;
const clockListeners = new Set<() => void>();

function subscribeClock(listener: () => void): () => void {
  clockListeners.add(listener);
  if (!clockTimer) {
    clockNow = Date.now();
    clockTimer = setInterval(() => {
      clockNow = Date.now();
      clockListeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0 && clockTimer) {
      clearInterval(clockTimer);
      clockTimer = undefined;
    }
  };
}

/**
 * Aktuelle Zeit (ms), aktualisiert jede Sekunde.
 * Auf dem Server und ganz am Anfang 0 – Aufrufer behandeln 0 als "noch unbekannt".
 */
export function useNow(): number {
  return useSyncExternalStore(subscribeClock, () => clockNow, () => 0);
}

/**
 * Gibt einen Wert erst weiter, wenn er sich `ms` Millisekunden lang nicht
 * geändert hat. Für die aria-live-Region: Screenreader sollen nicht bei jeder
 * kleinen Änderung unterbrochen werden.
 */
export function useThrottledValue<T>(value: T, ms: number): T {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setShown(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return shown;
}