/**
 * StatsBand.tsx – vier große Kennzahlen unter dem Hero
 * Server Component: Die Zahlen werden hier aus den Daten BERECHNET
 * (stats.ts) und als fertige Werte an die kleine Client-Insel StatsCounter
 * übergeben, die nur das Hochzählen animiert.
 */
import Reveal from "@/components/ui/Reveal";
import StatsCounter from "@/components/courts/StatsCounter";
import { locations, statsLabels } from "@/components/courts/courtsContent";
import { countCountries, countEvents, totalCourts } from "@/components/courts/stats";

export default function StatsBand() {
  const stats = [
    { value: locations.length, label: statsLabels.locations },
    { value: countCountries(locations), label: statsLabels.countries },
    { value: totalCourts(locations), label: statsLabels.courts },
    { value: countEvents(locations), label: statsLabels.events },
  ];
  return (
    <section aria-label="PadelVision in Zahlen" className="border-b border-line bg-surface">
      {/* <dl>: semantisch eine Liste aus Begriff (Label) und Wert (Zahl) */}
      <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-5 py-14 sm:px-8 md:grid-cols-4 md:py-16">
        {stats.map((s, i) => (
          // flex-col-reverse: Im HTML steht korrekt erst <dt> (Begriff), dann <dd> (Wert).
          // Optisch soll die große Zahl aber OBEN stehen – daher die umgekehrte Reihenfolge.
          <Reveal key={s.label} delay={i * 100} className="flex flex-col-reverse items-center text-center">
            <dt className="mt-3 text-sm font-medium uppercase tracking-[0.18em] text-muted">{s.label}</dt>
            <dd className="text-[clamp(2.75rem,6vw,4.5rem)] font-semibold leading-none tracking-tight text-accent">
              <StatsCounter value={s.value} />
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}