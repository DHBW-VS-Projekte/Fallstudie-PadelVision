<?php
declare(strict_types=1);
/**
 * POST /api/cancel.php  { code, email }
 * Storniert eine zukünftige Buchung. Fehlermeldung bewusst neutral.
 * Rate Limit: 5 Versuche pro Gerät und Minute (gegen Durchprobieren von Codes).
 */
require __DIR__ . '/lib/bootstrap.php';
pv_bootstrap_request();
$body = pv_post_json();
$pdo = pv_db();
pv_rate_guard($pdo, 'cancel', 5);
pv_ok(pv_cancel_booking($pdo, pv_str($body, 'code'), pv_str($body, 'email')));