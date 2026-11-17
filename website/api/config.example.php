<?php
declare(strict_types=1);
/**
 * config.example.php – VORLAGE für die Konfiguration (ohne echte Werte)
 *
 * So geht's:
 *  1. Kopieren und speichern als config.php (Server) bzw. config.local.php (lokal).
 *  2. Werte eintragen (siehe BUCHUNG-README.md, Abschnitt "Online-config.php").
 *  3. config.php / config.local.php NIE auf GitHub hochladen (steht in .gitignore).
 *
 * Wo darf die Datei liegen? lib/bootstrap.php sucht in dieser Reihenfolge:
 *  a) Pfad aus der Umgebungsvariable PV_CONFIG (falls der Hoster das erlaubt)
 *  b) EINE Ebene ÜBER dem Web-Verzeichnis als "padelvision-config.php"
 *     → am sichersten, weil dort per URL gar nicht erreichbar
 *  c) api/config.local.php (nur lokale Entwicklung)
 *  d) api/config.php (Standard; per .htaccess gegen Aufruf geschützt)
 */
return [
    // ---- Datenbank (Werte aus dem Kundenbereich des Hosters) ----
    'DB_HOST' => 'localhost',          // ACHTUNG: beim Hoster oft NICHT localhost, z. B. "rdbms.strato.de"
    'DB_PORT' => 3306,
    'DB_NAME' => 'padelvision',
    'DB_USER' => 'padelvision',
    'DB_PASS' => '',

    // ---- Admin-Login für /verwaltung: NUR der Hash, nie das Passwort! ----
    // Erzeugen (Windows/XAMPP):
    //   C:\xampp\php\php.exe -r "echo password_hash('DeinPasswort', PASSWORD_DEFAULT), PHP_EOL;"
    'ADMIN_PASSWORD_HASH' => '',

    // ---- Geheimnisse (lange Zufallswerte) ----
    // Erzeugen: C:\xampp\php\php.exe -r "echo bin2hex(random_bytes(32)), PHP_EOL;"
    'APP_SECRET'     => '',            // mind. 32 Zeichen; signiert das Geräte-Cookie, hasht IP-Adressen
    'INSTALL_TOKEN'  => '',            // mind. 16 Zeichen; für /api/install.php?token=…
    'LOADTEST_TOKEN' => '',            // leer = Lasttest-Ausnahme deaktiviert

    // ---- Lokale Entwicklung ----
    // CORS nur für den Next.js-Dev-Server und NUR wenn IS_PRODUCTION = false
    'DEV_CORS_ORIGIN' => 'http://localhost:3000',

    // true auf dem echten Server: Cookies nur über HTTPS, kein CORS
    'IS_PRODUCTION' => false,
];