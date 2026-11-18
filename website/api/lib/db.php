<?php
declare(strict_types=1);
/**
 * lib/db.php – PDO-Verbindung (eine pro Anfrage) und Transaktionen mit Deadlock-Retry
 *
 *  - ERRMODE_EXCEPTION: jeder SQL-Fehler wird eine Exception (nichts geht still verloren)
 *  - EMULATE_PREPARES = false: echte Prepared Statements auf dem DB-Server
 *  - utf8mb4: Umlaute und Emojis korrekt
 *  - time_zone '+00:00': DATETIME-Werte sind UTC
 *  - READ COMMITTED (statt MySQL-Standard REPEATABLE READ): InnoDB setzt dann
 *    kaum "Gap Locks" – bei vielen gleichzeitigen Holds gibt es deutlich weniger
 *    Deadlocks. Die KORREKTHEIT hängt nicht am Isolationslevel, sondern am
 *    UNIQUE-Schlüssel der Zellen und an der gesperrten email_guards-Zeile.
 */

function pv_db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $c = pv_config();
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', (string) $c['DB_HOST'], (int) $c['DB_PORT'], (string) $c['DB_NAME']);
    try {
        $pdo = new PDO($dsn, (string) $c['DB_USER'], (string) $c['DB_PASS'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 5,

            // Hetzner MySQL – verschlüsselte SSL-Verbindung
            PDO::MYSQL_ATTR_SSL_CA => '/usr/home/xfmnhy/sqlca.pem',
            PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => true,
        ]);
        $pdo->exec("SET time_zone = '+00:00'");
        $pdo->exec('SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED');
    } catch (PDOException $e) {
        error_log('PadelVision DB-Verbindung fehlgeschlagen: ' . $e->getMessage());
        throw new PvError('SERVER_ERROR', 503, 'Die Buchung ist gerade nicht erreichbar.');
    }
    return $pdo;
}

/** MySQL-Fehlernummer (z. B. 1062, 1213) aus einer PDOException */
function pv_mysql_error_code(Throwable $e): ?int
{
    if ($e instanceof PDOException && is_array($e->errorInfo) && isset($e->errorInfo[1])) {
        return (int) $e->errorInfo[1];
    }
    return null;
}

/**
 * Führt $fn in einer Transaktion aus.
 * Deadlock (1213) oder Lock-Timeout (1205) → bis zu 3 Versuche mit kurzer,
 * ZUFÄLLIGER Pause (damit zwei Kollidierende nicht wieder exakt gleichzeitig starten).
 * Jede andere Exception (z. B. 1062 oder PvError) → ROLLBACK und weiterwerfen.
 * @template T
 * @param callable(PDO): T $fn
 * @return T
 */
function pv_transaction(PDO $pdo, callable $fn): mixed
{
    $attempt = 0;
    while (true) {
        $attempt++;
        try {
            $pdo->beginTransaction();
            $result = $fn($pdo);
            $pdo->commit();
            return $result;
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            $code = pv_mysql_error_code($e);
            if (($code === 1213 || $code === 1205) && $attempt < 3) {
                usleep(random_int(20_000, 120_000));
                continue;
            }
            throw $e;
        }
    }
}

/**
 * Versionsnummer der Belegung erhöhen. MUSS in derselben Transaktion wie die
 * Änderung an slot_cells laufen: Sieht ein Browser die neue Version, ist die
 * Änderung garantiert schon sichtbar (beides wird gemeinsam committet).
 */
function pv_bump_version(PDO $pdo): void
{
    $pdo->exec('UPDATE app_state SET availability_version = availability_version + 1 WHERE id = 1');
}

function pv_current_version(PDO $pdo): int
{
    $value = $pdo->query('SELECT availability_version FROM app_state WHERE id = 1')->fetchColumn();
    return $value === false ? 0 : (int) $value;
}