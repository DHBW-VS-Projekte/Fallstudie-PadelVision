<?php
declare(strict_types=1);
/**
 * POST /api/hold.php  { courtId, date, time }
 * Reserviert einen Slot für 5 Minuten. Antwort: holdId, holdToken (NUR für diesen
 * Browser), expiresAt. Rennen verloren → SLOT_TAKEN + bis zu 3 Vorschläge.
 * Rate Limit: 20 Holds pro Gerät und Minute (+ IP-Notbremse).
 */
require __DIR__ . '/lib/bootstrap.php';
pv_bootstrap_request();
$body = pv_post_json();
$pdo = pv_db();
pv_rate_guard($pdo, 'hold', 20);
pv_ok(pv_create_hold($pdo, pv_str($body, 'courtId'), pv_str($body, 'date'), pv_str($body, 'time'), pv_device_id()), 201);