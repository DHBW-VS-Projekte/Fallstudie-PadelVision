/**
 * MapTooltip.tsx – kleine Milchglas-Vorschau über einem Pin
 *
 * Wird von MapPin (Client) gerendert und läuft daher im Client mit, braucht
 * aber selbst keinen Zustand und keine Hooks. Sichtbarkeit steuert CSS
 * (.map-pin:hover / :focus-visible in globals.css), nicht React.
 *
 * Nur <span>-Elemente: Der Tooltip steckt in einem <button>, und Buttons
 * dürfen laut HTML nur "phrasing content" (z. B. span) enthalten, keine divs.
 */
import { MousePointerClick } from "lucide-react";

export interface MapTooltipProps {
  id: string;
  name: string;
  flag: string;
  country: string;
  badge: string;
  courtSummary: string;
  nextEvent: string | null;
  align: "start" | "center" | "end";
}

/** Horizontale Ausrichtung: Pins am Rand öffnen den Tooltip zur Kartenmitte */
const alignClasses: Record<MapTooltipProps["align"], string> = {
  start: "left-0",
  center: "left-1/2 -translate-x-1/2",
  end: "right-0",
};

export default function MapTooltip({ id, name, flag, country, badge, courtSummary, nextEvent, align }: MapTooltipProps) {
  return (
    <span
      id={id}
      role="tooltip"
      className={`map-tip absolute bottom-full z-10 mb-3 block w-60 rounded-2xl border border-line/70 bg-card/85 p-4 text-left text-foreground shadow-lift backdrop-blur-xl ${alignClasses[align]}`}
    >
      <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{badge}</span>
      <span className="mt-1 block text-base font-semibold leading-tight">{name}</span>
      <span className="block text-sm text-muted">
        <span aria-hidden="true">{flag}</span> {country}
      </span>
      <span className="mt-2 block text-sm">{courtSummary}</span>
      {nextEvent && <span className="mt-1 block text-sm text-muted">Nächstes Event: {nextEvent}</span>}
      <span className="mt-3 flex items-center gap-1.5 text-xs font-medium text-accent-2">
        <MousePointerClick aria-hidden="true" className="size-3.5" /> Klicken für Details
      </span>
    </span>
  );
}