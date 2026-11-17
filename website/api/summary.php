<?php
declare(strict_types=1);
/**
 * GET /api/summary.php?location=marbella
 * "Heute noch X Slots frei" je Court + Kennzeichen, ob der Standort komplett in Saisonpause ist.
 */
require __DIR__ . '/lib/bootstrap.php';
pv_bootstrap_request();
pv_require_method('GET');
$location = pv_v_location((string) ($_GET['location'] ?? ''));
pv_ok(pv_location_summary(pv_db(), $location, pv_device_id()));