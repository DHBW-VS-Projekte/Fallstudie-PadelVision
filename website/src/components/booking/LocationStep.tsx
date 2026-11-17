"use client";

import ImageReveal from "@/components/ui/ImageReveal";
import { catalog } from "@/lib/booking/catalog";
import { formatEuro, seasonClosedForWindow } from "@/lib/booking/format";
import { SHOW_PRICES, locationFromCents } from "@/lib/booking/pricing-display";

export interface LocationStepProps {
  selected: string | null;
  now: number;
  onSelect: (slug: string) => void;
}

export default function LocationStep({ selected, now, onSelect }: LocationStepProps) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2">
      {catalog.locations.map((location) => {
        const closed = seasonClosedForWindow(
          location.season,
          location.timezone,
          catalog.rules.horizonDays,
          new Date(now),
        );
        const active = selected === location.slug;

        return (
          <li key={location.slug}>
            <button
              type="button"
              disabled={closed}
              aria-pressed={active}
              onClick={() => onSelect(location.slug)}
              className={`interactive-card flex h-full w-full flex-col overflow-hidden rounded-3xl border bg-card text-left shadow-soft disabled:cursor-not-allowed disabled:opacity-60 ${active ? "border-accent ring-2 ring-accent" : "border-line"}`}
            >
              <span className="relative block">
                <ImageReveal
                  image={location.image}
                  sizes="(min-width: 640px) 33vw, 100vw"
                  reveal={false}
                  framed={false}
                  className="aspect-[16/10]"
                />
                <span className="absolute left-4 top-4 rounded-full bg-card/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent backdrop-blur-md">
                  {closed ? "Saisonpause" : location.badge}
                </span>
              </span>
              <span className="flex flex-1 flex-col p-5">
                <span className="text-lg font-semibold tracking-tight">
                  <span aria-hidden="true">{location.flag}</span> {location.city}{" "}
                  <span className="font-normal text-muted">„{location.nickname}“</span>
                </span>
                <span className="mt-1 text-sm text-muted">
                  {location.courts.length} Courts · {location.hoursLabel}
                </span>
                {closed && (
                  <span className="mt-2 text-sm text-accent">
                    Saisonpause – wir sind ab April wieder für dich da.
                  </span>
                )}
                {SHOW_PRICES && !closed && (
                  <span className="mt-auto pt-4 text-sm font-semibold">
                    ab {formatEuro(locationFromCents(location, catalog.pricing))}{" "}
                    <span className="font-normal text-muted">/ 90 Min.</span>
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}