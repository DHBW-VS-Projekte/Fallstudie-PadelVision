<?php
declare(strict_types=1);
/**
 * GET /api/version.php → { version: 123 }
 *
 * Der schnellste Endpunkt: EIN Select auf EINE Zeile, kein Login, kein Rate Limit.
 * Jeder Browser fragt im Schritt "Uhrzeit" alle 2 Sekunden nur diese Zahl ab
 * und lädt die (größere) Belegung nur, wenn sie sich geändert hat.
 */
require __DIR__ . '/lib/bootstrap.php';
pv_bootstrap_request();
pv_require_method('GET');
pv_ok(['version' => pv_current_version(pv_db())]);