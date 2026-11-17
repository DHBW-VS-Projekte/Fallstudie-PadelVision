"use client";
/**
 * useLiveAvailability.ts – Belegung eines Courts an einem Tag, live
 *
 * Kombiniert useLiveVersion (billige Versionsabfrage) mit /api/availability.php.
 * Neu geladen wird nur, wenn
 *  - Court oder Datum wechseln,
 *  - sich die Versionsnummer ändert (jemand hat irgendwo reserviert/gebucht),
 *  - refresh() aufgerufen wird (direkt nach dem eigenen Hold).
 * Gehört die gespeicherte Antwort zu einem anderen Court/Tag, wird sie nicht
 * angezeigt – so braucht es kein "Zurücksetzen per setState im Effekt".
 */
import { useCallback, useEffect, useState } from "react";
import { ApiError, api, asApiError } from "@/lib/booking/api";
import type { AvailabilityResponse } from "@/lib/booking/types";
import { useLiveVersion, type LiveStatus } from "@/components/booking/usePolling";

interface Loaded {
  key: string;
  data: AvailabilityResponse | null;
  error: ApiError | null;
}

export interface LiveAvailability {
  data: AvailabilityResponse | null;
  error: ApiError | null;
  status: LiveStatus;
  refresh: () => void;
}

export function useLiveAvailability(courtId: string, date: string): LiveAvailability {
  const { version, status } = useLiveVersion(5000);
  // useState: zuletzt geladene Belegung inkl. Schlüssel "court|date"
  const [loaded, setLoaded] = useState<Loaded>({ key: "", data: null, error: null });
  // useState: Zähler für refresh() – eine Erhöhung startet den Lade-Effekt neu
  const [nonce, setNonce] = useState(0);
  const key = `${courtId}|${date}`;

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const data = await api.availability(courtId, date, controller.signal);
        setLoaded({ key, data, error: null });
      } catch (error) {
        if (controller.signal.aborted) return;
        // Bei Fehler alte Daten desselben Tages behalten, nur den Fehler merken
        setLoaded((prev) => ({ key, data: prev.key === key ? prev.data : null, error: asApiError(error) }));
      }
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [courtId, date, key, version, nonce]);

  // useCallback: stabile Funktion, damit Kinder nicht unnötig neu rendern
  const refresh = useCallback(() => setNonce((n) => n + 1), []);
  const current = loaded.key === key;
  return { data: current ? loaded.data : null, error: current ? loaded.error : null, status, refresh };
}