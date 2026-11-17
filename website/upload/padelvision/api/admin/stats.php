<?php
declare(strict_types=1);
/**
 * GET /api/admin/stats.php?date=2027-03-14
 * Kennzahlen: heute erstellte Buchungen, Buchungen gesamt, belegte Stunden,
 * Auslastung pro Standort am gewählten Tag (gebuchte Zellen / mögliche Zellen),
 * aktive Holds.
 */
require dirname(__DIR__) . '/lib/bootstrap.php';
pv_bootstrap_request();
pv_require_method('GET');
pv_admin_require();

$pdo = pv_db();
$now = pv_now();
$berlin = pv_tz('Europe/Berlin');
$date = (string) ($_GET['date'] ?? pv_local_today($berlin, $now));
if (!pv_is_valid_date($date)) {
    pv_fail('VALIDATION', 422, 'Ungültiges Datum.');
}

$stmt = $pdo->prepare('SELECT COUNT(*) FROM bookings WHERE created_at >= ?');
$stmt->execute([pv_db_time(pv_local_to_utc(pv_local_today($berlin, $now), 0, $berlin))]);
$createdToday = (int) $stmt->fetchColumn();
$confirmed = (int) $pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'")->fetchColumn();
$stmt = $pdo->prepare("SELECT COUNT(DISTINCT hold_id) FROM slot_cells WHERE status = 'hold' AND expires_at > ?");
$stmt->execute([pv_db_time($now)]);
$activeHolds = (int) $stmt->fetchColumn();

$utilization = [];
foreach (pv_catalog()['locations'] as $location) {
    [$from, $to] = pv_day_range($location, $date);
    [$open] = pv_day_open($location, $date);
    [$openMin, $closeMin] = pv_opening_minutes($location);
    $capacity = $open ? count($location['courts']) * intdiv($closeMin - $openMin, pv_rules()['cellMinutes']) : 0;
    $ids = array_map(static fn (array $c): string => $c['id'], $location['courts']);
    $in = implode(',', array_fill(0, count($ids), '?'));
    $q = $pdo->prepare("SELECT COUNT(*) FROM slot_cells WHERE status = 'confirmed' AND court_id IN ($in) AND cell_start >= ? AND cell_start < ?");
    $q->execute([...$ids, pv_db_time($from), pv_db_time($to)]);
    $booked = (int) $q->fetchColumn();
    $utilization[] = [
        'slug' => $location['slug'],
        'city' => $location['city'],
        'open' => $open,
        'percent' => $capacity > 0 ? (int) round($booked / $capacity * 100) : 0,
    ];
}

pv_ok([
    'date' => $date,
    'createdToday' => $createdToday,
    'confirmedTotal' => $confirmed,
    'bookedHours' => $confirmed * pv_rules()['slotMinutes'] / 60,
    'activeHolds' => $activeHolds,
    'utilization' => $utilization,
]);