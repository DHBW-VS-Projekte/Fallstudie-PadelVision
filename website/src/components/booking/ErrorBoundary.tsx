"use client";
/**
 * ErrorBoundary.tsx – fängt unerwartete Fehler in der Oberfläche ab
 * Statt einer weißen Seite erscheint eine freundliche Meldung mit
 * "Erneut versuchen". Fehler-Grenzen müssen in React (noch) Klassen sein.
 */
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  failed: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="rounded-3xl border border-line bg-card p-8 text-center shadow-soft">
        <p className="text-xl font-semibold">Die Buchung ist gerade nicht erreichbar.</p>
        <p className="mt-2 text-muted">Etwas ist schiefgelaufen. Bitte versuche es noch einmal.</p>
        <button
          type="button"
          onClick={() => this.setState({ failed: false })}
          className="mt-6 inline-flex min-h-12 items-center rounded-full bg-accent px-6 font-semibold text-on-accent"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }
}