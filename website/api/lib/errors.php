<?php
declare(strict_types=1);
/**
 * lib/errors.php – einheitliche Fehlercodes der API
 *
 * Jeder Fehler hat einen festen CODE (für das Frontend), einen HTTP-Status
 * und eine neutrale deutsche Standardmeldung. Das Frontend übersetzt die
 * Codes selbst (src/lib/booking/errors.ts). Technische Details landen NIE
 * in der Antwort, sondern nur im Server-Log.
 */

final class PvError extends RuntimeException
{
    /** @param array<string, mixed> $details unbedenkliche Zusatzdaten (z. B. Vorschläge, Feldname) */
    public function __construct(
        public readonly string $errorCode,
        public readonly int $httpStatus = 400,
        string $message = '',
        public readonly array $details = [],
    ) {
        parent::__construct($message !== '' ? $message : pv_default_message($errorCode));
    }
}

function pv_default_message(string $code): string
{
    return match ($code) {
        'SLOT_TAKEN'    => 'Dieser Slot wurde gerade eben vergeben.',
        'HOLD_EXPIRED'  => 'Deine Reservierung ist abgelaufen.',
        'LIMIT_REACHED' => 'Mit dieser E-Mail-Adresse sind bereits 2 offene Buchungen vorhanden.',
        'RATE_LIMITED'  => 'Zu viele Anfragen in kurzer Zeit – bitte höchstens 1 Minute warten.',
        'OUTSIDE_HOURS' => 'Dieser Zeitpunkt ist nicht buchbar.',
        'VALIDATION'    => 'Bitte prüfe deine Eingaben.',
        'NOT_FOUND'     => 'Nicht gefunden.',
        'UNAUTHORIZED'  => 'Nicht berechtigt.',
        'METHOD'        => 'Methode nicht erlaubt.',
        default         => 'Die Buchung ist gerade nicht erreichbar.',
    };
}

function pv_default_status(string $code): int
{
    return match ($code) {
        'SLOT_TAKEN', 'HOLD_EXPIRED', 'LIMIT_REACHED' => 409,
        'RATE_LIMITED'  => 429,
        'OUTSIDE_HOURS', 'VALIDATION' => 422,
        'NOT_FOUND'     => 404,
        'UNAUTHORIZED'  => 401,
        'METHOD'        => 405,
        default         => 500,
    };
}