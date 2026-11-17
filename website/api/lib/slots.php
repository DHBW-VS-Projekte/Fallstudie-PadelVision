<?php
declare(strict_types=1);
/**
 * lib/slots.php – Belegung berechnen (Kacheln, Tagesleiste, Court-Übersicht, Vorschläge)
 *
 * EINE Abfrage lädt alle Zellen der betroffenen Courts im Zeitraum (Index
 * idx_cells_lookup). Danach wird nur noch in PHP gerechnet – keine Schleifen
 * mit Datenbankzugriffen.
 *
 * Status eines 90-Minuten-Slots aus Sicht des anfragenden Geräts:
 *  - booked: mindestens eine der 3 Zellen ist bestätigt
 *  - held:   mindestens eine Zelle ist von einem ANDEREN Gerät reserviert (nicht abgelaufen)
 *  - mine:   alle 3 Zellen gehören zu genau MEINEM Hold
 *  - free:   sonst. Abgelaufene Holds zählen als frei. Überschneidet sich nur
 *            MEIN eigener Hold teilweise, ist der Slot für mich frei: Ein Klick
 *            verschiebt meinen Hold (create_hold löscht meinen alten zuerst).
 */

/** @return array<string, array<string, array<string, mixed>>> court_id → cell_start → Zeile */
function pv_load_cells(PDO $pdo, array $courtIds, DateTimeImmutable $fromUtc, DateTimeImmutable $toUtc): array
{
    if ($courtIds === []) {
        return [];
    }
    // Nur die PLATZHALTER werden zusammengesetzt – alle Werte laufen über execute()
    $in = implode(',', array_fill(0, count($courtIds), '?'));
    $stmt = $pdo->prepare(
        "SELECT court_id, cell_start, status, hold_id, device_id, expires_at
           FROM slot_cells
          WHERE court_id IN ($in) AND cell_start >= ? AND cell_start < ?"
    );
    $stmt->execute([...array_values($courtIds), pv_db_time($fromUtc), pv_db_time($toUtc)]);
    $map = [];
    foreach ($stmt as $row) {
        $map[(string) $row['court_id']][(string) $row['cell_start']] = $row;
    }
    return $map;
}

/** UTC-Grenzen eines Ortstages [00:00, 24:00) */
function pv_day_range(array $location, string $date): array
{
    $tz = pv_tz($location['timezone']);
    return [pv_local_to_utc($date, 0, $tz), pv_local_to_utc($date, 1440, $tz)];
}

/** @return array{status: string, expiresAt: ?DateTimeImmutable} */
function pv_slot_status(array $courtCells, array $cellKeys, string $deviceId, DateTimeImmutable $now): array
{
    $booked = false;
    $foreignUntil = null;
    $mineIds = [];
    $mineUntil = null;
    foreach ($cellKeys as $key) {
        $row = $courtCells[$key] ?? null;
        if ($row === null) {
            continue;
        }
        if ($row['status'] === 'confirmed') {
            $booked = true;
            continue;
        }
        $expires = pv_from_db((string) $row['expires_at']);
        if ($expires <= $now) {
            continue; // abgelaufener Hold blockiert nicht mehr
        }
        if ($row['device_id'] === $deviceId) {
            $mineIds[] = (string) $row['hold_id'];
            $mineUntil = $expires;
        } elseif ($foreignUntil === null || $expires > $foreignUntil) {
            $foreignUntil = $expires; // frei erst, wenn ALLE fremden Holds abgelaufen sind
        }
    }
    if ($booked) {
        return ['status' => 'booked', 'expiresAt' => null];
    }
    if ($foreignUntil !== null) {
        return ['status' => 'held', 'expiresAt' => $foreignUntil];
    }
    if (count($mineIds) === count($cellKeys) && count(array_unique($mineIds)) === 1) {
        return ['status' => 'mine', 'expiresAt' => $mineUntil];
    }
    return ['status' => 'free', 'expiresAt' => null];
}

/**
 * Alle noch buchbaren Slots eines Courts an einem Ortstag.
 * Vergangene Starts und Starts in < 15 Minuten werden AUSGEBLENDET.
 */
function pv_day_slots(array $location, array $court, string $date, array $cellsByCourt, string $deviceId, DateTimeImmutable $now): array
{
    if (!pv_day_open($location, $date)[0]) {
        return [];
    }
    $tz = pv_tz($location['timezone']);
    $earliest = pv_earliest_start($now);
    $courtCells = $cellsByCourt[$court['id']] ?? [];
    $len = pv_rules()['slotMinutes'];
    $slots = [];
    foreach (pv_slot_starts($location) as $minute) {
        $start = pv_local_to_utc($date, $minute, $tz);
        if ($start < $earliest) {
            continue;
        }
        $state = pv_slot_status($courtCells, pv_cells_for($start), $deviceId, $now);
        $price = pv_court_price($court, $date, $minute);
        $slots[] = [
            'start' => pv_iso($start),
            'end' => pv_iso($start->modify('+' . $len . ' minutes')),
            'time' => pv_minutes_to_hhmm($minute),
            'endTime' => pv_minutes_to_hhmm(($minute + $len) % 1440),
            'minute' => $minute,
            'status' => $state['status'],
            'expiresAt' => $state['expiresAt'] ? pv_iso($state['expiresAt']) : null,
            'priceCents' => array_sum($price),
            'prime' => $price['primeCents'] > 0,
        ];
    }
    return $slots;
}

function pv_availability(PDO $pdo, array $location, array $court, string $date, string $deviceId): array
{
    $now = pv_now();
    [$from, $to] = pv_day_range($location, $date);
    $cells = pv_load_cells($pdo, [$court['id']], $from, $to);
    [$open, $reason] = pv_day_open($location, $date);
    return [
        'courtId' => $court['id'],
        'date' => $date,
        'timezoneLabel' => pv_tz_label($location['city'], pv_tz($location['timezone']), $date),
        'closedReason' => $open ? null : $reason,
        'serverTime' => pv_iso($now),
        'slots' => pv_day_slots($location, $court, $date, $cells, $deviceId, $now),
    ];
}

/** 14-Tage-Übersicht eines Courts – EINE Abfrage für alle 14 Tage */
function pv_days_overview(PDO $pdo, array $location, array $court, string $deviceId): array
{
    $now = pv_now();
    $dates = pv_booking_dates($location, $now);
    [$from] = pv_day_range($location, $dates[0]);
    [, $to] = pv_day_range($location, $dates[count($dates) - 1]);
    $cells = pv_load_cells($pdo, [$court['id']], $from, $to);
    $months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    $days = [];
    foreach ($dates as $date) {
        [$open, $reason] = pv_day_open($location, $date);
        $slots = pv_day_slots($location, $court, $date, $cells, $deviceId, $now);
        $free = count(array_filter($slots, static fn (array $s): bool => $s['status'] === 'free' || $s['status'] === 'mine'));
        if ($open && $slots === []) {
            $reason = 'Heute keine Startzeiten mehr';
        } elseif ($open && $free === 0) {
            $reason = 'Ausgebucht';
        }
        $days[] = [
            'date' => $date,
            'weekday' => pv_weekday_short($date),
            'day' => (int) substr($date, 8, 2),
            'month' => $months[((int) substr($date, 5, 2)) - 1],
            'open' => $open,
            'bookable' => $open && $free > 0,
            'reason' => $reason,
            'free' => $free,
            'total' => count(pv_slot_starts($location)),
        ];
    }
    return [
        'courtId' => $court['id'],
        'timezoneLabel' => pv_tz_label($location['city'], pv_tz($location['timezone']), $dates[0]),
        'days' => $days,
    ];
}

/** "Heute noch X Slots frei" je Court + Saisonpause-Kennzeichen */
function pv_location_summary(PDO $pdo, array $location, string $deviceId): array
{
    $now = pv_now();
    $dates = pv_booking_dates($location, $now);
    $today = $dates[0];
    [$from, $to] = pv_day_range($location, $today);
    $ids = array_map(static fn (array $c): string => $c['id'], $location['courts']);
    $cells = pv_load_cells($pdo, $ids, $from, $to);
    $courts = [];
    foreach ($location['courts'] as $court) {
        $slots = pv_day_slots($location, $court, $today, $cells, $deviceId, $now);
        $courts[] = [
            'courtId' => $court['id'],
            'freeToday' => count(array_filter($slots, static fn (array $s): bool => $s['status'] === 'free')),
            'remainingToday' => count($slots),
        ];
    }
    $anyOpen = false;
    foreach ($dates as $date) {
        $anyOpen = $anyOpen || pv_day_open($location, $date)[0];
    }
    return ['location' => $location['slug'], 'seasonClosed' => !$anyOpen, 'todayOpen' => pv_day_open($location, $today)[0], 'courts' => $courts];
}

/**
 * Bis zu 3 Alternativen nach SLOT_TAKEN: zuerst derselbe Court am selben Tag
 * (spätere Zeiten zuerst, dann frühere), danach andere Courts des Standorts
 * zur ähnlichsten Uhrzeit.
 */
function pv_suggestions(PDO $pdo, array $location, array $court, string $date, int $minute, string $deviceId, DateTimeImmutable $now): array
{
    [$from, $to] = pv_day_range($location, $date);
    $ids = array_map(static fn (array $c): string => $c['id'], $location['courts']);
    $cells = pv_load_cells($pdo, $ids, $from, $to);
    $pick = static fn (array $c, array $s): array => [
        'courtId' => $c['id'], 'courtName' => $c['name'], 'date' => $date, 'time' => $s['time'],
        'endTime' => $s['endTime'], 'start' => $s['start'], 'priceCents' => $s['priceCents'],
    ];
    $same = array_values(array_filter(
        pv_day_slots($location, $court, $date, $cells, $deviceId, $now),
        static fn (array $s): bool => $s['status'] === 'free' && $s['minute'] !== $minute,
    ));
    usort($same, static function (array $a, array $b) use ($minute): int {
        $ka = $a['minute'] > $minute ? $a['minute'] - $minute : 10000 + $minute - $a['minute'];
        $kb = $b['minute'] > $minute ? $b['minute'] - $minute : 10000 + $minute - $b['minute'];
        return $ka <=> $kb;
    });
    $result = array_map(static fn (array $s): array => $pick($court, $s), array_slice($same, 0, 3));
    if (count($result) < 3) {
        $others = [];
        foreach ($location['courts'] as $other) {
            if ($other['id'] === $court['id']) {
                continue;
            }
            foreach (pv_day_slots($location, $other, $date, $cells, $deviceId, $now) as $s) {
                if ($s['status'] === 'free') {
                    $others[] = ['court' => $other, 'slot' => $s, 'distance' => abs($s['minute'] - $minute)];
                }
            }
        }
        usort($others, static fn (array $a, array $b): int => $a['distance'] <=> $b['distance']);
        foreach (array_slice($others, 0, 3 - count($result)) as $o) {
            $result[] = $pick($o['court'], $o['slot']);
        }
    }
    return $result;
}