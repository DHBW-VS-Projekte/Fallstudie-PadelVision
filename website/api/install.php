<?php
declare(strict_types=1);
/**
 * install.php – richtet die Datenbank AUTOMATISCH ein (Tabellen + Standorte + Courts)
 *
 * Aufruf EINMAL im Browser:  https://eure-domain.de/api/install.php?token=EUER_INSTALL_TOKEN
 *
 *  1. Sperrdatei data/installed.lock vorhanden? → Abbruch (schon eingerichtet)
 *  2. Token prüfen (hash_equals mit INSTALL_TOKEN aus config.php)
 *  3. PHP-Version und Erweiterungen prüfen
 *  4. Mit der Datenbank verbinden (verständliche deutsche Fehlermeldungen)
 *  5. data/schema.sql und data/seed.sql ausführen (wiederholbar dank
 *     CREATE TABLE IF NOT EXISTS und INSERT … ON DUPLICATE KEY UPDATE)
 *  6. Kontrolle: Anzahl Standorte und Courts wie in catalog.json
 *  7. Sperrdatei schreiben → jeder weitere Aufruf wird verweigert
 *
 * WICHTIG: Danach install.php zusätzlich VOM SERVER LÖSCHEN (FileZilla →
 * Rechtsklick → Löschen). Die Sperrdatei ist nur die zweite Sicherung.
 * Es werden NIE Passwörter oder Stacktraces angezeigt – Details nur im Server-Log.
 */
require __DIR__ . '/lib/bootstrap.php';

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

/** @var list<array{0: bool|null, 1: string, 2: string}> $checks [ok (null = Warnung), Titel, Detail (bereits HTML-sicher)] */
$checks = [];
$fatal = null;
$lockFile = __DIR__ . '/data/installed.lock';
$h = static fn (string $s): string => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');

(static function () use (&$checks, &$fatal, $lockFile, $h): void {
    if (is_file($lockFile)) {
        $fatal = 'Die Datenbank wurde bereits eingerichtet (data/installed.lock existiert). Lösche install.php jetzt vom Server.';
        return;
    }
    try {
        $config = pv_config();
    } catch (Throwable) {
        $fatal = 'Keine gültige config.php gefunden, oder APP_SECRET fehlt bzw. ist kürzer als 32 Zeichen. Lade api/config.php hoch (Vorlage: config.example.php).';
        return;
    }
    $expected = (string) $config['INSTALL_TOKEN'];
    $given = (string) ($_GET['token'] ?? '');
    if (strlen($expected) < 16 || $given === '' || !hash_equals($expected, $given)) {
        http_response_code(403);
        $fatal = 'Zugriff verweigert: Einrichtungs-Token fehlt oder ist falsch. Aufruf: /api/install.php?token=… (INSTALL_TOKEN aus config.php, mind. 16 Zeichen).';
        return;
    }

    // ---- PHP ----
    $phpOk = version_compare(PHP_VERSION, '8.1.0', '>=');
    $checks[] = [$phpOk, 'PHP-Version', 'Gefunden: ' . $h(PHP_VERSION) . ($phpOk ? '' : ' – benötigt 8.1 oder neuer (im Kundenbereich umstellen).')];
    foreach (['pdo_mysql', 'mbstring', 'json'] as $ext) {
        $loaded = extension_loaded($ext);
        $checks[] = [$loaded, 'PHP-Erweiterung ' . $ext, $loaded ? 'vorhanden' : 'fehlt – im Kundenbereich aktivieren'];
        $phpOk = $phpOk && $loaded;
    }
    if (!$phpOk) {
        $fatal = 'PHP erfüllt die Voraussetzungen nicht.';
        return;
    }

    // ---- Datenbank-Verbindung ----
    try {
        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', (string) $config['DB_HOST'], (int) $config['DB_PORT'], (string) $config['DB_NAME']);
        $pdo = new PDO($dsn, (string) $config['DB_USER'], (string) $config['DB_PASS'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 5,
        ]);
        $pdo->exec("SET time_zone = '+00:00'");
    } catch (PDOException $e) {
        error_log('PadelVision install: ' . $e->getMessage());
        $code = (int) ($e->errorInfo[1] ?? $e->getCode());
        $fatal = match ($code) {
            2002, 2003, 2005, 2006 => 'Falscher Datenbank-Host oder Port – im Kundenbereich nachsehen (oft ist es NICHT localhost).',
            1045 => 'Zugriff verweigert: Benutzername oder Passwort der Datenbank stimmt nicht (DB_USER / DB_PASS).',
            1044, 1049 => 'Die Datenbank (DB_NAME) existiert nicht, oder der Benutzer hat keine Rechte darauf.',
            default => 'Verbindung zur Datenbank fehlgeschlagen (Fehlercode ' . $code . '). Zugangsdaten in config.php prüfen.',
        };
        $checks[] = [false, 'Verbindung zur Datenbank', 'fehlgeschlagen'];
        return;
    }
    $checks[] = [true, 'Verbindung zur Datenbank', 'Host ' . $h((string) $config['DB_HOST']) . ', Datenbank ' . $h((string) $config['DB_NAME'])];

    // ---- Datenbank-Version ----
    $version = (string) $pdo->query('SELECT VERSION()')->fetchColumn();
    $isMaria = stripos($version, 'mariadb') !== false;
    $numeric = preg_match('/^(\d+\.\d+(\.\d+)?)/', $version, $m) ? $m[1] : '0';
    $dbOk = $isMaria ? version_compare($numeric, '10.4', '>=') : version_compare($numeric, '5.7', '>=');
    $checks[] = [$dbOk ? true : null, ($isMaria ? 'MariaDB' : 'MySQL') . '-Version', $h($version) . ($dbOk ? '' : ' – älter als empfohlen, kann trotzdem funktionieren')];

    // ---- SQL-Dateien ausführen ----
    foreach (['schema.sql' => 'Tabellen angelegt', 'seed.sql' => 'Standorte und Courts eingetragen'] as $file => $label) {
        $path = __DIR__ . '/data/' . $file;
        $sql = is_file($path) ? file_get_contents($path) : false;
        if ($sql === false) {
            $fatal = "api/data/$file fehlt – lokal npm run build ausführen (kopiert die Dateien) und api/data/ erneut hochladen.";
            return;
        }
        // Kommentarzeilen entfernen, dann an ";" + Zeilenende in einzelne Anweisungen trennen
        $clean = preg_replace('/^\s*--.*$/m', '', $sql) ?? '';
        $statements = array_values(array_filter(array_map('trim', preg_split('/;\s*(\r?\n|$)/', $clean) ?: [])));
        try {
            foreach ($statements as $statement) {
                $pdo->exec($statement);
            }
        } catch (PDOException $e) {
            error_log('PadelVision install SQL: ' . $e->getMessage());
            $fatal = "Fehler beim Ausführen von $file (MySQL-Fehler " . (int) ($e->errorInfo[1] ?? 0) . '). Details stehen im PHP-Fehlerprotokoll des Hosters.';
            $checks[] = [false, $label, 'fehlgeschlagen'];
            return;
        }
        $checks[] = [true, $label, count($statements) . ' Anweisungen ausgeführt'];
    }

    // ---- Kontrolle gegen catalog.json ----
    $locations = (int) $pdo->query('SELECT COUNT(*) FROM locations')->fetchColumn();
    $courts = (int) $pdo->query('SELECT COUNT(*) FROM courts')->fetchColumn();
    $expLoc = count(pv_catalog()['locations']);
    $expCourts = array_sum(array_map(static fn (array $l): int => count($l['courts']), pv_catalog()['locations']));
    $countOk = $locations === $expLoc && $courts === $expCourts;
    $checks[] = [$countOk, "$expLoc Standorte und $expCourts Courts", "In der Datenbank: $locations Standorte, $courts Courts"];
    if (!$countOk) {
        $fatal = 'Die Anzahl der Standorte/Courts stimmt nicht mit catalog.json überein.';
        return;
    }

    // ---- Sperrdatei ----
    if (@file_put_contents($lockFile, 'Eingerichtet am ' . gmdate('Y-m-d H:i:s') . " UTC\n") === false) {
        $checks[] = [null, 'Sperrdatei', 'Konnte data/installed.lock nicht schreiben – install.php UNBEDINGT vom Server löschen.'];
    } else {
        $checks[] = [true, 'Sperrdatei', 'data/installed.lock geschrieben – weitere Aufrufe werden verweigert'];
    }
})();
?>
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>PadelVision · Einrichtung</title>
</head>
<body style="margin:0;background:#faf7f2;color:#2a2622;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;">
  <main style="max-width:640px;margin:0 auto;padding:56px 20px;">
    <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:.25em;text-transform:uppercase;color:#b14a2a;">PadelVision · Einrichtung</p>
    <h1 style="margin:12px 0 8px;font-size:36px;letter-spacing:-.02em;">Datenbank-Installer</h1>
    <p style="margin:0 0 32px;color:#645b53;line-height:1.6;">Legt alle Tabellen an und trägt Standorte und Courts aus catalog.json ein.</p>
    <ul style="list-style:none;margin:0;padding:0;display:grid;gap:10px;">
      <?php foreach ($checks as [$ok, $title, $detail]): ?>
        <li style="background:#fffdf9;border:1px solid #e4dccf;border-radius:16px;padding:14px 18px;display:flex;gap:14px;align-items:flex-start;">
          <span style="font-size:18px;font-weight:700;color:<?= $ok === true ? '#1f5f66' : ($ok === null ? '#5f6d33' : '#b14a2a') ?>;"><?= $ok === true ? '✔' : ($ok === null ? '!' : '✘') ?></span>
          <span><strong><?= $h($title) ?></strong><br><span style="color:#645b53;font-size:14px;"><?= $detail ?></span></span>
        </li>
      <?php endforeach; ?>
    </ul>
    <?php if ($fatal !== null): ?>
      <div style="margin-top:24px;background:#fbf1ec;border-left:4px solid #b14a2a;border-radius:12px;padding:16px 18px;line-height:1.6;">
        <strong style="color:#b14a2a;">Nicht abgeschlossen</strong><br><?= $h($fatal) ?>
      </div>
    <?php else: ?>
      <div style="margin-top:24px;background:#e8f1f0;border-left:4px solid #1f5f66;border-radius:12px;padding:16px 18px;line-height:1.6;">
        <strong style="color:#1f5f66;">Fertig! Die Buchung ist einsatzbereit.</strong><br>
        Lösche jetzt <code>install.php</code> vom Server und prüfe die Tabellen in phpMyAdmin.
      </div>
    <?php endif; ?>
  </main>
</body>
</html>