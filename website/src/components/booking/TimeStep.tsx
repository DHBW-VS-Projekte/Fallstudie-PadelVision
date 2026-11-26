"use client";
/**
 * TimeStep.tsx – Schritt 4: Uhrzeit wählen (Herzstück)
 *
 * - Belegung live: alle 5 s Versionsabfrage, bei Änderung neu laden
 * - Klick auf eine freie Kachel → SOFORT Hold für 5 Minuten (POST /api/hold.php),
 *   danach sofortiges Neuladen der Belegung (nicht erst beim nächsten Polling)
 * - Abgelaufene fremde Holds zeigt der Browser anhand von expiresAt sofort als frei
 * - Verlorenes Rennen → SlotTakenNotice mit Vorschlägen
 * Die Anzeige "frei" ist nur eine Vorschau – entscheidend ist IMMER der Server.
 */
import { useState } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import LiveBadge from "@/components/booking/LiveBadge";
import SlotTakenNotice from "@/components/booking/SlotTakenNotice";
import SlotTile from "@/components/booking/SlotTile";
import { useHold } from "@/components/booking/useHold";
import { useLiveAvailability } from "@/components/booking/useLiveAvailability";
import { useThrottledValue } from "@/components/booking/usePolling";
import { holdValid, type HeldSlot } from "@/components/booking/wizardState";
import { catalog } from "@/lib/booking/catalog";
import { errorMessage } from "@/lib/booking/errors";
import { dayPart, formatDateLong, type DayPart } from "@/lib/booking/format";
import { effectiveSlotStatus } from "@/lib/booking/slot-status";
import type { ApiSlot, CatalogCourt, SlotStatus, Suggestion } from "@/lib/booking/types";

export interface TimeStepProps {
  court: CatalogCourt;
  date: string;
  hold: HeldSlot | null;
  now: number;
  onHold: (hold: HeldSlot) => void;
  onContinue: () => void;
  onChangeDate: () => void;
  announce: (message: string) => void;
}

type Notice = { kind: "taken"; message: string; suggestions: Suggestion[] } | { kind: "error"; message: string } | null;

const PARTS: DayPart[] = ["Vormittag", "Nachmittag", "Abend"];

export default function TimeStep({ court, date, hold, now, onHold, onContinue, onChangeDate, announce }: TimeStepProps) {
  const live = useLiveAvailability(court.id, date);
  const { pendingStart, acquire } = useHold();
  // useState: Hinweis nach verlorenem Rennen oder Fehler
  const [notice, setNotice] = useState<Notice>(null);

  // Fester Versatz aus der letzten Antwort; verändert sich nicht mit jeder Sekunde.
  const skew = live.serverClockSkew;
  const myHold = holdValid(hold, now) && hold.courtId === court.id && hold.date === date ? hold : null;

  function effectiveStatus(slot: ApiSlot): SlotStatus {
    return effectiveSlotStatus(slot, myHold?.start === slot.start, now, skew);
  }

  async function reserve(courtId: string, slotDate: string, time: string, start: string) {
    if (pendingStart) return;
    const previousHold = holdValid(hold, now) ? { holdId: hold.holdId, holdToken: hold.holdToken } : undefined;
    const result = await acquire(courtId, slotDate, time, start, previousHold);
    live.refresh(); // sofort neu laden, nicht auf das nächste Polling warten
    if (result.ok) {
      setNotice(null);
      // Ablauf nach Geräte-Uhr (1 s Puffer für die Netzwerklaufzeit)
      onHold({ ...result.hold, localExpiresAt: Date.now() + catalog.rules.holdSeconds * 1000 - 1000 });
      announce(`${result.hold.time} Uhr ist jetzt 5 Minuten für dich reserviert.`);
    } else if (result.error.code === "SLOT_TAKEN") {
      const message = errorMessage("SLOT_TAKEN");
      setNotice({ kind: "taken", message, suggestions: result.suggestions });
      announce(message + (result.suggestions.length > 0 ? ` ${result.suggestions.length} Vorschläge verfügbar.` : ""));
    } else {
      const message = errorMessage(result.error.code, result.error.message);
      setNotice({ kind: "error", message });
      announce(message);
    }
  }

  const slots = live.data?.slots ?? [];
  const freeCount = slots.filter((s) => effectiveStatus(s) === "free").length;
  // gedrosselt: Screenreader hören höchstens alle paar Sekunden eine neue Zahl
  const throttledFree = useThrottledValue(freeCount, 4000);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <CalendarDays aria-hidden="true" className="size-4" /> {formatDateLong(date)} · {court.name}
          <button type="button" onClick={onChangeDate} className="min-h-11 px-1 font-semibold text-accent underline-offset-4 hover:underline">
            ändern
          </button>
        </p>
        <LiveBadge status={live.status} />
      </div>
      {live.data && <p className="-mt-3 mb-6 text-sm text-muted">{live.data.timezoneLabel}</p>}

      {notice?.kind === "taken" && (
        <SlotTakenNotice
          message={notice.message}
          suggestions={notice.suggestions}
          currentCourtId={court.id}
          disabled={pendingStart !== null}
          onPick={(s) => void reserve(s.courtId, s.date, s.time, s.start)}
          onClose={() => setNotice(null)}
        />
      )}
      {notice?.kind === "error" && <p role="alert" className="mb-6 rounded-2xl bg-accent/10 p-4 font-medium text-accent">{notice.message}</p>}

      {!live.data && !live.error && <p className="text-muted">Lade freie Zeiten …</p>}
      {live.error && !live.data && (
        <div role="alert" className="rounded-2xl bg-accent/10 p-4">
          <p className="font-medium text-accent">{errorMessage(live.error.code, live.error.message)}</p>
          <button type="button" onClick={live.refresh} className="mt-3 min-h-11 rounded-full border border-line bg-card px-5 text-sm font-semibold">
            Erneut versuchen
          </button>
        </div>
      )}
      {live.data && slots.length === 0 && (
        <p className="rounded-2xl bg-surface p-5 text-muted">{live.data.closedReason ?? "Für diesen Tag gibt es keine buchbaren Zeiten mehr."}</p>
      )}

      {PARTS.map((part) => {
        const group = slots.filter((s) => dayPart(s.minute) === part);
        if (group.length === 0) return null;
        return (
          <section key={part} aria-label={part} className="mb-8">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted">{part}</h3>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {group.map((slot) => {
                const status = effectiveStatus(slot);
                return (
                  <li key={slot.start}>
                    <SlotTile
                      key={status}
                      slot={slot}
                      status={status}
                      pending={pendingStart === slot.start}
                      disabled={pendingStart !== null}
                      remainingMs={status === "mine" && myHold ? myHold.localExpiresAt - now : null}
                      onPick={(s) => void reserve(court.id, date, s.time, s.start)}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {/* gedrosselte Live-Ansage für Screenreader */}
      <p className="sr-only" aria-live="polite">{live.data ? `${throttledFree} Zeiten frei.` : ""}</p>

      <div className="sticky bottom-20 z-10 mt-4 flex justify-end lg:bottom-6">
        <button
          type="button"
          disabled={!myHold}
          onClick={onContinue}
          className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-7 font-semibold text-on-accent shadow-lift transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40"
        >
          {myHold ? `Weiter mit ${myHold.time} Uhr` : "Wähle eine freie Zeit"}
          <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}