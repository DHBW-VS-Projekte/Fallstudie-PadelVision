"use client";
/**
 * StepIndicator.tsx – Fortschrittsanzeige 1–6
 * Erreichbare Schritte sind echte Buttons (zurückspringen), der aktuelle trägt
 * aria-current="step", spätere Schritte sind deaktiviert.
 */
import { Check } from "lucide-react";
import { STEPS, STEP_ORDER, type StepId } from "@/components/booking/wizardState";

export interface StepIndicatorProps {
  current: StepId;
  maxIndex: number;
  onGo: (step: StepId) => void;
}

export default function StepIndicator({ current, maxIndex, onGo }: StepIndicatorProps) {
  const currentIndex = STEP_ORDER.indexOf(current);
  return (
    <nav aria-label="Buchungsschritte">
      <ol className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {STEPS.map((step, i) => {
          const active = i === currentIndex;
          const done = i < currentIndex;
          const reachable = !active && i <= maxIndex;
          return (
            <li key={step.id} className="shrink-0">
              <button
                type="button"
                disabled={!reachable}
                aria-current={active ? "step" : undefined}
                onClick={() => onGo(step.id)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
                  active
                    ? "border-accent bg-accent text-on-accent"
                    : done
                      ? "border-line bg-card hover:border-accent"
                      : "border-line/70 text-muted disabled:opacity-60"
                }`}
              >
                <span aria-hidden="true" className={`grid size-6 place-items-center rounded-full text-xs ${active ? "bg-on-accent/20" : done ? "bg-accent-2 text-background" : "bg-surface"}`}>
                  {done ? <Check className="size-3.5" /> : i + 1}
                </span>
                {step.label}
                {done && <span className="sr-only"> (erledigt – zurückspringen)</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}