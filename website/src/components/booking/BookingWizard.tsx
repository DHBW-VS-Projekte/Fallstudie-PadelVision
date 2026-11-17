"use client";
/**
 * BookingWizard.tsx – der komplette Buchungsablauf auf /buchung (Schritt 1–6 + Bestätigung)
 *
 * Client Component, weil sie ?standort= und ?schritt= aus der URL liest
 * (useSearchParams), auf Klicks reagiert und live pollt.
 * Warum im Client lesen? Beim statischen Export gibt es keinen Server, der
 * pro Anfrage rendern könnte – die Seite ist eine fertige HTML-Datei.
 * useSearchParams steht deshalb in einer Suspense-Grenze (siehe page.tsx).
 *
 * Navigation: Jeder Schrittwechsel schreibt ?schritt=… per history.pushState
 * in die URL – der Zurück-Button des Browsers funktioniert. Der Zustand liegt
 * zusätzlich in sessionStorage, damit ein Neuladen ihn nicht verliert.
 */
import { useEffect, useReducer, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";
import BookingSummary from "@/components/booking/BookingSummary";
import Confirmation from "@/components/booking/Confirmation";
import CourtStep from "@/components/booking/CourtStep";
import DateStep from "@/components/booking/DateStep";
import DetailsStep from "@/components/booking/DetailStep";
import LocationStep from "@/components/booking/LocationStep";
import ReviewStep from "@/components/booking/ReviewStep";
import StepIndicator from "@/components/booking/StepIndicator";
import TimeStep from "@/components/booking/TimeStep";
import { releaseHold } from "@/components/booking/useHold";
import { useNow } from "@/components/booking/usePolling";
import {
  STEPS, holdValid, initialState, isStepId, maxStepIndex, urlFor, wizardReducer, writeStoredState,
  type WizardAction,
} from "@/components/booking/wizardState";
import { api, asApiError } from "@/lib/booking/api";
import { findCourt, findLocation } from "@/lib/booking/catalog";
import { errorMessage } from "@/lib/booking/errors";
import { findEventById } from "@/components/courts/courtsContent";

export default function BookingWizard() {
  // useSearchParams MUSS als Erstes stehen: Beim statischen Export bricht der
  // Server-Durchlauf hier ab und zeigt den Suspense-Fallback; gerendert wird im Browser.
  const params = useSearchParams();
  // useReducer: Ablauf-Zustand an einer Stelle (Begründung in wizardState.ts).
  // Lazy-Initializer: liest URL + sessionStorage genau einmal.
  const [state, dispatch] = useReducer(wizardReducer, params, (p) => initialState((key) => p.get(key)));
  const now = useNow();
  const [submitting, setSubmitting] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<{ field: string; message: string } | null>(null);
  const [announcement, setAnnouncement] = useState("");
  // useRef: Überschrift des Schritts – bekommt nach einem Wechsel den Fokus
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  // useRef: Merker für die URL-Synchronisierung (werden nur in Effekten/Handlern gelesen)
  const firstUrlSync = useRef(true);
  const cameFromHistory = useRef(false);

  /** Aktion ausführen und einen Hold freigeben, falls er durch die Aktion verloren geht */
  function act(action: WizardAction) {
    const next = wizardReducer(state, action);
    const keepsHold = action.type === "hold" || action.type === "booked"; // Server ersetzt bzw. verbraucht den Hold selbst
    if (state.hold && !keepsHold && next.hold === null) releaseHold(state.hold);
    cameFromHistory.current = false; // eigene Aktion → wieder neue Verlaufseinträge anlegen
    dispatch(action);
  }

  // useEffect: Zustand in sessionStorage sichern (externer Speicher, kein setState)
  useEffect(() => {
    writeStoredState(state);
  }, [state]);

  // useEffect: Schritt in die URL schreiben (?schritt=…), damit der Zurück-Button funktioniert.
  // Beim ersten Mal und nach Zurück/Vor wird ersetzt (replaceState), sonst ein neuer
  // Verlaufseintrag angelegt (pushState).
  useEffect(() => {
    const target = urlFor({ step: state.step, location: state.location, eventId: state.eventId }, window.location.pathname);
    if (window.location.pathname + window.location.search !== target) {
      if (firstUrlSync.current || cameFromHistory.current) window.history.replaceState(null, "", target);
      else window.history.pushState(null, "", target);
    }
    firstUrlSync.current = false;
    cameFromHistory.current = false;
  }, [state.step, state.location, state.eventId]);

  // useEffect: Zurück-/Vor-Button des Browsers → Schritt aus der URL übernehmen
  useEffect(() => {
    const onPop = () => {
      const step = new URLSearchParams(window.location.search).get("schritt");
      cameFromHistory.current = true;
      if (isStepId(step)) dispatch({ type: "go", step });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // useEffect: Fokus auf die neue Schritt-Überschrift (nicht beim ersten Laden)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [state.step]);

  async function book() {
    if (!state.hold || !state.idempotencyKey || submitting) return;
    setSubmitting(true);
    setBookError(null);
    try {
      const booking = await api.book({
        holdId: state.hold.holdId,
        holdToken: state.hold.holdToken,
        courtId: state.courtId ?? undefined,
        date: state.date ?? undefined,
        time: state.hold.time,
        durationMinutes: 90,
        eventId: state.eventId ?? undefined,
        eventTitle: state.eventId ? (findEventById(state.eventId)?.event.title ?? undefined) : undefined,
        eventType: state.eventId ? (findEventById(state.eventId)?.event.type ?? undefined) : undefined,
        fullName: state.details.fullName,
        email: state.details.email,
        rackets: state.details.rackets,
        balls: state.details.balls,
        consent: state.details.consent,
        idempotencyKey: state.idempotencyKey,
      });
      act({ type: "booked", booking });
      setAnnouncement(`Gebucht! Deine Buchungsnummer ist ${booking.code}.`);
    } catch (e) {
      const err = asApiError(e);
      const field = err.details.field;
      if (err.code === "HOLD_EXPIRED") {
        act({ type: "clearHold" });
        setAnnouncement(errorMessage("HOLD_EXPIRED"));
      } else if (err.code === "VALIDATION" && (field === "fullName" || field === "email")) {
        setFieldError({ field, message: err.message });
        act({ type: "go", step: "daten" });
      } else {
        setBookError(errorMessage(err.code, err.message));
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Bis die Uhr läuft (erste Sekunde), nur den Rahmen zeigen
  if (now === 0) return <WizardSkeleton />;

  const location = findLocation(state.location);
  const courtInfo = findCourt(state.courtId);
  const stepMeta = STEPS.find((s) => s.id === state.step);
  const stepNumber = STEPS.findIndex((s) => s.id === state.step) + 1;
  const holdExpired = !state.eventId && state.hold !== null && !holdValid(state.hold, now);

  if (state.step === "fertig" && state.booking) {
    return (
      <>
        <Confirmation booking={state.booking} onNew={() => act({ type: "reset" })} />
        <p className="sr-only" aria-live="polite">{announcement}</p>
      </>
    );
  }

  return (
    <div className="pb-28 lg:pb-0">
      {!state.eventId && (
        <StepIndicator current={state.step} maxIndex={maxStepIndex(state)} onGo={(step) => act({ type: "go", step })} />
      )}

      {location && state.step !== "standort" && !state.eventId && (
        <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2 text-sm">
          <MapPin aria-hidden="true" className="size-4 text-accent" />
          <span>Standort: <strong>{location.flag} {location.city}</strong></span>
          <span aria-hidden="true">·</span>
          <button type="button" onClick={() => act({ type: "go", step: "standort" })} className="min-h-11 px-1 font-semibold text-accent underline-offset-4 hover:underline">
            ändern
          </button>
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-labelledby="step-title" key={state.step} className="step-in min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            {state.eventId ? "Event-Anmeldung" : `Schritt ${stepNumber} von 6`}
          </p>
          <h2 id="step-title" ref={headingRef} tabIndex={-1} className="mt-2 text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-tight tracking-tight outline-none">
            {stepMeta?.title}
          </h2>
          <div className="mt-8">
            {state.step === "standort" && <LocationStep selected={state.location} now={now} onSelect={(slug) => act({ type: "location", slug })} />}

            {state.step === "court" && location && <CourtStep location={location} selected={state.courtId} onSelect={(courtId) => act({ type: "court", courtId })} />}

            {state.step === "datum" && courtInfo && <DateStep courtId={courtInfo.court.id} selected={state.date} onSelect={(date) => act({ type: "date", date })} />}

            {state.step === "uhrzeit" && courtInfo && state.date && (
              <TimeStep
                court={courtInfo.court}
                date={state.date}
                hold={state.hold}
                now={now}
                onHold={(hold) => act({ type: "hold", hold })}
                onContinue={() => act({ type: "go", step: "daten" })}
                onChangeDate={() => act({ type: "go", step: "datum" })}
                announce={setAnnouncement}
              />
            )}

            {(state.step === "daten" || state.step === "pruefen") && holdExpired && (
              <div role="alert" className="rounded-3xl border border-accent/40 bg-accent/8 p-6">
                <p className="font-semibold">Deine Reservierung ist abgelaufen.</p>
                <p className="mt-1 text-muted">Kein Problem – wähl die Zeit einfach noch einmal. Deine Eingaben bleiben erhalten.</p>
                <button type="button" onClick={() => act({ type: "clearHold" })} className="mt-4 inline-flex min-h-12 items-center rounded-full bg-accent px-6 font-semibold text-on-accent">
                  Neue Zeit wählen
                </button>
              </div>
            )}

            {state.step === "daten" && !holdExpired && (
              <DetailsStep
                initial={state.details}
                serverError={fieldError}
                onSubmit={(details) => {
                  setFieldError(null);
                  act({ type: "details", details, idempotencyKey: crypto.randomUUID() });
                }}
              />
            )}

            {state.step === "pruefen" && !holdExpired && location && courtInfo && state.hold && (
              <ReviewStep
                location={location}
                court={courtInfo.court}
                hold={state.hold}
                details={state.details}
                submitting={submitting}
                error={bookError}
                onEdit={() => act({ type: "go", step: "daten" })}
                onBook={() => void book()}
                eventTitle={state.eventId ? findEventById(state.eventId)?.event.title ?? null : null}
                eventType={state.eventId ? findEventById(state.eventId)?.event.type ?? null : null}
              />
            )}
          </div>
        </section>

        <BookingSummary state={state} now={now} />
      </div>

      {/* Gemeinsame Ansage-Region für Reservierungen, Fehler und Erfolg */}
      <p className="sr-only" aria-live="polite">{announcement}</p>
    </div>
  );
}

/** Lade-Rahmen im Design der Seite (auch Suspense-Fallback in page.tsx) */
export function WizardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Buchung wird geladen" className="animate-pulse">
      <div className="flex gap-2">
        {STEPS.map((s) => (
          <span key={s.id} className="h-11 w-28 rounded-full bg-surface" />
        ))}
      </div>
      <div className="mt-12 h-10 w-72 rounded-2xl bg-surface" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-3xl bg-surface" />
        ))}
      </div>
    </div>
  );
}