<?php
declare(strict_types=1);
/**
 * lib/time.php – Zeitzonen (UTC ↔ Ortszeit des Standorts)
 *
 *  - Gespeichert wird IMMER UTC (DATETIME in MySQL).
 *  - Gerechnet und angezeigt wird in der ORTSZEIT des Standorts.
 *  - DateTimeImmutable + DateTimeZone kennen die Sommerzeit: "18:00 in Athen"
 *    wird im Winter zu 16:00 UTC, im Sommer zu 15:00 UTC.
 *  - Das Frontend rechnet NICHT selbst – es bekommt fertige Beschriftungen.
 */

/** Test-Zeitpunkt (nur api/tests/run.php) – statische Variable statt globaler Variable */
function pv_now_override(?DateTimeImmutable $value = null, bool $write = false): ?DateTimeImmutable
{
    static $override = null;
    if ($write) {
        $override = $value;
    }
    return $override;
}

function pv_set_now(?DateTimeImmutable $now): void
{
    pv_now_override($now, true);
}

/** Aktueller Zeitpunkt in UTC */
function pv_now(): DateTimeImmutable
{
    $override = pv_now_override();
    if ($override instanceof DateTimeImmutable) {
        return $override->setTimezone(new DateTimeZone('UTC'));
    }
    return new DateTimeImmutable('now', new DateTimeZone('UTC'));
}

function pv_tz(string $name): DateTimeZone
{
    return new DateTimeZone($name);
}

/** Heutiges Datum (Y-m-d) in der Zeitzone */
function pv_local_today(DateTimeZone $tz, ?DateTimeImmutable $now = null): string
{
    return ($now ?? pv_now())->setTimezone($tz)->format('Y-m-d');
}

/** Streng prüfen (kein 2027-02-31) */
function pv_is_valid_date(string $date): bool
{
    $d = DateTimeImmutable::createFromFormat('!Y-m-d', $date, new DateTimeZone('UTC'));
    return $d !== false && $d->format('Y-m-d') === $date;
}

/** Datum + n Tage (reine Kalenderrechnung) */
function pv_add_days(string $date, int $days): string
{
    $d = new DateTimeImmutable($date . ' 12:00:00', new DateTimeZone('UTC'));
    return $d->modify(($days >= 0 ? '+' : '') . $days . ' days')->format('Y-m-d');
}

/** "07:00" → 420, "24:00" → 1440 */
function pv_hhmm_to_minutes(string $hhmm): int
{
    [$h, $m] = array_map('intval', explode(':', $hhmm));
    return $h * 60 + $m;
}

/** 420 → "07:00" */
function pv_minutes_to_hhmm(int $minutes): string
{
    return sprintf('%02d:%02d', intdiv($minutes, 60), $minutes % 60);
}

/**
 * Ortszeit (Datum + Minuten seit Mitternacht) → UTC.
 * Die Uhrzeit wird als TEXT in der Zeitzone gebaut, statt Minuten zu addieren:
 * So bedeutet 18:00 wirklich "Wanduhr 18:00" – auch am Tag der Zeitumstellung.
 * 1440 (= 24:00) wird zu 00:00 des Folgetags.
 */
function pv_local_to_utc(string $date, int $minute, DateTimeZone $tz): DateTimeImmutable
{
    if ($minute >= 1440) {
        $date = pv_add_days($date, intdiv($minute, 1440));
        $minute %= 1440;
    }
    $local = new DateTimeImmutable(sprintf('%s %02d:%02d:00', $date, intdiv($minute, 60), $minute % 60), $tz);
    return $local->setTimezone(new DateTimeZone('UTC'));
}

/** UTC → [Datum, Minute seit Mitternacht] in Ortszeit */
function pv_utc_to_local(DateTimeImmutable $utc, DateTimeZone $tz): array
{
    $local = $utc->setTimezone($tz);
    return [$local->format('Y-m-d'), ((int) $local->format('G')) * 60 + (int) $local->format('i')];
}

function pv_db_time(DateTimeImmutable $t): string
{
    return $t->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
}

function pv_db_time_ms(DateTimeImmutable $t): string
{
    return $t->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s.v');
}

function pv_from_db(string $value): DateTimeImmutable
{
    return new DateTimeImmutable($value, new DateTimeZone('UTC'));
}

/** ISO-8601 in UTC, z. B. 2027-03-14T17:00:00Z */
function pv_iso(DateTimeImmutable $t): string
{
    return $t->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z');
}

function pv_iso_ms(DateTimeImmutable $t): string
{
    return $t->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s.v\Z');
}

function pv_weekday_short(string $date): string
{
    $n = (int) (new DateTimeImmutable($date . ' 12:00:00', new DateTimeZone('UTC')))->format('N');
    return ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][$n - 1];
}

/** "Sa 14.03." */
function pv_date_short(string $date): string
{
    return pv_weekday_short($date) . ' ' . (new DateTimeImmutable($date . ' 12:00:00', new DateTimeZone('UTC')))->format('d.m.');
}

/** "Samstag, 14.03.2027" */
function pv_date_long(string $date): string
{
    $d = new DateTimeImmutable($date . ' 12:00:00', new DateTimeZone('UTC'));
    $names = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    return $names[((int) $d->format('N')) - 1] . ', ' . $d->format('d.m.Y');
}

/**
 * Hinweis zur Zeitzone relativ zu deutscher Zeit, gültig für das Datum (Sommerzeit!):
 * "Alle Zeiten in Ortszeit Santorini (deutsche Zeit +1 Std.)"
 */
function pv_tz_label(string $city, DateTimeZone $tz, string $date): string
{
    $at = new DateTimeImmutable($date . ' 12:00:00', new DateTimeZone('UTC'));
    $diff = intdiv($tz->getOffset($at) - (new DateTimeZone('Europe/Berlin'))->getOffset($at), 3600);
    $suffix = $diff === 0 ? 'wie deutsche Zeit' : sprintf('deutsche Zeit %s%d Std.', $diff > 0 ? '+' : '−', abs($diff));
    return sprintf('Alle Zeiten in Ortszeit %s (%s)', $city, $suffix);
}