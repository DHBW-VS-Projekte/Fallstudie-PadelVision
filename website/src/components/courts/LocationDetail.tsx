/**
 * LocationDetail.tsx – ausführliche Ansicht eines Standorts (Panel neben der Karte)
 *
 * SERVER Component: Für jeden Standort wird ein Panel fertig gerendert und an
 * CourtsExplorer übergeben, der nur das ausgewählte einblendet. Vorteil: alle
 * Inhalte stehen im HTML, und ohne JavaScript ist das Stammhaus sichtbar.
 */
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import ImageReveal from "@/components/ui/ImageReveal";
import { eventTypeLabels, levelLabels, type Location } from "@/components/courts/courtsContent";
import { amenityIcons, courtTypeIcons, eventTypeClasses } from "@/components/courts/icons";
import { FEW_SPOTS, courtSummary, formatDate, spotsLabel } from "@/components/courts/stats";

export default function LocationDetail({ location: l }: { location: Location }) {
  const IndoorIcon = courtTypeIcons.indoor;
  const OutdoorIcon = courtTypeIcons.outdoor;
  const events = [...l.events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <article aria-labelledby={`detail-${l.slug}`} className="overflow-hidden rounded-3xl border border-line bg-card shadow-lift">
      {/* ===== Bild + Badge ===== */}
      <div className="relative">
        <ImageReveal image={l.image} sizes="(min-width: 1024px) 40vw, 100vw" framed={false} className="aspect-[4/3]" />
        <span className="absolute left-4 top-4 rounded-full bg-card/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent shadow-soft backdrop-blur-md">
          {l.badge}
        </span>
      </div>

      <div className="space-y-7 p-6 sm:p-8">
        {/* ===== Name, Ort, Stimmung ===== */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">„{l.nickname}“ · {l.region}</p>
          <h3 id={`detail-${l.slug}`} className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {l.name}
          </h3>
          <p className="mt-1 text-muted">
            <span aria-hidden="true">{l.flag}</span> {l.city}, {l.country}
          </p>
          <p className="mt-4 leading-relaxed">{l.mood}</p>
        </div>

        {/* ===== Court-Aufteilung als kleine Kacheln ===== */}
        <div>
          <h4 className="text-sm font-semibold">{courtSummary(l.courts)}</h4>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Court-Aufteilung">
            {Array.from({ length: l.courts.indoor }, (_, i) => (
              <li key={`in-${i}`} className="grid size-11 place-items-center rounded-xl bg-accent-2/15 text-accent-2" title="Indoor-Court">
                <IndoorIcon aria-hidden="true" className="size-5" />
                <span className="sr-only">Indoor-Court</span>
              </li>
            ))}
            {Array.from({ length: l.courts.outdoor }, (_, i) => (
              <li key={`out-${i}`} className="grid size-11 place-items-center rounded-xl bg-accent/15 text-accent" title="Outdoor-Court">
                <OutdoorIcon aria-hidden="true" className="size-5" />
                <span className="sr-only">Outdoor-Court</span>
              </li>
            ))}
          </ul>
          {l.courts.panorama > 0 && (
            <p className="mt-2 text-sm text-muted">
              davon {l.courts.panorama} Panorama-Court{l.courts.panorama > 1 ? "s" : ""} mit Glaswänden rundum
            </p>
          )}
        </div>

        {/* ===== Ausstattung ===== */}
        <div>
          <h4 className="text-sm font-semibold">Ausstattung</h4>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {l.amenities.map((a) => {
              const Icon = amenityIcons[a.icon];
              return (
                <li key={a.label} className="flex items-center gap-3 text-sm">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-olive/15 text-olive">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  {a.label}
                </li>
              );
            })}
          </ul>
        </div>

        {/* ===== Öffnungszeiten & Adresse ===== */}
        <div className="grid gap-3 rounded-2xl bg-surface p-4 text-sm">
          <p className="flex gap-3"><Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent-2" />{l.hours}</p>
          <address className="flex gap-3 not-italic"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent-2" />{l.address}</address>
        </div>

        {/* ===== Kommende Events ===== */}
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <CalendarDays aria-hidden="true" className="size-4 text-accent" /> Kommende Events
          </h4>
          <ul className="mt-3 space-y-3">
            {events.map((e) => (
              <li key={e.id} className="interactive-card rounded-2xl border border-line p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold tabular-nums">{formatDate(e.date)}</span>
                  <span className={`rounded-full px-2.5 py-1 font-medium ${eventTypeClasses[e.type]}`}>{eventTypeLabels[e.type]}</span>
                  <span className="text-muted">{levelLabels[e.level]}</span>
                </div>
                <p className="mt-2 font-semibold">{e.title}</p>
                <p className="mt-1 text-sm text-muted">{e.description}</p>
                {/* Wenige Plätze (unter 5) werden in Terrakotta hervorgehoben */}
                <p className={`mt-2 text-sm font-medium ${e.spotsLeft < FEW_SPOTS ? "text-accent" : "text-accent-2"}`}>{spotsLabel(e.spotsLeft)}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== Aktionen ===== */}
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/buchung?standort=${l.slug}`}
            className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-green px-6 font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
          >
            Court in {l.city} buchen
            <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/turniere-kurse" className="inline-flex min-h-12 items-center rounded-full border border-line px-6 font-semibold transition-colors hover:border-brand-green hover:text-brand-green">
            Alle Events
          </Link>
        </div>
      </div>
    </article>
  );
}