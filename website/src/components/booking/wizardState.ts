/**
 * wizardState.ts – Zustand und Übergänge des Buchungsablaufs (reine Logik, kein React)
 *
 * Warum ein Reducer? Die Schritte hängen voneinander ab: Wechselt der Standort,
 * werden Court, Datum und Hold ungültig; wechselt der Court, ist der Hold weg.
 * Ein Reducer beschreibt all diese Abhängigkeiten an EINER Stelle.
 * (Zusätzliche Datei gegenüber der Vorgabe – hält BookingWizard.tsx übersichtlich.)
 */
import { findCourt, findLocation } from "@/lib/booking/catalog";
import type { BookingResult, HoldInfo } from "@/lib/booking/types";
import { findEventById } from "@/components/courts/courtsContent";

export type StepId = "standort" | "court" | "datum" | "uhrzeit" | "daten" | "pruefen" | "fertig";

export const STEPS: { id: StepId; label: string; title: string }[] = [
  { id: "standort", label: "Standort", title: "Wo möchtest du spielen?" },
  { id: "court", label: "Court", title: "Welcher Court soll es sein?" },
  { id: "datum", label: "Datum", title: "An welchem Tag?" },
  { id: "uhrzeit", label: "Uhrzeit", title: "Wähle deine Uhrzeit" },
  { id: "daten", label: "Deine Daten", title: "Fast geschafft – wer spielt?" },
  { id: "pruefen", label: "Prüfen", title: "Alles richtig?" },
];

export const STEP_ORDER: StepId[] = ["standort", "court", "datum", "uhrzeit", "daten", "pruefen", "fertig"];

/**
 * Hold plus Ablaufzeit nach der GERÄTE-Uhr (localExpiresAt). So stimmt der
 * Countdown auch dann, wenn die Uhr des Handys ein paar Minuten falsch geht.
 */
export interface HeldSlot extends HoldInfo {
  localExpiresAt: number;
}

export interface Details {
  fullName: string;
  email: string;
  rackets: number;
  balls: number;
  consent: boolean;
}

export interface WizardState {
  step: StepId;
  location: string | null;
  courtId: string | null;
  date: string | null;
  eventId: string | null;
  hold: HeldSlot | null;
  details: Details;
  idempotencyKey: string | null;
  booking: BookingResult | null;
}

export type WizardAction =
  | { type: "go"; step: StepId }
  | { type: "location"; slug: string }
  | { type: "court"; courtId: string }
  | { type: "date"; date: string }
  | { type: "hold"; hold: HeldSlot }
  | { type: "clearHold" }
  | { type: "details"; details: Details; idempotencyKey: string }
  | { type: "booked"; booking: BookingResult }
  | { type: "reset" };

export const EMPTY_DETAILS: Details = { fullName: "", email: "", rackets: 0, balls: 0, consent: false };

export function emptyState(): WizardState {
  return { step: "standort", location: null, courtId: null, date: null, eventId: null, hold: null, details: EMPTY_DETAILS, idempotencyKey: null, booking: null };
}

export function eventHoldFor(event: { date: string; time: string; durationMinutes?: number }, courtId: string): HeldSlot {
  const [hour, minute] = event.time.split(":").map(Number);
  const start = (Number.isFinite(hour) ? hour : 0) * 60 + (Number.isFinite(minute) ? minute : 0);
  const duration = event.durationMinutes ?? 90;
  const endMinutes = (start + duration) % 1440;
  const now = Date.now();
  const expiresAt = new Date(now + 60 * 60 * 1000).toISOString();
  const endTime = `${String(Math.floor(endMinutes / 60) % 24).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
  return {
    holdId: `event:${event.date}-${event.time}`,
    holdToken: "event-booking",
    expiresAt,
    courtId,
    date: event.date,
    time: event.time,
    endTime,
    start: `${event.date}T${event.time}:00`,
    end: `${event.date}T${endTime}:00`,
    priceCents: 0,
    prime: false,
    localExpiresAt: now + 60 * 60 * 1000,
  };
}

function stateForEvent(
  event: { id: string; date: string; time: string; durationMinutes?: number },
  locationSlug: string,
  details: Details = EMPTY_DETAILS,
): WizardState {
  const location = findLocation(locationSlug);
  const courtId = location?.courts[0]?.id ?? null;
  return {
    ...emptyState(),
    location: locationSlug,
    courtId,
    date: event.date,
    eventId: event.id,
    hold: courtId ? eventHoldFor(event, courtId) : null,
    details,
    step: "daten",
  };
}

export function holdValid(hold: HeldSlot | null, now: number): hold is HeldSlot {
  return hold !== null && hold.localExpiresAt > now;
}

/**
 * Höchster erreichbarer Schritt (Index in STEP_ORDER). Ob ein Hold abgelaufen
 * ist, wird hier bewusst NICHT geprüft (keine Uhr im Reducer) – das zeigt der
 * Wizard selbst an und bietet "Neue Zeit wählen" an.
 */
export function maxStepIndex(state: WizardState): number {
  if (state.booking) return 6;
  if (!state.location) return 0;
  if (!state.courtId) return 1;
  if (!state.date) return 2;
  if (!state.hold) return 3;
  if (!state.details.consent || !state.idempotencyKey) return 4;
  return 5;
}

/** Gewünschten Schritt auf den erreichbaren Bereich begrenzen ("fertig" nur mit Buchung) */
export function clampStep(state: WizardState, wanted: StepId): StepId {
  if (state.booking) return "fertig";
  return STEP_ORDER[Math.min(STEP_ORDER.indexOf(wanted), maxStepIndex(state), 5)];
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "go":
      return { ...state, step: clampStep(state, action.step) };
    case "location":
      if (state.location === action.slug) return { ...state, step: "court" };
      // Neuer Standort: alles danach zurücksetzen, eingegebene Daten behalten
      return { ...emptyState(), details: state.details, location: action.slug, eventId: null, step: "court" };
    case "court":
      return { ...state, courtId: action.courtId, date: state.courtId === action.courtId ? state.date : null, hold: null, eventId: null, idempotencyKey: null, step: "datum" };
    case "date":
      return { ...state, date: action.date, hold: null, idempotencyKey: null, step: "uhrzeit" };
    case "hold":
      // Ein Vorschlag kann auf einem anderen Court liegen → Court und Datum aus dem Hold übernehmen
      return { ...state, hold: action.hold, courtId: action.hold.courtId, date: action.hold.date, idempotencyKey: null };
    case "clearHold":
      return { ...state, hold: null, idempotencyKey: null, step: state.step === "daten" || state.step === "pruefen" ? "uhrzeit" : state.step };
    case "details":
      return { ...state, details: action.details, idempotencyKey: state.idempotencyKey ?? action.idempotencyKey, step: "pruefen" };
    case "booked":
      return { ...state, booking: action.booking, hold: null, step: "fertig" };
    case "reset":
      return emptyState();
  }
}

/* ===================== sessionStorage ===================== */
// Überlebt ein Neuladen, aber nicht das Schließen des Tabs. Der Hold-Token liegt
// nur hier und im Arbeitsspeicher – nie in einem Cookie oder auf dem Server im Klartext.

const STORAGE_KEY = "padelvision-booking";

export function readStoredState(): WizardState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || !("step" in parsed) || !("details" in parsed)) return null;
    const state = parsed as WizardState;
    // Gegen den Katalog prüfen – veraltete IDs verwerfen
    if (state.location && !findLocation(state.location)) return null;
    if (state.courtId && !findCourt(state.courtId)) return null;
    return state;
  } catch {
    return null;
  }
}

export function writeStoredState(state: WizardState): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // privater Modus o. Ä.: dann eben ohne Wiederherstellung
  }
}

export function isStepId(value: string | null): value is StepId {
  return value !== null && (STEP_ORDER as string[]).includes(value);
}

/**
 * Startzustand aus der URL:
 *  - ?schritt=… vorhanden (Neuladen / Zurück-Button) → gespeicherten Zustand fortsetzen
 *  - ?standort=gültig → nur diesen Standort vorauswählen, weiter bei Schritt 2
 *  - sonst (z. B. über die Navbar) → KEINE Vorauswahl. Ungültige Slugs werden still ignoriert.
 */
export function initialState(get: (key: string) => string | null): WizardState {
  const wanted = get("schritt");
  const preselect = findLocation(get("standort"));
  const preEvent = findEventById(get("event"));
  if (isStepId(wanted)) {
    const stored = readStoredState();
    if (stored && (!preselect || stored.location === preselect.slug) && (!preEvent || stored.eventId === preEvent.event.id)) {
      if (preEvent) {
        const eventCourt = findCourt(stored.courtId);
        const eventStateIsComplete = stored.location === preEvent.location.slug
          && eventCourt?.location.slug === preEvent.location.slug
          && stored.hold?.date === preEvent.event.date
          && stored.hold.time === preEvent.event.time;
        if (!eventStateIsComplete) {
          const restored = stateForEvent(preEvent.event, preEvent.location.slug, stored.details);
          restored.idempotencyKey = stored.idempotencyKey;
          restored.booking = stored.booking;
          return { ...restored, step: clampStep(restored, wanted) };
        }
      }
      return { ...stored, step: clampStep(stored, wanted) };
    }
  }
  if (preEvent) return stateForEvent(preEvent.event, preEvent.location.slug);
  if (preselect) return { ...emptyState(), location: preselect.slug, step: "court" };
  return emptyState();
}

/** URL für einen Zustand: /buchung/?standort=…&schritt=… */
export function urlFor(state: Pick<WizardState, "step" | "location" | "eventId">, pathname: string): string {
  const params = new URLSearchParams();
  if (state.location) params.set("standort", state.location);
  if (state.eventId) params.set("event", state.eventId);
  params.set("schritt", state.step);
  return `${pathname}?${params.toString()}`;
}