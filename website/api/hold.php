<?php
declare(strict_types=1);
/**
 * POST /api/hold.php  { courtId, date, time, previousHold? }
 * Reserviert einen Slot für 5 Minuten. Antwort: holdId, holdToken (NUR für diesen
 * Browser), expiresAt. Rennen verloren → SLOT_TAKEN + bis zu 3 Vorschläge.
 * Rate Limit: 20 Holds pro Gerät und Minute (+ IP-Notbremse).
 */
require __DIR__ . '/lib/bootstrap.php';
pv_bootstrap_request();
$body = pv_post_json();
$pdo = pv_db();
pv_rate_guard($pdo, 'hold', 20);
$previousHold = $body['previousHold'] ?? null;
$previousHoldId = null;
$previousHoldToken = null;
if ($previousHold !== null) {
    if (!is_array($previousHold)) {
        pv_invalid('previousHold', 'Ungültige bisherige Reservierung.');
    }
    $previousHoldId = pv_v_uuid(pv_str($previousHold, 'holdId'), 'holdId');
    $previousHoldToken = pv_v_token(pv_str($previousHold, 'holdToken'));
}
pv_ok(pv_create_hold(
    $pdo,
    pv_str($body, 'courtId'),
    pv_str($body, 'date'),
    pv_str($body, 'time'),
    pv_device_id(),
    $previousHoldId,
    $previousHoldToken,
), 201);