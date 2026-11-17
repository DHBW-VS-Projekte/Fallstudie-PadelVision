<?php
declare(strict_types=1);
/**
 * GET /api/days.php?court=konstanz-1
 * 14-Tage-Leiste für Schritt 3: pro Tag geöffnet/geschlossen, freie Slots, Begründung.
 * Zusätzlicher Endpunkt (nicht in der Vorgabe): EINE Anfrage statt 14 einzelner.
 */
require __DIR__ . '/lib/bootstrap.php';
pv_bootstrap_request();
pv_require_method('GET');
['court' => $court, 'location' => $location] = pv_v_court((string) ($_GET['court'] ?? ''));
pv_ok(pv_days_overview(pv_db(), $location, $court, pv_device_id()));