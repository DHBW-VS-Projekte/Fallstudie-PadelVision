<?php
declare(strict_types=1);
/**
 * lib/ratelimit.php – Spam-Schutz über die Tabelle rate_events
 *
 * Grenzen pro Minute:
 *  - pro GERÄT: 10 Holds, 3 Buchungsversuche, 5 Stornoversuche, 20 Freigaben,
 *    5 Fehl-Logins. Ein Mensch klickt nie öfter, ein Skript wird schnell gebremst.
 *  - pro IP (gehasht): 600 schreibende Anfragen als Notbremse.
 *    30 Personen × (10 Holds + 3 Buchungen) = 390 < 600 → die Klasse wird nie
 *    ausgebremst, ein durchdrehender Bot aber schon.
 *  - Das Polling (version.php, availability.php …) zählt NICHT: 30 Geräte ×
 *    30 Abfragen/Minute = 900 Lesezugriffe – gewollt und sehr billig.
 *
 * Bewusst einfach (COUNT + INSERT, nicht atomar): Für ein Rate Limit reicht
 * "ungefähr richtig". Die Sicherheit gegen Doppelbuchungen hängt NICHT daran,
 * sondern am UNIQUE-Schlüssel.
 */

function pv_rate_limit(PDO $pdo, string $bucket, int $limit, int $windowSeconds): void
{
    $now = pv_now();
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM rate_events WHERE bucket = ? AND created_at > ?');
    $stmt->execute([$bucket, pv_db_time($now->modify('-' . $windowSeconds . ' seconds'))]);
    if ((int) $stmt->fetchColumn() >= $limit) {
        throw new PvError('RATE_LIMITED', 429);
    }
    $pdo->prepare('INSERT INTO rate_events (bucket, created_at) VALUES (?, ?)')->execute([$bucket, pv_db_time($now)]);
    // Aufräumen nur bei ~1 % der Anfragen – nicht jede Anfrage soll löschen müssen
    if (random_int(1, 100) === 1) {
        $pdo->prepare('DELETE FROM rate_events WHERE created_at < ?')->execute([pv_db_time($now->modify('-2 minutes'))]);
    }
}

/** Geräte-Grenze (entfällt bei gültigem Lasttest-Token) + IP-Notbremse */
function pv_rate_guard(PDO $pdo, string $action, int $deviceLimitPerMinute): void
{
    if (!pv_is_loadtest()) {
        pv_rate_limit($pdo, $action . ':dev:' . pv_device_id(), $deviceLimitPerMinute, 60);
    }
    pv_rate_limit($pdo, 'write:ip:' . pv_ip_hash(), 600, 60);
}

/** Nur prüfen (ohne Eintrag) – für Fehl-Logins */
function pv_rate_exceeded(PDO $pdo, string $bucket, int $limit, int $windowSeconds): bool
{
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM rate_events WHERE bucket = ? AND created_at > ?');
    $stmt->execute([$bucket, pv_db_time(pv_now()->modify('-' . $windowSeconds . ' seconds'))]);
    return (int) $stmt->fetchColumn() >= $limit;
}

function pv_rate_record(PDO $pdo, string $bucket): void
{
    $pdo->prepare('INSERT INTO rate_events (bucket, created_at) VALUES (?, ?)')->execute([$bucket, pv_db_time(pv_now())]);
}