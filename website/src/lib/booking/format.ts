/**
 * format.ts – reine Formatierungsfunktionen (nur Intl, keine Bibliothek)
 *
 * Hier wird NICHT mit Zeitzonen gerechnet: Uhrzeiten kommen fertig beschriftet
 * von der API. Ein Datum "JJJJ-MM-TT" wird mit 12:00 UTC und timeZone "UTC"
 * formatiert – so kann kein Tag durch die Zeitzone des Besuchers verrutschen.
 */

const euroWhole = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const euroCents = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });

/** 2800 → "28 €", 2850 → "28,50 €" (glatte Beträge ohne ",00") */
export function formatEuro(cents: number): string {
  return (cents % 100 === 0 ? euroWhole : euroCents).format(cents / 100);
}

function utcNoon(date: string): Date {
  return new Date(`${date}T12:00:00Z`);
}

/** "2027-03-14" → "Sonntag, 14. März 2027" */
export function formatDateLong(date: string): string {
  return new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(utcNoon(date));
}

/** "2027-03-14" → "So., 14. März 2027" */
export function formatDateMedium(date: string): string {
  return new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(utcNoon(date));
}

/** Millisekunden → "4:59" (nie negativ) */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export type DayPart = "Vormittag" | "Nachmittag" | "Abend";

/** Startminute → Tagesabschnitt (vor 12 Uhr / 12–17 Uhr / ab 17 Uhr) */
export function dayPart(minute: number): DayPart {
  if (minute < 12 * 60) return "Vormittag";
  if (minute < 17 * 60) return "Nachmittag";
  return "Abend";
}

/** Heutiges Datum (JJJJ-MM-TT) in einer Zeitzone – nur für Anzeige-Hinweise, verbindlich entscheidet der Server */
export function todayIn(timeZone: string, now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Datum + n Tage (Kalenderrechnung) */
export function addDays(date: string, days: number): string {
  const d = utcNoon(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Liegen ALLE Tage des Buchungsfensters außerhalb der Saison? (→ Badge "Saisonpause") */
export function seasonClosedForWindow(
  season: { fromMonth: number; toMonth: number } | null,
  timeZone: string,
  horizonDays: number,
  now: Date,
): boolean {
  if (!season) return false;
  const today = todayIn(timeZone, now);
  for (let i = 0; i < horizonDays; i++) {
    const month = Number(addDays(today, i).slice(5, 7));
    if (month >= season.fromMonth && month <= season.toMonth) return false;
  }
  return true;
}

/** Schnelle E-Mail-Prüfung im Browser (verbindlich prüft PHP mit filter_var) */
export function looksLikeEmail(value: string): boolean {
  const v = value.trim();
  return v.length <= 190 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

/** Namensprüfung wie in PHP: 2–80 Zeichen, Buchstaben, Leerzeichen, Punkt, Bindestrich, Apostroph */
export function validName(value: string): boolean {
  const name = value.trim().replace(/\s+/g, " ");
  return name.length >= 2 && name.length <= 80 && /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u.test(name);
}