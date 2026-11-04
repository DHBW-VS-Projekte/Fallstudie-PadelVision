/**
 * cssVars.ts – typsichere Hilfe, um CSS-Variablen per `style` zu setzen
 * Problem: React kennt in CSSProperties keine eigenen Variablen wie "--pop-delay".
 * Lösung: Ein Typ, der CSSProperties um beliebige "--name"-Schlüssel erweitert –
 * ganz ohne `any` oder unsichere Casts. Funktioniert in Server- und Client-Components.
 */
import type { CSSProperties } from "react";

export type CssVars = CSSProperties & { [key: `--${string}`]: string };

/** Beispiel: style={cssVars({ "--pop-delay": "1.5s" })} */
export function cssVars(vars: { [key: `--${string}`]: string }): CssVars {
  return vars;
}