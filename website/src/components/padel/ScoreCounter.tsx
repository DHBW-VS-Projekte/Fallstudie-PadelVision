"use client";
/**
 * ScoreCounter.tsx – interaktiver Mini-Punktezähler für ein Spiel
 * Client Component: reagiert auf Klicks und hält den Spielstand.
 * Die gesamte Zähl-LOGIK steckt in scoring.ts – diese Datei ruft nur
 * deren Funktionen auf und zeigt das Ergebnis an.
 */
import { useReducer } from "react";
import { RotateCcw } from "lucide-react";
import {
  addPoint, createInitialState, getScoreLabel,
  type DeuceMode, type GameState, type Team,
} from "@/components/padel/scoring";

interface CounterState {
  mode: DeuceMode;
  game: GameState;
}

type Action =
  | { type: "point"; team: Team }
  | { type: "mode"; mode: DeuceMode }
  | { type: "reset" };

/**
 * Reducer: berechnet aus altem Zustand + Aktion den neuen Zustand.
 * Beim Wechsel der Variante wird das Spiel zurückgesetzt – sonst könnte
 * z. B. ein Star-Point-Spiel mit 3 Einständen plötzlich als Golden-Point-
 * Spiel weiterlaufen, und die Anzeige wäre widersprüchlich.
 */
function reducer(state: CounterState, action: Action): CounterState {
  switch (action.type) {
    case "point":
      return { ...state, game: addPoint(state.game, action.team, state.mode) };
    case "mode":
      return { mode: action.mode, game: createInitialState() };
    case "reset":
      return { ...state, game: createInitialState() };
  }
}

const MODES: { id: DeuceMode; label: string }[] = [
  { id: "advantage", label: "Vorteil" },
  { id: "golden", label: "Golden Point" },
  { id: "star", label: "Star Point" },
];

export default function ScoreCounter() {
  // useReducer statt mehrerer useState: Modus und Spielstand hängen
  // zusammen (Moduswechsel = Reset). Ein Reducer hält das an EINER Stelle.
  // Lazy-Initializer (3. Argument) erzeugt den Startzustand nur einmal.
  const [state, dispatch] = useReducer(reducer, undefined, () => ({ mode: "advantage" as DeuceMode, game: createInitialState() }));
  const display = getScoreLabel(state.game, state.mode);
  const finished = state.game.winner !== null;

  return (
    <div className="interactive-card rounded-3xl border border-line bg-card p-6 shadow-soft sm:p-8">
      {/* ===== Variante wählen: echte Radio-Buttons (Pfeiltasten funktionieren nativ) ===== */}
      <fieldset>
        <legend className="text-sm font-semibold text-muted">Variante bei 40:40</legend>
        <div role="radiogroup" className="mt-3 grid grid-cols-3 gap-1 rounded-full bg-surface p-1">
          {MODES.map((m) => (
            <label
              key={m.id}
              className={`flex min-h-11 cursor-pointer items-center justify-center rounded-full px-2 text-center text-sm font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
                state.mode === m.id ? "bg-accent text-on-accent shadow-soft" : "text-muted hover:text-foreground"
              }`}
            >
              <input
                type="radio"
                name="deuce-mode"
                value={m.id}
                checked={state.mode === m.id}
                onChange={() => dispatch({ type: "mode", mode: m.id })}
                className="sr-only"
              />
              {m.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* ===== Spielstand (aria-live: Screenreader lesen Änderungen vor) ===== */}
      <div aria-live="polite" className="mt-8 text-center">
        <div className="grid grid-cols-2 gap-4">
          {(["A", "B"] as const).map((team) => (
            <div key={team} className={`interactive-card rounded-2xl p-5 ${state.game.winner === team ? "bg-accent-2 text-background" : "bg-surface"}`}>
              <p className="text-sm font-medium opacity-80">Team {team}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">
                {team === "A" ? display.scoreA : display.scoreB}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-2xl font-semibold tracking-tight text-accent">{display.status}</p>
        {display.deuceNumber !== null && (
          <p className="mt-1 text-sm font-medium text-accent-2">Einstand {display.deuceNumber} von 3</p>
        )}
        <p className="mt-2 text-muted">{display.hint}</p>
      </div>

      {/* ===== Steuerung ===== */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        {(["A", "B"] as const).map((team) => (
          <button
            key={team}
            type="button"
            disabled={finished}
            onClick={() => dispatch({ type: "point", team })}
            className="min-h-12 rounded-full bg-foreground font-semibold text-background transition-[transform,opacity] hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            Punkt Team {team}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => dispatch({ type: "reset" })}
        className="mx-auto mt-4 flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium text-muted hover:text-foreground"
      >
        <RotateCcw aria-hidden="true" className="size-4" /> Zurücksetzen
      </button>

      {/* ===== Verlauf der letzten Punkte ===== */}
      {state.game.history.length > 0 && (
        <p className="mt-4 text-center text-xs text-muted">
          Verlauf: {state.game.history.slice(-10).join(" · ")}
        </p>
      )}
    </div>
  );
}