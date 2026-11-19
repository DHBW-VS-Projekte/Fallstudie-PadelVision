<?php
declare(strict_types=1);
/**
 * GET /api/admin/bookings.php – alle Buchungen, neueste zuerst (max. 1000)
 * Voller Name sichtbar, E-Mail wird bereits HIER in PHP gekürzt (m***@gmail.com).
 * ORDER BY created_at nutzt den Index idx_bookings_created.
 */
require dirname(__DIR__) . '/lib/bootstrap.php';
pv_bootstrap_request();
pv_require_method('GET');
pv_admin_require();

$pdo = pv_db();
$rows = $pdo->query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 1000')->fetchAll();
$berlin = pv_tz('Europe/Berlin');
$out = [];
foreach ($rows as $row) {
    $p = pv_booking_public($row);
    $out[] = [
        'id' => (int) $row['id'],
        'code' => $p['code'],
        'status' => $p['status'],
        'bookingType' => $p['bookingType'],
        'eventTitle' => $p['eventTitle'],
        'eventType' => $p['eventType'],
        'fullName' => $p['fullName'],
        'emailMasked' => pv_mask_email((string) $row['email']),
        'locationSlug' => $p['locationSlug'],
        'locationName' => $p['locationName'],
        'city' => $p['city'],
        'courtName' => $p['courtName'],
        'date' => $p['date'],
        'dateShort' => pv_date_short($p['date']),
        'time' => $p['time'],
        'endTime' => $p['endTime'],
        'rackets' => $p['rackets'],
        'balls' => $p['balls'],
        'priceCents' => (int) $row['price_cents'],
        'createdAt' => $p['createdAt'],
        // "gebucht am" in deutscher Zeit mit Sekunden
        'createdLabel' => pv_from_db((string) $row['created_at'])->setTimezone($berlin)->format('d.m.Y H:i:s'),
    ];
}
pv_ok(['bookings' => $out, 'version' => pv_current_version($pdo)]);