/**
 * errors.ts – übersetzt API-Fehlercodes in freundliche deutsche Meldungen
 *
 * Reine Funktionen ohne React (wird mit node --test getestet).
 */
import type { ApiErrorCode } from "@/lib/booking/types";

export const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  SLOT_TAKEN: "Schade – dieser Slot wurde gerade eben vergeben.",
  HOLD_EXPIRED: "Deine Reservierung ist abgelaufen. Wähle die Zeit einfach noch einmal.",
  LIMIT_REACHED: "Mit dieser E-Mail-Adresse hast du schon 2 offene Buchungen. Mehr sind in der Demo nicht möglich.",
  RATE_LIMITED: "Zu viele Anfragen in kurzer Zeit. Warte kurz und versuche es dann noch einmal.",
  OUTSIDE_HOURS: "Diese Zeit ist leider nicht buchbar.",
  VALIDATION: "Bitte prüfe deine Eingaben.",
  NOT_FOUND: "Wir konnten keine passende Buchung finden.",
  UNAUTHORIZED: "Bitte melde dich an.",
  SERVER_ERROR: "Die Buchung ist gerade nicht erreichbar.",
  NETWORK: "Keine Verbindung zum Server. Prüfe dein Internet und versuche es erneut.",
};

const KNOWN = new Set<string>(Object.keys(ERROR_MESSAGES));

/** Typwächter: ist der Text einer unserer Fehlercodes? */
function isErrorCode(code: string): code is ApiErrorCode {
  return KNOWN.has(code);
}

/** Unbekannte Codes (z. B. METHOD) werden zu SERVER_ERROR */
export function toErrorCode(code: string): ApiErrorCode {
  return isErrorCode(code) ? code : "SERVER_ERROR";
}

/**
 * Freundliche Meldung. Bei einigen Codes ist die Server-Meldung genauer
 * (z. B. "Diese Startzeit ist schon vorbei") und wird dann bevorzugt.
 */
export function errorMessage(code: ApiErrorCode, serverMessage?: string): string {
  const preferServer: ApiErrorCode[] = ["OUTSIDE_HOURS", "VALIDATION", "UNAUTHORIZED", "RATE_LIMITED"];
  if (serverMessage && preferServer.includes(code)) return serverMessage;
  return ERROR_MESSAGES[code];
}