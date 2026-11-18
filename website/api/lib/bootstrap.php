<?php
declare(strict_types=1);
/**
 * lib/bootstrap.php – wird von JEDEM Endpunkt als Erstes eingebunden
 *
 *  - PHP-Fehler nie an den Browser (display_errors aus, Log an)
 *  - PHP-Zeitzone UTC (alle Berechnungen und Speicherungen in UTC)
 *  - Konfiguration laden (pv_config)
 *  - alle Bibliotheken einbinden (nur Funktionsdefinitionen, keine Seiteneffekte)
 *  - globaler Fehlerfänger: unerwartete Fehler → Log + neutrale JSON-Antwort
 */

ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', '/usr/home/xfmnhy/php.log');
error_reporting(E_ALL);
date_default_timezone_set('UTC');

require_once __DIR__ . '/errors.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/catalog.php';
require_once __DIR__ . '/time.php';
require_once __DIR__ . '/rules.php';
require_once __DIR__ . '/pricing.php';
require_once __DIR__ . '/validation.php';
require_once __DIR__ . '/device.php';
require_once __DIR__ . '/ratelimit.php';
require_once __DIR__ . '/slots.php';
require_once __DIR__ . '/booking.php';
require_once __DIR__ . '/admin_auth.php';

/**
 * Lädt die Konfiguration genau einmal pro Anfrage (Suchreihenfolge: config.example.php).
 * Die Konfiguration ist der einzige "globale" Zustand – über eine statische Variable.
 * @return array<string, mixed>
 */
function pv_config(): array
{
    static $config = null;
    if (is_array($config)) {
        return $config;
    }
    $defaults = [
        'DB_HOST' => 'localhost', 'DB_PORT' => 3306, 'DB_NAME' => '', 'DB_USER' => '', 'DB_PASS' => '',
        'ADMIN_PASSWORD_HASH' => '', 'APP_SECRET' => '', 'INSTALL_TOKEN' => '', 'LOADTEST_TOKEN' => '',
        'DEV_CORS_ORIGIN' => '', 'IS_PRODUCTION' => true,
    ];
    $candidates = [];
    $env = getenv('PV_CONFIG');
    if (is_string($env) && $env !== '') {
        $candidates[] = $env;
    }
    $candidates[] = dirname(__DIR__, 3) . '/padelvision-config.php'; // eine Ebene über dem Web-Verzeichnis
    $candidates[] = dirname(__DIR__) . '/config.local.php';
    $candidates[] = dirname(__DIR__) . '/config.php';

    foreach ($candidates as $path) {
        if (!is_file($path)) {
            continue;
        }
        $loaded = require $path;
        if (!is_array($loaded)) {
            continue;
        }
        $merged = array_merge($defaults, $loaded);
        if (strlen((string) $merged['APP_SECRET']) < 32) {
            error_log('PadelVision: APP_SECRET fehlt oder ist zu kurz (mind. 32 Zeichen).');
            throw new PvError('SERVER_ERROR', 503, 'Die Buchung ist gerade nicht erreichbar.');
        }
        $config = $merged;
        return $config;
    }
    error_log('PadelVision: keine config.php gefunden.');
    throw new PvError('SERVER_ERROR', 503, 'Die Buchung ist gerade nicht erreichbar.');
}

/** Gemeinsamer Start jedes JSON-Endpunkts: Fehlerfänger, CORS (nur Dev), OPTIONS-Vorabanfragen */
function pv_bootstrap_request(): void
{
    set_exception_handler(static function (Throwable $e): void {
        if ($e instanceof PvError) {
            pv_fail($e->errorCode, $e->httpStatus, $e->getMessage(), $e->details);
        }
        // Details nur ins Server-Log – der Browser bekommt nie einen Stacktrace
        error_log('PadelVision Fehler: ' . get_class($e) . ': ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
        pv_fail('SERVER_ERROR', 500);
    });
    try {
        pv_cors();
    } catch (PvError $e) {
        pv_fail($e->errorCode, $e->httpStatus, $e->getMessage());
    }
}