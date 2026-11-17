<?php
declare(strict_types=1);
/**
 * lib/response.php – JSON-Antworten, CORS (nur Dev), Request-Prüfungen
 *
 * Format: { "ok": true, "data": … }  bzw.  { "ok": false, "code": "…", "message": "…", "details": … }
 * Header: Content-Type JSON, Cache-Control (Standard no-store), X-Content-Type-Options.
 */

function pv_send(int $status, array $payload, string $cacheControl = 'no-store'): never
{
    if (!headers_sent()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: ' . $cacheControl);
        header('X-Content-Type-Options: nosniff');
        header('Referrer-Policy: same-origin');
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function pv_ok(mixed $data, int $status = 200, string $cacheControl = 'no-store'): never
{
    pv_send($status, ['ok' => true, 'data' => $data], $cacheControl);
}

function pv_fail(string $code, ?int $status = null, ?string $message = null, array $details = []): never
{
    $payload = ['ok' => false, 'code' => $code, 'message' => $message ?? pv_default_message($code)];
    if ($details !== []) {
        $payload['details'] = $details;
    }
    pv_send($status ?? pv_default_status($code), $payload);
}

/** Läuft die Anfrage über HTTPS? (auch hinter einem Proxy des Hosters) */
function pv_is_https(): bool
{
    if (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off') {
        return true;
    }
    return strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https';
}

/**
 * CORS – NUR für die lokale Entwicklung (Next.js auf localhost:3000, PHP auf XAMPP).
 * Live liegen Website und API auf derselben Domain → kein CORS nötig, Schalter aus.
 */
function pv_cors(): void
{
    $config = pv_config();
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    $devOrigin = (string) $config['DEV_CORS_ORIGIN'];
    if ($config['IS_PRODUCTION'] !== true && $devOrigin !== '' && $origin !== '' && hash_equals($devOrigin, $origin)) {
        header('Access-Control-Allow-Origin: ' . $devOrigin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type, X-Loadtest-Token, If-None-Match');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Expose-Headers: ETag');
        header('Vary: Origin');
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/** Nur die angegebene HTTP-Methode zulassen, sonst 405 */
function pv_require_method(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== $method) {
        header('Allow: ' . $method);
        pv_fail('METHOD', 405);
    }
}

/**
 * Schutz gegen Anfragen fremder Websites (CSRF): Bei POST muss der Origin-
 * (ersatzweise Referer-) Header zur eigenen Domain passen – im Dev-Modus
 * zusätzlich DEV_CORS_ORIGIN. Außerdem verlangen wir JSON (pv_json_body):
 * Ein fremdes HTML-Formular kann kein application/json senden.
 */
function pv_check_origin(): void
{
    $config = pv_config();
    $host = (string) ($_SERVER['HTTP_HOST'] ?? '');
    $allowed = [];
    if ($host !== '') {
        $allowed[] = 'https://' . $host;
        $allowed[] = 'http://' . $host;
    }
    if ($config['IS_PRODUCTION'] !== true && (string) $config['DEV_CORS_ORIGIN'] !== '') {
        $allowed[] = (string) $config['DEV_CORS_ORIGIN'];
    }
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin === '' && !empty($_SERVER['HTTP_REFERER'])) {
        $parts = parse_url((string) $_SERVER['HTTP_REFERER']);
        if (is_array($parts) && isset($parts['scheme'], $parts['host'])) {
            $origin = $parts['scheme'] . '://' . $parts['host'] . (isset($parts['port']) ? ':' . $parts['port'] : '');
        }
    }
    foreach ($allowed as $candidate) {
        if ($origin !== '' && hash_equals($candidate, $origin)) {
            return;
        }
    }
    pv_fail('UNAUTHORIZED', 403, 'Anfrage von unbekannter Herkunft.');
}

/**
 * JSON-Body eines POST-Requests lesen (max. 10 KB).
 * @return array<string, mixed>
 */
function pv_json_body(): array
{
    $type = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
    if (!str_contains($type, 'application/json')) {
        pv_fail('VALIDATION', 415, 'Erwartet wird JSON.');
    }
    if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 10240) {
        pv_fail('VALIDATION', 413, 'Anfrage ist zu groß.');
    }
    $raw = file_get_contents('php://input', false, null, 0, 10241);
    if ($raw === false || strlen($raw) > 10240) {
        pv_fail('VALIDATION', 413, 'Anfrage ist zu groß.');
    }
    try {
        $data = json_decode($raw === '' ? '{}' : $raw, true, 8, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        pv_fail('VALIDATION', 400, 'Ungültiges JSON.');
    }
    if (!is_array($data)) {
        pv_fail('VALIDATION', 400, 'Ungültiges JSON.');
    }
    return $data;
}

/** Start eines POST-Endpunkts: Methode, Herkunft, Body */
function pv_post_json(): array
{
    pv_require_method('POST');
    pv_check_origin();
    return pv_json_body();
}