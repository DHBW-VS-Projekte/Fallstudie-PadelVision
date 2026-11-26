/**
 * api.ts – fetch-Wrapper für die PHP-API mit einheitlichen Fehlercodes
 *
 * - Adresse über NEXT_PUBLIC_API_BASE (Standard "/api" = gleiche Domain).
 *   Lokal z. B. "http://localhost/api" (XAMPP), gesetzt in .env.development.local.
 * - credentials: "include": Geräte-Cookie (pv_device) und Admin-Session-Cookie
 *   werden auch im Dev-Modus (anderer Port) mitgeschickt.
 * - Antworten haben immer die Form { ok, data } bzw. { ok: false, code, message, details }.
 *   Fehler werden als ApiError geworfen – nie als unklare Exception.
 */
import { toErrorCode } from "@/lib/booking/errors";
import type {
  AdminBooking, AdminStats, ApiErrorCode, AvailabilityResponse, BookingResult, BookRequest,
  DaysResponse, HoldInfo, OccupancyResponse, SummaryResponse,
} from "@/lib/booking/types";

export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "/api").replace(/\/+$/, "");

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details: Record<string, unknown>;
  constructor(code: ApiErrorCode, message: string, status: number, details: Record<string, unknown> = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/** Beliebigen Fehler in einen ApiError umwandeln */
export function asApiError(error: unknown): ApiError {
  return error instanceof ApiError ? error : new ApiError("NETWORK", "", 0);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { credentials: "include", ...init });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("NETWORK", "Keine Verbindung zum Server.", 0);
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    // z. B. PHP-Fehlerseite oder 404-HTML des Hosters
    throw new ApiError("SERVER_ERROR", "Die Buchung ist gerade nicht erreichbar.", response.status);
  }
  if (!isRecord(body) || typeof body.ok !== "boolean") {
    throw new ApiError("SERVER_ERROR", "Die Buchung ist gerade nicht erreichbar.", response.status);
  }
  if (!body.ok) {
    const details = isRecord(body.details) ? body.details : {};
    throw new ApiError(toErrorCode(String(body.code ?? "")), String(body.message ?? ""), response.status, details);
  }
  return body.data as T;
}

function get<T>(path: string, signal?: AbortSignal, cache: RequestCache = "no-store"): Promise<T> {
  return request<T>(path, { method: "GET", signal, cache });
}

function post<T>(path: string, payload: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}

const enc = encodeURIComponent;

export const api = {
  version: (signal?: AbortSignal) => get<{ version: number }>("/version.php", signal).then((d) => d.version),
  availability: (courtId: string, date: string, signal?: AbortSignal) =>
    get<AvailabilityResponse>(`/availability.php?court=${enc(courtId)}&date=${enc(date)}`, signal),
  days: (courtId: string, signal?: AbortSignal) => get<DaysResponse>(`/days.php?court=${enc(courtId)}`, signal),
  summary: (location: string, signal?: AbortSignal) => get<SummaryResponse>(`/summary.php?location=${enc(location)}`, signal),
  hold: (courtId: string, date: string, time: string, previousHold?: Pick<HoldInfo, "holdId" | "holdToken">) =>
    post<HoldInfo>("/hold.php", { courtId, date, time, previousHold }),
  release: (holdId: string, holdToken: string) => post<{ released: boolean }>("/release.php", { holdId, holdToken }),
  book: (payload: BookRequest) => post<BookingResult>("/book.php", payload),
  cancel: (code: string, email: string) => post<BookingResult>("/cancel.php", { code, email }),
  admin: {
    session: () => get<{ loggedIn: boolean }>("/admin/session.php"),
    login: (password: string) => post<{ loggedIn: boolean }>("/admin/login.php", { password }),
    logout: () => post<{ loggedIn: boolean }>("/admin/logout.php", {}),
    bookings: (signal?: AbortSignal) => get<{ bookings: AdminBooking[]; version: number }>("/admin/bookings.php", signal),
    stats: (date: string, signal?: AbortSignal) => get<AdminStats>(`/admin/stats.php?date=${enc(date)}`, signal),
    occupancy: (location: string, date: string, signal?: AbortSignal) =>
      get<OccupancyResponse>(`/admin/occupancy.php?location=${enc(location)}&date=${enc(date)}`, signal),
    cancel: (bookingId: number) => post<{ cancelled: boolean }>("/admin/cancel.php", { bookingId }),
    reset: () => post<{ reset: boolean }>("/admin/reset.php", { confirm: "RESET" }),
  },
};