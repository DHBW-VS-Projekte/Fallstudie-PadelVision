<?php
declare(strict_types=1);
/**
 * lib/device.php – Geräte-Kennung (Cookie pv_device) und IP-Hash
 *
 * Warum pro GERÄT statt pro IP? Bei der Präsentation sitzen alle 30 Personen
 * im selben WLAN und haben nach außen dieselbe IP. Eine IP-Grenze würde die
 * ganze Klasse gleichzeitig aussperren.
 *
 * Das Cookie enthält eine zufällige ID (random_bytes) plus HMAC-Signatur
 * (APP_SECRET) – fremde Geräte-IDs lassen sich so nicht vortäuschen.
 * HttpOnly (JavaScript kommt nicht dran), SameSite=Lax, Path=/, Secure im Live-Betrieb.
 */

function pv_device_sign(string $id): string
{
    return substr(hash_hmac('sha256', $id, (string) pv_config()['APP_SECRET']), 0, 16);
}

/** Geräte-ID (32 Hex-Zeichen); setzt beim ersten Aufruf das Cookie */
function pv_device_id(): string
{
    static $id = null;
    if (is_string($id)) {
        return $id;
    }
    $cookie = (string) ($_COOKIE['pv_device'] ?? '');
    if (preg_match('/^([0-9a-f]{32})\.([0-9a-f]{16})$/', $cookie, $m) && hash_equals(pv_device_sign($m[1]), $m[2])) {
        $id = $m[1];
        return $id;
    }
    $id = bin2hex(random_bytes(16));
    if (!headers_sent()) {
        setcookie('pv_device', $id . '.' . pv_device_sign($id), [
            'expires' => time() + 60 * 60 * 24 * 30,
            'path' => '/',
            'secure' => pv_config()['IS_PRODUCTION'] === true || pv_is_https(),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }
    return $id;
}

/** IP nie im Klartext speichern – nur als HMAC (nicht zurückrechenbar) */
function pv_ip_hash(): string
{
    return substr(hash_hmac('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'), (string) pv_config()['APP_SECRET']), 0, 32);
}

/** Lasttest-Anfrage? (Header X-Loadtest-Token passt zu nicht-leerem LOADTEST_TOKEN) */
function pv_is_loadtest(): bool
{
    $expected = (string) pv_config()['LOADTEST_TOKEN'];
    $given = (string) ($_SERVER['HTTP_X_LOADTEST_TOKEN'] ?? '');
    return $expected !== '' && $given !== '' && hash_equals($expected, $given);
}