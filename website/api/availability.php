<?php
declare(strict_types=1);
/**
 * GET /api/availability.php?court=marbella-3&date=2027-03-14
 * Belegung eines Courts an einem Tag (Ortszeit-Beschriftung + UTC-ISO).
 * Enthält KEINE persönlichen Daten.
 *
 * ETag: hängt ab von Versionsnummer, Gerät (eigener Hold) und aktueller Minute
 * (vergangene Starts verschwinden). Schickt der Browser dasselbe ETag mit
 * (If-None-Match), antworten wir mit 304 ohne Inhalt → spart Datenvolumen.
 */
require __DIR__ . '/lib/bootstrap.php';
pv_bootstrap_request();
pv_require_method('GET');

['court' => $court, 'location' => $location] = pv_v_court((string) ($_GET['court'] ?? ''));
$date = (string) ($_GET['date'] ?? '');
if (!pv_is_valid_date($date)) {
    pv_fail('VALIDATION', 422, 'Ungültiges Datum.');
}
$pdo = pv_db();
$device = pv_device_id();
$version = pv_current_version($pdo);
$etag = '"' . substr(hash('sha256', implode('|', [$version, $court['id'], $date, $device, pv_now()->format('YmdHi')])), 0, 24) . '"';
header('ETag: ' . $etag);
if (trim((string) ($_SERVER['HTTP_IF_NONE_MATCH'] ?? '')) === $etag) {
    http_response_code(304);
    header('Cache-Control: private, no-cache');
    exit;
}
$data = pv_availability($pdo, $location, $court, $date, $device);
$data['version'] = $version;
// private, no-cache: Browser darf speichern, muss aber immer nachfragen (→ 304 möglich)
pv_ok($data, 200, 'private, no-cache');