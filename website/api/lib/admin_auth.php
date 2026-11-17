<?php
declare(strict_types=1);
/**
 * lib/admin_auth.php – Login für /verwaltung
 *
 * Warum PHP-Sessions statt einer Tabelle admin_sessions? PHP bringt sichere
 * Sessions mit (zufällige IDs, Speicher beim Hoster). Für EIN Admin-Konto bei
 * einer Präsentation ist das einfacher und genauso sicher – die Tabelle
 * admin_sessions entfällt deshalb bewusst.
 *
 *  - In der Konfiguration steht nur ein password_hash(), geprüft mit password_verify()
 *  - session_regenerate_id() nach dem Login (Schutz vor Session-Fixation)
 *  - Cookie HttpOnly, SameSite=Strict, Secure im Live-Betrieb, max. 8 Stunden
 *  - 5 Fehlversuche pro Gerät → 1 Minute Sperre
 */

const PV_ADMIN_MAX_AGE = 8 * 60 * 60;

function pv_admin_session_start(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.gc_maxlifetime', (string) PV_ADMIN_MAX_AGE);
    session_name('PVADMIN');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => pv_config()['IS_PRODUCTION'] === true || pv_is_https(),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function pv_admin_logged_in(): bool
{
    pv_admin_session_start();
    $at = $_SESSION['pv_admin_at'] ?? null;
    if (($_SESSION['pv_admin'] ?? false) !== true || !is_int($at)) {
        return false;
    }
    if (time() - $at > PV_ADMIN_MAX_AGE) {
        $_SESSION = [];
        return false;
    }
    return true;
}

function pv_admin_require(): void
{
    if (!pv_admin_logged_in()) {
        throw new PvError('UNAUTHORIZED', 401, 'Bitte melde dich an.');
    }
}

function pv_admin_login(PDO $pdo, string $password): void
{
    $bucket = 'loginfail:dev:' . pv_device_id();
    if (pv_rate_exceeded($pdo, $bucket, 5, 60)) {
        throw new PvError('RATE_LIMITED', 429, 'Zu viele Fehlversuche – bitte 1 Minute warten.');
    }
    $hash = (string) pv_config()['ADMIN_PASSWORD_HASH'];
    if ($hash === '' || !password_verify($password, $hash)) {
        pv_rate_record($pdo, $bucket);
        throw new PvError('UNAUTHORIZED', 401, 'Falsches Passwort.');
    }
    pv_admin_session_start();
    session_regenerate_id(true);
    $_SESSION['pv_admin'] = true;
    $_SESSION['pv_admin_at'] = time();
}

function pv_admin_logout(): void
{
    pv_admin_session_start();
    $_SESSION = [];
    $params = session_get_cookie_params();
    setcookie(session_name(), '', [
        'expires' => time() - 3600, 'path' => $params['path'], 'secure' => $params['secure'],
        'httponly' => true, 'samesite' => 'Strict',
    ]);
    session_destroy();
}

/** E-Mail für die Admin-Ansicht kürzen: matheo@gmail.com → m***@gmail.com (passiert NUR hier in PHP) */
function pv_mask_email(string $email): string
{
    $at = strrpos($email, '@');
    return $at === false ? '***' : mb_substr($email, 0, 1) . '***' . substr($email, $at);
}