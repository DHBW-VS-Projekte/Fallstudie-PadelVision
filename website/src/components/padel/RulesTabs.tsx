"use client";
/**
 * RulesTabs.tsx – Tabs "Erlaubt" / "Fehler" nach dem WAI-ARIA-Tabs-Pattern
 * Client Component: aktiver Tab + Pfeiltasten-Navigation.
 * Tastatur: ←/→ wechseln, Pos1/Ende springen zum ersten/letzten Tab.
 * Nur der aktive Tab ist per Tab-Taste erreichbar (tabIndex 0, sonst -1).
 */
import { useRef, useState, type KeyboardEvent } from "react";
import { Check, X } from "lucide-react";
import type { RuleCategory } from "@/components/padel/padelContent";

export default function RulesTabs({ categories }: { categories: RuleCategory[] }) {
  // useState: Index des gewählten Tabs
  const [index, setIndex] = useState(0);
  // useRef: Liste der Tab-Buttons, um nach Pfeiltaste den Fokus zu verschieben
  // (nur im Event-Handler genutzt, nicht beim Rendern).
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  /** Wechselt den Tab und setzt den Fokus darauf */
  function select(next: number) {
    const i = (next + categories.length) % categories.length;
    setIndex(i);
    tabsRef.current[i]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowRight") select(index + 1);
    else if (e.key === "ArrowLeft") select(index - 1);
    else if (e.key === "Home") select(0);
    else if (e.key === "End") select(categories.length - 1);
    else return;
    e.preventDefault();
  }

  return (
    <div>
      <div role="tablist" aria-label="Regeln" className="inline-flex gap-1 rounded-full bg-surface p-1">
        {categories.map((cat, i) => {
          const selected = i === index;
          const Icon = cat.kind === "ok" ? Check : X;
          return (
            <button
              key={cat.id}
              ref={(el) => { tabsRef.current[i] = el; }}
              id={`tab-${cat.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`panel-${cat.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setIndex(i)}
              onKeyDown={onKeyDown}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full px-6 font-medium transition-colors ${
                selected ? "bg-brand-green text-white" : "text-muted hover:text-foreground"
              }`}
            >
              <Icon aria-hidden="true" className="size-4" /> {cat.label}
            </button>
          );
        })}
      </div>

      {categories.map((cat, i) => {
        const Icon = cat.kind === "ok" ? Check : X;
        return (
          <div
            key={cat.id}
            id={`panel-${cat.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${cat.id}`}
            hidden={i !== index}
            tabIndex={0}
            className="mt-6"
          >
            <ul className="grid gap-3 sm:grid-cols-2">
              {cat.items.map((item) => (
                <li key={item.text} className="interactive-card flex gap-3 rounded-2xl border border-line bg-card p-5 leading-relaxed shadow-soft">
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full ${cat.kind === "ok" ? "bg-accent-2/15 text-accent-2" : "bg-accent/15 text-accent"}`}>
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}