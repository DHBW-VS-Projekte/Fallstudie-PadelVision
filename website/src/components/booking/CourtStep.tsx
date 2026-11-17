"use client";
/**
 * CourtStep.tsx – Schritt 2: Court wählen
 * Karten mit Name, Indoor/Outdoor, Panorama-Badge, Preis und live
 * "Heute noch X Slots frei" (aus /api/summary.php, alle 5 s geprüft).
 */
import { useEffect, useState } from "react";
import { Building2, Sun } from "lucide-react";
import LiveBadge from "@/components/booking/LiveBadge";
import { useLiveVersion } from "@/components/booking/usePolling";
import { api } from "@/lib/booking/api";
import { catalog } from "@/lib/booking/catalog";
import { formatEuro } from "@/lib/booking/format";
import { SHOW_PRICES, courtBaseCents } from "@/lib/booking/pricing-display";
import type { CatalogLocation, SummaryResponse } from "@/lib/booking/types";

export interface CourtStepProps {
  location: CatalogLocation;
  selected: string | null;
  onSelect: (courtId: string) => void;
}

export default function CourtStep({ location, selected, onSelect }: CourtStepProps) {
  const { version, status } = useLiveVersion(5000);
  // useState: letzte Übersicht; enthält den Standort, damit nie die eines anderen gezeigt wird
  const [summary, setSummary] = useState<SummaryResponse | null>(null);

  // useEffect: Übersicht laden, wenn Standort oder Versionsnummer sich ändern
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      api.summary(location.slug, controller.signal).then(setSummary).catch(() => undefined);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [location.slug, version]);

  const current = summary?.location === location.slug ? summary : null;

  return (
    <div>
      <div className="mb-5 flex justify-end"><LiveBadge status={status} /></div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {location.courts.map((court) => {
          const info = current?.courts.find((c) => c.courtId === court.id);
          const Icon = court.kind === "indoor" ? Building2 : Sun;
          const active = selected === court.id;
          const freeText = !current
            ? "Lade Verfügbarkeit …"
            : !current.todayOpen
              ? "Heute geschlossen"
              : !info || info.remainingToday === 0
                ? "Heute keine Zeiten mehr"
                : `Heute noch ${info.freeToday} ${info.freeToday === 1 ? "Slot" : "Slots"} frei`;
          return (
            <li key={court.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(court.id)}
                className={`interactive-card flex h-full w-full flex-col rounded-3xl border bg-card p-6 text-left shadow-soft ${active ? "border-accent ring-2 ring-accent" : "border-line"}`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className={`grid size-12 place-items-center rounded-2xl ${court.kind === "indoor" ? "bg-accent-2/15 text-accent-2" : "bg-accent/15 text-accent"}`}>
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  {court.panorama && <span className="rounded-full bg-olive/15 px-3 py-1 text-xs font-semibold text-olive">Panorama</span>}
                </span>
                <span className="mt-4 text-lg font-semibold tracking-tight">{court.name}</span>
                <span className="mt-1 text-sm text-muted">{court.kind === "indoor" ? "Indoor · wetterunabhängig" : "Outdoor · unter freiem Himmel"}</span>
                <span className="mt-auto flex items-end justify-between gap-3 pt-5 text-sm">
                  <span className={info && info.freeToday > 0 ? "text-accent-2" : "text-muted"}>{freeText}</span>
                  {SHOW_PRICES && <span className="font-semibold">ab {formatEuro(courtBaseCents(court, catalog.pricing))}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}