"use client";
/**
 * useHold.ts – Slot sofort reservieren (Hold) bzw. freigeben
 *
 * - acquire(): POST /api/hold.php. Bis die Antwort da ist, merkt sich der Hook
 *   den angeklickten Slot (pendingStart) → die Kachel zeigt einen Ladezustand.
 * - Ein neuer Hold ersetzt den alten Hold dieses Tabs in derselben Transaktion.
 *   Dafür werden ID und Token des alten Holds an den Server übergeben.
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

  const acquire = useCallback(async (
    courtId: string,
    date: string,
    time: string,
    start: string,
    previousHold?: Pick<HoldInfo, "holdId" | "holdToken">,
  ): Promise<HoldOutcome> => {
    setPendingStart(start);
    try {
      return { ok: true, hold: await api.hold(courtId, date, time, previousHold) };
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