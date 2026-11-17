<?php
declare(strict_types=1);
/**
 * lib/validation.php – verbindliche Prüfung aller Eingaben
 *
 * Der Browser prüft auch (schnelles Feedback) – entscheidend ist aber diese
 * Prüfung. Fehler werfen PvError('VALIDATION') mit dem Feldnamen in details,
 * damit das Frontend die Meldung direkt am Feld anzeigen kann.
 */

function pv_invalid(string $field, string $message): never
{
    throw new PvError('VALIDATION', 422, $message, ['field' => $field]);
}

function pv_str(array $body, string $key): string
{
    $v = $body[$key] ?? '';
    return is_string($v) ? $v : '';
}

function pv_int_range(array $body, string $key, int $min, int $max): int
{
    $v = $body[$key] ?? null;
    if (!is_int($v) || $v < $min || $v > $max) {
        pv_invalid($key, "Bitte einen Wert von $min bis $max wählen.");
    }
    return $v;
}

/** Name: 2–80 Zeichen, Buchstaben (inkl. Akzente), Leerzeichen, Punkt, Bindestrich, Apostroph */
function pv_v_name(string $name): string
{
    $name = trim((string) preg_replace('/\s+/u', ' ', $name));
    $len = mb_strlen($name);
    if ($len < 2 || $len > 80) {
        pv_invalid('fullName', 'Bitte gib deinen Namen ein (2–80 Zeichen).');
    }
    if (!preg_match("/^[\\p{L}\\p{M}][\\p{L}\\p{M}' .\\-]*$/u", $name)) {
        pv_invalid('fullName', 'Der Name enthält nicht erlaubte Zeichen.');
    }
    return $name;
}

/** @return array{0: string, 1: string} [E-Mail getrimmt, normalisiert (klein)] */
function pv_v_email(string $email): array
{
    $email = trim($email);
    if (strlen($email) > 190 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        pv_invalid('email', 'Bitte gib eine gültige E-Mail-Adresse ein.');
    }
    return [$email, mb_strtolower($email)];
}

function pv_v_uuid(string $value, string $field): string
{
    $value = strtolower($value);
    if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/', $value)) {
        pv_invalid($field, 'Ungültige Kennung.');
    }
    return $value;
}

function pv_v_token(string $value): string
{
    if (!preg_match('/^[0-9a-f]{64}$/', $value)) {
        pv_invalid('holdToken', 'Ungültiger Reservierungsschlüssel.');
    }
    return $value;
}

/** Court muss im Katalog existieren */
function pv_v_court(string $courtId): array
{
    $found = preg_match('/^[a-z0-9-]{1,40}$/', $courtId) ? pv_court($courtId) : null;
    if ($found === null) {
        throw new PvError('NOT_FOUND', 404, 'Unbekannter Court.');
    }
    return $found;
}

function pv_v_location(string $slug): array
{
    $location = preg_match('/^[a-z0-9-]{1,40}$/', $slug) ? pv_location($slug) : null;
    if ($location === null) {
        throw new PvError('NOT_FOUND', 404, 'Unbekannter Standort.');
    }
    return $location;
}

function pv_v_date(string $date): string
{
    if (!pv_is_valid_date($date)) {
        pv_invalid('date', 'Ungültiges Datum.');
    }
    return $date;
}

/** "18:00" → 1080 */
function pv_v_time(string $time): int
{
    if (!preg_match('/^([01]\d|2[0-3]):([0-5]\d)$/', $time)) {
        pv_invalid('time', 'Ungültige Uhrzeit.');
    }
    return pv_hhmm_to_minutes($time);
}

/** Buchungscode PV-XXXXXX (ohne 0/O/1/I) – falsches Format = dieselbe neutrale Meldung */
function pv_v_code(string $code): string
{
    $code = strtoupper(trim($code));
    if (!preg_match('/^PV-[A-HJ-NP-Z2-9]{6}$/', $code)) {
        throw new PvError('NOT_FOUND', 404, 'Wir konnten keine passende Buchung finden.');
    }
    return $code;
}