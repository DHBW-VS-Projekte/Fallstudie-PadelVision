<?php
declare(strict_types=1);
/**
 * POST /api/book.php
 * { holdId, holdToken, fullName, email, rackets, balls, consent, idempotencyKey }
 * Wandelt einen gültigen Hold in eine verbindliche Buchung um (Details: lib/booking.php).
 * Rate Limit: 3 Buchungsversuche pro Gerät und Minute.
 */
require __DIR__ . '/lib/bootstrap.php';
pv_bootstrap_request();
$body = pv_post_json();
$pdo = pv_db();
pv_rate_guard($pdo, 'book', 3);
pv_ok(pv_confirm_booking($pdo, $body), 201);