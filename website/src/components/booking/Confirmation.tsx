"use client";
/**
 * Confirmation.tsx – Erfolgsansicht nach dem Buchen
 * Dezente Padelball-Konfetti-Animation (reines CSS, bei reduzierter Bewegung aus),
 * Ticket, Drucken, weitere Buchung, zurück zu den Courts, Link zum Stornieren.
 */
import Link from "next/link";
import { ArrowRight, Printer, RotateCcw } from "lucide-react";
import Ticket from "@/components/booking/Ticket";
import type { BookingResult } from "@/lib/booking/types";

const CONFETTI = Array.from({ length: 14 }, (_, i) => i);

export default function Confirmation({ booking, onNew }: { booking: BookingResult; onNew: () => void }) {
  return (
    <div className="relative">
      {/* Konfetti: rein dekorativ */}
      <div aria-hidden="true" className="no-print pointer-events-none absolute inset-x-0 -top-10 h-40 overflow-hidden">
        {CONFETTI.map((i) => (
          <span
            key={i}
            className={`confetti absolute top-0 block rounded-full ${i % 3 === 0 ? "bg-olive" : i % 3 === 1 ? "bg-accent" : "bg-accent-2"}`}
            style={{ left: `${(i * 7 + 4) % 100}%`, width: `${8 + (i % 4) * 3}px`, height: `${8 + (i % 4) * 3}px`, animationDelay: `${(i % 7) * 90}ms` }}
          />
        ))}
      </div>

      <div className="no-print text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Buchung bestätigt</p>
        <p className="mt-3 text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-tight tracking-tight">
          {booking.bookingType === "event" ? "Deine Anmeldung ist bestätigt!" : "Gebucht! Wir sehen uns auf dem Court."}
        </p>
        <p className="mx-auto mt-4 max-w-prose text-muted">Bitte notiere dir deine Buchungsnummer – damit kannst du stornieren.</p>
      </div>

      <div className="mt-10">
        <Ticket booking={booking} />
      </div>

      <div className="no-print mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => window.print()} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 font-semibold text-on-accent shadow-lift">
          <Printer aria-hidden="true" className="size-4" /> Ticket drucken
        </button>
        <button type="button" onClick={onNew} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-card px-6 font-semibold hover:border-accent">
          <RotateCcw aria-hidden="true" className="size-4" /> Weitere Buchung
        </button>
        <Link href="/courts" className="group inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-card px-6 font-semibold hover:border-accent">
          Zurück zu den Courts <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      <p className="no-print mt-6 text-center text-sm text-muted">
        Doch nicht dabei? <Link href="/buchung/stornieren" className="font-semibold text-accent underline-offset-4 hover:underline">Buchung stornieren</Link>
      </p>
    </div>
  );
}