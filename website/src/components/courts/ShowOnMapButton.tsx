"use client";
/**
 * ShowOnMapButton.tsx – "Auf der Karte zeigen" in den Standortkarten
 *
 * Client Component (winzige Insel): Das Raster ist eine Server Component und
 * teilt keinen State mit CourtsExplorer. Deshalb sendet dieser Link ein
 * Browser-Ereignis (CustomEvent) mit dem Slug; CourtsExplorer hört darauf.
 *
 * Es ist ein echter Anker-Link auf #karte: Der Browser scrollt also auch ohne
 * JavaScript zur Karte (weich, dank scroll-behavior in globals.css).
 */
import { MapPin } from "lucide-react";
import { SELECT_LOCATION_EVENT } from "@/components/courts/courtsContent";

export default function ShowOnMapButton({ slug, city }: { slug: string; city: string }) {
  return (
    <a
      href="#karte"
      onClick={() => window.dispatchEvent(new CustomEvent(SELECT_LOCATION_EVENT, { detail: slug }))}
      aria-label={`${city} auf der Karte zeigen`}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold transition-colors hover:border-brand-green hover:text-brand-green"
    >
      <MapPin aria-hidden="true" className="size-4" /> Auf der Karte zeigen
    </a>
  );
}