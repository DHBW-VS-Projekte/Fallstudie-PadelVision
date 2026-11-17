"use client";
/**
 * SlotTakenNotice.tsx – "Schade – dieser Slot wurde gerade eben vergeben."
 * Zeigt bis zu 3 klickbare Vorschläge, die der Server direkt mit der
 * SLOT_TAKEN-Antwort mitliefert (gleicher Court, sonst andere Courts).
 */
import { ArrowRight, X } from "lucide-react";
import { formatEuro } from "@/lib/booking/format";
import { SHOW_PRICES } from "@/lib/booking/pricing-display";
import type { Suggestion } from "@/lib/booking/types";

export interface SlotTakenNoticeProps {
  message: string;
  suggestions: Suggestion[];
  currentCourtId: string;
  disabled: boolean;
  onPick: (s: Suggestion) => void;
  onClose: () => void;
}

export default function SlotTakenNotice({ message, suggestions, currentCourtId, disabled, onPick, onClose }: SlotTakenNoticeProps) {
  return (
    <div role="alert" className="notice-in mb-6 rounded-3xl border border-accent/40 bg-accent/8 p-5">
      <div className="flex items-start justify-between gap-4">
        <p className="pt-2.5 font-semibold">{message}</p>
        <button type="button" onClick={onClose} aria-label="Hinweis schließen" className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-accent/10">
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
      {suggestions.length > 0 ? (
        <>
          <p className="mt-1 text-sm text-muted">Diese Zeiten sind gerade noch frei:</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <li key={`${s.courtId}-${s.start}`}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onPick(s)}
                  className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-medium hover:border-accent disabled:opacity-50"
                >
                  {s.time}–{s.endTime}
                  {s.courtId !== currentCourtId && <span className="text-muted">· {s.courtName}</span>}
                  {SHOW_PRICES && <span className="text-muted">· {formatEuro(s.priceCents)}</span>}
                  <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-1 text-sm text-muted">An diesem Tag ist an diesem Standort leider nichts mehr frei – probier einen anderen Tag.</p>
      )}
    </div>
  );
}