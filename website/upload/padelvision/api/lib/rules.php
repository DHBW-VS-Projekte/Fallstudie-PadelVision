<?php
declare(strict_types=1);
/**
 * lib/rules.php – Buchungsregeln (verbindlich, serverseitig)
 *
 *  - Slot = 90 Minuten, Start zur vollen/halben Stunde
 *  - Slot komplett in den Öffnungszeiten (7–23 Uhr → letzter Start 21:30)
 *  - buchbar: heute bis heute + 13 Tage (Ortszeit)
 *  - Starts in der Vergangenheit oder in < 15 Minuten sind nicht buchbar
 *  - Saisonbetrieb (Porto-Vecchio): nur April–Oktober
 *
 * ZELLEN-MODELL: Eine Buchung um 10:00 belegt die Zellen 10:00, 10:30, 11:00.
 * Ein Start um 09:00 bräuchte 09:00, 09:30, 10:00 → kollidiert an 10:00.
 * Ein Start um 11:00 bräuchte 11:00, 11:30, 12:00 → kollidiert an 11:00.
 * 11:30 ist wieder frei. So blockiert jede Buchung automatisch alle
 * überlappenden 90-Minuten-Slots – ohne Sonderlogik.
 */

function pv_cells_per_slot(): int
{
    $r = pv_rules();
    return intdiv($r['slotMinutes'], $r['cellMinutes']);
}

/** [Öffnung, Schließung] in Minuten */
function pv_opening_minutes(array $location): array
{
    return [pv_hhmm_to_minutes($location['open']), pv_hhmm_to_minutes($location['close'])];
}

/** Alle gültigen Startminuten eines Tages */
function pv_slot_starts(array $location): array
{
    $r = pv_rules();
    [$open, $close] = pv_opening_minutes($location);
    $starts = [];
    for ($m = $open; $m + $r['slotMinutes'] <= $close; $m += $r['stepMinutes']) {
        $starts[] = $m;
    }
    return $starts;
}

/** @return array{0: bool, 1: string|null} [geöffnet, Grund falls geschlossen] */
function pv_day_open(array $location, string $date): array
{
    $season = $location['season'] ?? null;
    if (is_array($season)) {
        $month = (int) substr($date, 5, 2);
        if ($month < (int) $season['fromMonth'] || $month > (int) $season['toMonth']) {
            return [false, 'Saisonpause – wir sind ab April wieder für dich da'];
        }
    }
    return [true, null];
}

/** heute … heute + 13 in Ortszeit */
function pv_booking_dates(array $location, ?DateTimeImmutable $now = null): array
{
    $today = pv_local_today(pv_tz($location['timezone']), $now);
    $dates = [];
    for ($i = 0; $i < pv_rules()['horizonDays']; $i++) {
        $dates[] = pv_add_days($today, $i);
    }
    return $dates;
}

/** frühester buchbarer Start (jetzt + 15 Minuten) */
function pv_earliest_start(?DateTimeImmutable $now = null): DateTimeImmutable
{
    return ($now ?? pv_now())->modify('+' . pv_rules()['leadMinutes'] . ' minutes');
}

/**
 * Prüft einen Slot vollständig, sonst PvError OUTSIDE_HOURS.
 * @return DateTimeImmutable Start in UTC
 */
function pv_validate_slot(array $location, string $date, int $minute, ?DateTimeImmutable $now = null): DateTimeImmutable
{
    $now ??= pv_now();
    if (!in_array($date, pv_booking_dates($location, $now), true)) {
        throw new PvError('OUTSIDE_HOURS', 422, 'Dieses Datum liegt außerhalb des Buchungszeitraums (heute bis in 13 Tagen).');
    }
    [$open, $reason] = pv_day_open($location, $date);
    if (!$open) {
        throw new PvError('OUTSIDE_HOURS', 422, (string) $reason);
    }
    if (!in_array($minute, pv_slot_starts($location), true)) {
        throw new PvError('OUTSIDE_HOURS', 422, 'Diese Startzeit liegt außerhalb der Öffnungszeiten.');
    }
    $start = pv_local_to_utc($date, $minute, pv_tz($location['timezone']));
    if ($start < pv_earliest_start($now)) {
        throw new PvError('OUTSIDE_HOURS', 422, 'Diese Startzeit ist schon vorbei oder zu knapp.');
    }
    return $start;
}

/**
 * Die drei UTC-Zellen einer Buchung (MySQL-DATETIME-Strings).
 * In UTC gerechnet: 30 Minuten sind immer 30 echte Minuten.
 * @return list<string>
 */
function pv_cells_for(DateTimeImmutable $startUtc): array
{
    $cells = [];
    $step = pv_rules()['cellMinutes'];
    for ($i = 0; $i < pv_cells_per_slot(); $i++) {
        $cells[] = pv_db_time($startUtc->modify('+' . ($i * $step) . ' minutes'));
    }
    return $cells;
}

/** Prime Time: Mo–Fr, Start 17:00 bis einschließlich 20:30 Ortszeit */
function pv_is_prime(string $date, int $minute): bool
{
    $p = pv_pricing()['primeTime'];
    $weekday = (int) (new DateTimeImmutable($date . ' 12:00:00', new DateTimeZone('UTC')))->format('N');
    return in_array($weekday, $p['weekdays'], true) && $minute >= $p['fromMinute'] && $minute <= $p['toMinute'];
}