"use client";
/**
 * useHold.ts – Slot sofort reservieren (Hold) bzw. freigeben
 *
 * - acquire(): POST /api/hold.php. Bis die Antwort da ist, merkt sich der Hook
 *   den angeklickten Slot (pendingStart) → die Kachel zeigt einen Ladezustand.
 * - Ein neuer Hold ERSETZT den alten: Das macht der Server in derselben
 *   Transaktion (alter Hold dieses Geräts wird gelöscht). Scheitert der neue
 *   Hold, bleibt der alte erhalten.
 * - release(): "feuern und vergessen" – läuft der Hold ohnehin ab, ist ein
 *   Fehler hier unkritisch.
 */
import { useCallback, useState } from "react";
import { ApiError, api, asApiError } from "@/lib/booking/api";
import type { HoldInfo, Suggestion } from "@/lib/booking/types";

export type HoldOutcome = { ok: true; hold: HoldInfo } | { ok: false; error: ApiError; suggestions: Suggestion[] };

function isSuggestionList(value: unknown): value is Suggestion[] {
  return Array.isArray(value) && value.every((v) => typeof v === "object" && v !== null && "courtId" in v && "time" in v);
}

export function releaseHold(hold: HoldInfo | null): void {
  if (hold) api.release(hold.holdId, hold.holdToken).catch(() => undefined);
}

export function useHold() {
  // useState: Start (ISO) des Slots, für den gerade ein Hold angefragt wird
  const [pendingStart, setPendingStart] = useState<string | null>(null);

  const acquire = useCallback(async (courtId: string, date: string, time: string, start: string): Promise<HoldOutcome> => {
    setPendingStart(start);
    try {
      return { ok: true, hold: await api.hold(courtId, date, time) };
    } catch (error) {
      const apiError = asApiError(error);
      const raw = apiError.details.suggestions;
      return { ok: false, error: apiError, suggestions: isSuggestionList(raw) ? raw : [] };
    } finally {
      setPendingStart(null);
    }
  }, []);

  return { pendingStart, acquire };
}