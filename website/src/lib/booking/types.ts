/**
 * types.ts – alle TypeScript-Typen des Buchungssystems
 *
 * Spiegelt 1:1 den Aufbau von src/data/catalog.json und die JSON-Antworten
 * der PHP-API. Enthält keine Logik.
 */
import type { PadelImage } from "@/components/padel/padelContent";

/* ===================== Katalog (src/data/catalog.json) ===================== */

export type CourtKind = "indoor" | "outdoor";

export interface CatalogCourt {
  id: string;
  name: string;
  kind: CourtKind;
  panorama: boolean;
}

export interface CatalogLocation {
  slug: string;
  name: string;
  nickname: string;
  city: string;
  country: string;
  flag: string;
  timezone: string;
  badge: string;
  open: string;
  close: string;
  hoursLabel: string;
  season: { fromMonth: number; toMonth: number } | null;
  image: PadelImage;
  courts: CatalogCourt[];
}

export interface PricingRules {
  outdoorCents: number;
  indoorCents: number;
  panoramaCents: number;
  primeTimeCents: number;
  primeTime: { weekdays: number[]; fromMinute: number; toMinute: number };
  racketCents: number;
  maxRackets: number;
  ballsCents: number;
  maxBalls: number;
}

export interface BookingRules {
  slotMinutes: number;
  cellMinutes: number;
  stepMinutes: number;
  horizonDays: number;
  leadMinutes: number;
  holdSeconds: number;
  maxOpenBookingsPerEmail: number;
}

export interface Catalog {
  version: number;
  rules: BookingRules;
  pricing: PricingRules;
  locations: CatalogLocation[];
}

/* ===================== Öffentliche API ===================== */

export type SlotStatus = "free" | "mine" | "held" | "booked";

export interface ApiSlot {
  start: string;
  end: string;
  time: string;
  endTime: string;
  minute: number;
  status: SlotStatus;
  expiresAt: string | null;
  priceCents: number;
  prime: boolean;
}

export interface AvailabilityResponse {
  courtId: string;
  date: string;
  timezoneLabel: string;
  closedReason: string | null;
  serverTime: string;
  version: number;
  slots: ApiSlot[];
}

export interface DayInfo {
  date: string;
  weekday: string;
  day: number;
  month: string;
  open: boolean;
  bookable: boolean;
  reason: string | null;
  free: number;
  total: number;
}

export interface DaysResponse {
  courtId: string;
  timezoneLabel: string;
  days: DayInfo[];
}

export interface SummaryResponse {
  location: string;
  seasonClosed: boolean;
  todayOpen: boolean;
  courts: { courtId: string; freeToday: number; remainingToday: number }[];
}

export interface HoldInfo {
  holdId: string;
  holdToken: string;
  expiresAt: string;
  courtId: string;
  date: string;
  time: string;
  endTime: string;
  start: string;
  end: string;
  priceCents: number;
  prime: boolean;
}

export interface Suggestion {
  courtId: string;
  courtName: string;
  date: string;
  time: string;
  endTime: string;
  start: string;
  priceCents: number;
}

export interface PriceParts {
  baseCents: number;
  panoramaCents: number;
  primeCents: number;
  racketsCents: number;
  ballsCents: number;
  totalCents: number;
}

export interface BookingResult {
  code: string;
  status: "confirmed" | "cancelled";
  bookingType: "court" | "event";
  eventId?: string | null;
  eventTitle?: string | null;
  eventType?: string | null;
  locationSlug: string;
  locationName: string;
  city: string;
  courtId: string;
  courtName: string;
  courtKind: CourtKind;
  panorama: boolean;
  date: string;
  dateLabel: string;
  time: string;
  endTime: string;
  timezoneLabel: string;
  fullName: string;
  email: string;
  rackets: number;
  balls: number;
  price: PriceParts;
  createdAt: string;
}

export interface BookRequest {
  holdId: string;
  holdToken: string;
  courtId?: string;
  date?: string;
  time?: string;
  durationMinutes?: number;
  eventId?: string;
  eventTitle?: string;
  eventType?: string;
  fullName: string;
  email: string;
  rackets: number;
  balls: number;
  consent: boolean;
  idempotencyKey: string;
}

/** Fehlercodes der API + NETWORK (nur im Browser: Server nicht erreichbar) */
export type ApiErrorCode =
  | "SLOT_TAKEN"
  | "HOLD_EXPIRED"
  | "LIMIT_REACHED"
  | "RATE_LIMITED"
  | "OUTSIDE_HOURS"
  | "VALIDATION"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "SERVER_ERROR"
  | "NETWORK";

/* ===================== Admin-API ===================== */

export interface AdminBooking {
  id: number;
  code: string;
  status: "confirmed" | "cancelled";
  bookingType: "court" | "event";
  eventTitle?: string | null;
  eventType?: string | null;
  fullName: string;
  emailMasked: string;
  locationSlug: string;
  locationName: string;
  city: string;
  courtName: string;
  date: string;
  dateShort: string;
  time: string;
  endTime: string;
  rackets: number;
  balls: number;
  priceCents: number;
  createdAt: string;
  createdLabel: string;
}

export interface AdminStats {
  date: string;
  createdToday: number;
  confirmedTotal: number;
  bookedHours: number;
  activeHolds: number;
  utilization: { slug: string; city: string; open: boolean; percent: number }[];
}

export type OccupancyCell =
  | null
  | { type: "hold" }
  | { type: "booked"; bookingId: number; name: string; code: string; startsHere: boolean };

export interface OccupancyEvent {
  id: string;
  title: string;
  registrations: number;
  startsHere: boolean;
}

export interface OccupancyResponse {
  location: string;
  date: string;
  open: boolean;
  reason: string | null;
  timezoneLabel: string;
  courts: { id: string; name: string }[];
  rows: { time: string; cells: OccupancyCell[]; events?: OccupancyEvent[] }[];
}