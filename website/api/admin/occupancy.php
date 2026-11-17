<?php
declare(strict_types=1);
/**
 * GET /api/admin/occupancy.php?location=marbella&date=2027-03-14
 * Belegungsplan: Zeilen = 30-Minuten-Zellen (Ortszeit), Spalten = Courts.
 * Gebuchte Zellen mit Namen, aktive Holds als "hold", abgelaufene Holds = leer.
 */
require dirname(__DIR__) . '/lib/bootstrap.php';
pv_bootstrap_request();
pv_require_method('GET');
pv_admin_require();

$location = pv_v_location((string) ($_GET['location'] ?? ''));
$date = (string) ($_GET['date'] ?? '');
if (!pv_is_valid_date($date)) {
    pv_fail('VALIDATION', 422, 'Ungültiges Datum.');
}
$pdo = pv_db();
$now = pv_now();
$tz = pv_tz($location['timezone']);
[$from, $to] = pv_day_range($location, $date);
$ids = array_map(static fn (array $c): string => $c['id'], $location['courts']);
$in = implode(',', array_fill(0, count($ids), '?'));
$stmt = $pdo->prepare(
    "SELECT c.court_id, c.cell_start, c.status, c.expires_at, b.id AS booking_id, b.full_name, b.booking_code, b.starts_at
       FROM slot_cells c
       LEFT JOIN bookings b ON b.id = c.booking_id
      WHERE c.court_id IN ($in) AND c.cell_start >= ? AND c.cell_start < ?"
);
$stmt->execute([...$ids, pv_db_time($from), pv_db_time($to)]);
$map = [];
foreach ($stmt as $row) {
    $map[(string) $row['court_id']][(string) $row['cell_start']] = $row;
}

[$openMin, $closeMin] = pv_opening_minutes($location);
$rows = [];
for ($m = $openMin; $m < $closeMin; $m += pv_rules()['cellMinutes']) {
    $key = pv_db_time(pv_local_to_utc($date, $m, $tz));
    $cells = [];
    foreach ($location['courts'] as $court) {
        $row = $map[$court['id']][$key] ?? null;
        if ($row === null) {
            $cells[] = null;
        } elseif ($row['status'] === 'confirmed') {
            $cells[] = [
                'type' => 'booked',
                'bookingId' => (int) $row['booking_id'],
                'name' => (string) $row['full_name'],
                'code' => (string) $row['booking_code'],
                'startsHere' => $row['starts_at'] === $key,
            ];
        } elseif (pv_from_db((string) $row['expires_at']) > $now) {
            $cells[] = ['type' => 'hold'];
        } else {
            $cells[] = null;
        }
    }
    $rows[] = ['time' => pv_minutes_to_hhmm($m), 'cells' => $cells];
}
[$open, $reason] = pv_day_open($location, $date);
pv_ok([
    'location' => $location['slug'],
    'date' => $date,
    'open' => $open,
    'reason' => $reason,
    'timezoneLabel' => pv_tz_label($location['city'], $tz, $date),
    'courts' => array_map(static fn (array $c): array => ['id' => $c['id'], 'name' => $c['name']], $location['courts']),
    'rows' => $rows,
]);