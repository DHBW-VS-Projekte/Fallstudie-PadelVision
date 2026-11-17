"use client";
/**
 * SlotTile.tsx – eine Zeit-Kachel (z. B. "18:00–19:30")
 *
 * Zustände – immer Farbe UND Text/Icon, nie nur Farbe:
 *  free   – anklickbar, mit Preis
 *  mine   – von dir gehalten (Terrakotta, mit Countdown)
 *  held   – gerade von jemand anderem reserviert (schraffiert, nicht anklickbar)
 *  booked – belegt (ausgegraut, nicht anklickbar)
 * Ändert sich der Zustand durch das Polling, bekommt die Kachel einen neuen
 * `key` (im Aufrufer) → die kurze CSS-Animation .slot-change läuft ab.
 */
import { Check, Lock, RefreshCw, Sparkles } from "lucide-react";
import { formatCountdown, formatEuro } from "@/lib/booking/format";
import { SHOW_PRICES } from "@/lib/booking/pricing-display";
import type { ApiSlot, SlotStatus } from "@/lib/booking/types";

export interface SlotTileProps {
  slot: ApiSlot;
  status: SlotStatus;
  pending: boolean;
  disabled: boolean;
  remainingMs: number | null;
  onPick: (slot: ApiSlot) => void;
}

const STATE_TEXT: Record<SlotStatus, string> = { free: "frei", mine: "für dich reserviert", held: "gerade reserviert", booked: "belegt" };

const STYLES: Record<SlotStatus, string> = {
  free: "border-line bg-card text-foreground hover:-translate-y-0.5 hover:border-accent hover:shadow-soft",
  mine: "border-accent bg-accent text-on-accent shadow-lift",
  held: "slot-hatched border-line text-muted",
  booked: "border-transparent bg-[var(--slot-booked)] text-[var(--slot-booked-ink)]",
};

export default function SlotTile({ slot, status, pending, disabled, remainingMs, onPick }: SlotTileProps) {
  const clickable = status === "free" && !disabled;
  // aria-label z. B. "18:00 bis 19:30, frei, 42 Euro, Prime Time"
  const label = [
    `${slot.time} bis ${slot.endTime}`,
    pending ? "wird reserviert" : STATE_TEXT[status],
    SHOW_PRICES && status === "free" ? `${Math.round(slot.priceCents / 100)} Euro` : "",
    slot.prime && status !== "booked" ? "Prime Time" : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={status === "mine"}
      aria-busy={pending}
      disabled={!clickable}
      onClick={() => onPick(slot)}
      className={`slot-change flex min-h-[5.5rem] w-full flex-col justify-between rounded-2xl border p-3.5 text-left transition-[transform,box-shadow,border-color] duration-300 disabled:cursor-not-allowed ${STYLES[status]} ${status === "mine" ? "disabled:cursor-default" : ""}`}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="font-semibold tabular-nums tracking-tight">
          {slot.time}
          <span className="font-normal opacity-70">–{slot.endTime}</span>
        </span>
        {pending ? (
          <RefreshCw aria-hidden="true" className="size-4 animate-spin" />
        ) : status === "mine" ? (
          <Check aria-hidden="true" className="size-4" />
        ) : status !== "free" ? (
          <Lock aria-hidden="true" className="size-4" />
        ) : null}
      </span>
      <span aria-hidden="true" className="mt-2 flex items-end justify-between gap-2 text-xs">
        <span>
          {pending
            ? "reserviere …"
            : status === "mine" && remainingMs !== null
              ? `reserviert · ${formatCountdown(remainingMs)}`
              : status === "free"
                ? SHOW_PRICES
                  ? formatEuro(slot.priceCents)
                  : "frei"
                : STATE_TEXT[status]}
        </span>
        {slot.prime && status !== "booked" && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status === "mine" ? "bg-on-accent/20" : "bg-accent/12 text-accent"}`}>
            <Sparkles className="size-3" /> Prime Time
          </span>
        )}
      </span>
    </button>
  );
}