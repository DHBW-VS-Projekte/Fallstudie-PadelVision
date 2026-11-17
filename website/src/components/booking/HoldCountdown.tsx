/**
 * HoldCountdown.tsx – "Für dich reserviert: 4:59"
 *
 * Der sichtbare Countdown ist für Screenreader stumm (aria-hidden), sonst würde
 * jede Sekunde vorgelesen. Angesagt wird nur zweimal – bei 1 Minute und beim
 * Ablauf – über eine eigene aria-live-Region, deren Text sich nur dann ändert.
 */
import { Clock } from "lucide-react";
import { formatCountdown } from "@/lib/booking/format";

export interface HoldCountdownProps {
  expiresAt: number;
  now: number;
  compact?: boolean;
}

export default function HoldCountdown({ expiresAt, now, compact = false }: HoldCountdownProps) {
  const remaining = expiresAt - now;
  const expired = remaining <= 0;
  const urgent = !expired && remaining <= 60_000;
  const announcement = expired ? "Deine Reservierung ist abgelaufen." : urgent ? "Noch eine Minute reserviert." : "";
  return (
    <div className={compact ? "" : "rounded-2xl bg-accent/10 p-4"}>
      <p aria-hidden="true" className={`flex items-center gap-2 font-semibold tabular-nums ${expired ? "text-muted" : "text-accent"}`}>
        <Clock className="size-4 shrink-0" />
        {expired ? "Reservierung abgelaufen" : compact ? formatCountdown(remaining) : `Für dich reserviert: ${formatCountdown(remaining)}`}
      </p>
      {!compact && urgent && <p className="mt-1 text-sm text-muted">Nur noch eine Minute – schließ die Buchung jetzt ab.</p>}
      {!compact && expired && <p className="mt-1 text-sm text-muted">Kein Problem: Wähl die Zeit einfach noch einmal.</p>}
      {!compact && <p className="sr-only" aria-live="polite">{announcement}</p>}
    </div>
  );
}