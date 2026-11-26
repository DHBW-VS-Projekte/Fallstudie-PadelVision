<?php
declare(strict_types=1);
/**
 * lib/booking.php – Hold anlegen/freigeben, Buchung bestätigen, stornieren, Admin-Aktionen
 *
 * =====================================================================
 * WARUM REICHT EIN "IST DER SLOT NOCH FREI?"-SELECT NICHT?
 * Zwei Anfragen kommen in derselben Millisekunde an:
 *   A: SELECT … → frei          B: SELECT … → frei
 *   A: INSERT … → gebucht       B: INSERT … → gebucht   ← DOPPELBUCHUNG!
 * Beide haben "frei" gesehen, bevor die andere geschrieben hat (Race Condition).
 *
 * LÖSUNG: Wir fragen NICHT vorher, sondern schreiben direkt. Der UNIQUE-
 * Schlüssel (court_id, cell_start) lässt die Datenbank selbst entscheiden:
 * Das erste INSERT gewinnt, jedes weitere scheitert mit Fehler 1062.
 * Weil alle 3 Zellen in EINER Transaktion eingefügt werden, gilt: entweder
 * alle 3 oder keine. Auch eine überlappende Buchung (17:30 gegen 18:00)
 * scheitert, weil sie mindestens eine gemeinsame Zelle braucht.
 * =====================================================================
 *
 * HOLDS: Ein Klick auf eine Zeit belegt die 3 Zellen sofort als 'hold' für
 * 5 Minuten. Der Browser bekommt einen zufälligen Token; in der Datenbank
 * steht nur dessen SHA-256-Hash. Nur wer den Token kennt, kann bestätigen
 * oder freigeben. Abgelaufene Holds gelten als frei und werden beim nächsten
 * Hold-Versuch auf diese Zellen gelöscht. Ein bestehender Hold kann nur mit
 * seiner Hold-ID und seinem Token ersetzt werden, und auch dann nicht durch
 * einen überlappenden Slot.
 *
 * IDEMPOTENZ: Der Browser schickt beim Buchen einen Zufallsschlüssel
 * (crypto.randomUUID). Kommt dieselbe Anfrage zweimal (Doppelklick,
 * Netzwerk-Wiederholung), liefert der zweite Aufruf dieselbe Buchung zurück,
 * statt eine zweite anzulegen – abgesichert durch UNIQUE (idempotency_key).
 */

function pv_uuid(): string
{
    $b = random_bytes(16);
    $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
    $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
    $h = bin2hex($b);
    return sprintf('%s-%s-%s-%s-%s', substr($h, 0, 8), substr($h, 8, 4), substr($h, 12, 4), substr($h, 16, 4), substr($h, 20, 12));
}

/** Buchungscode PV-XXXXXX ohne verwechselbare Zeichen (0/O/1/I) */
function pv_generate_code(): string
{
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $code = 'PV-';
    for ($i = 0; $i < 6; $i++) {
        $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    }
    return $code;
}

/**
 * Hold anlegen.
 * @throws PvError SLOT_TAKEN (mit Vorschlägen), OUTSIDE_HOURS, NOT_FOUND, VALIDATION
 */
function pv_create_hold(
    PDO $pdo,
    string $courtId,
    string $date,
    string $time,
    string $deviceId,
    ?string $previousHoldId = null,
    ?string $previousHoldToken = null,
): array
{
    ['court' => $court, 'location' => $location] = pv_v_court($courtId);
    $date = pv_v_date($date);
    $minute = pv_v_time($time);
    $now = pv_now();
    $start = pv_validate_slot($location, $date, $minute, $now);    // 1) Regeln prüfen
    $cells = pv_cells_for($start);

    $holdId = pv_uuid();
    $token = bin2hex(random_bytes(32));                             // geht NUR an diesen Browser
    $tokenHash = hash('sha256', $token);                            // in der DB nur der Hash
    $expires = $now->modify('+' . pv_rules()['holdSeconds'] . ' seconds');

    try {
        pv_transaction($pdo, static function (PDO $pdo) use ($courtId, $cells, $holdId, $tokenHash, $deviceId, $expires, $now, $previousHoldId, $previousHoldToken): void {
            $in = implode(',', array_fill(0, count($cells), '?'));
            // 2) Abgelaufene Holds GENAU dieser drei Zellen entfernen, damit sie den UNIQUE-
            //    Schlüssel nicht blockieren. Vergleich mit PHP-"jetzt" statt UTC_TIMESTAMP():
            //    expires_at wurde ebenfalls mit PHP-Zeit geschrieben – gleiche Uhr, kein Versatz.
            $pdo->prepare("DELETE FROM slot_cells WHERE court_id = ? AND cell_start IN ($in) AND status = 'hold' AND expires_at < ?")
                ->execute([$courtId, ...$cells, pv_db_time($now)]);
            // Abgelaufene Holds desselben Geräts bereinigen; aktive Holds aus
            // anderen Tabs dürfen ohne deren Token nicht ersetzt werden.
            $pdo->prepare("DELETE FROM slot_cells WHERE device_id = ? AND status = 'hold' AND expires_at <= ?")
                ->execute([$deviceId, pv_db_time($now)]);
            if ($previousHoldId !== null && $previousHoldToken !== null) {
                $stmt = $pdo->prepare(
                    "SELECT cell_start, hold_token_hash FROM slot_cells
                      WHERE hold_id = ? AND device_id = ? AND status = 'hold' AND expires_at > ?
                      FOR UPDATE"
                );
                $stmt->execute([$previousHoldId, $deviceId, pv_db_time($now)]);
                $previousCells = [];
                $previousTokenMatches = true;
                $expectedPreviousTokenHash = hash('sha256', $previousHoldToken);
                foreach ($stmt as $row) {
                    $previousCells[] = (string) $row['cell_start'];
                    if (!is_string($row['hold_token_hash']) || !hash_equals($row['hold_token_hash'], $expectedPreviousTokenHash)) {
                        $previousTokenMatches = false;
                    }
                }
                if ($previousCells !== [] && $previousTokenMatches && array_intersect($previousCells, $cells) === []) {
                    $pdo->prepare("DELETE FROM slot_cells WHERE hold_id = ? AND device_id = ? AND status = 'hold'")
                        ->execute([$previousHoldId, $deviceId]);
                }
            }
            // 4) Drei Zellen einfügen. Ist eine schon vergeben → Fehler 1062 → ROLLBACK.
            $insert = $pdo->prepare(
                "INSERT INTO slot_cells (court_id, cell_start, status, hold_id, hold_token_hash, device_id, expires_at, booking_id, created_at)
                 VALUES (?, ?, 'hold', ?, ?, ?, ?, NULL, ?)"
            );
            foreach ($cells as $cell) {
                $insert->execute([$courtId, $cell, $holdId, $tokenHash, $deviceId, pv_db_time($expires), pv_db_time_ms($now)]);
            }
            // 5) Version erhöhen (gleiche Transaktion) → alle Browser laden neu
            pv_bump_version($pdo);
        });
    } catch (PDOException $e) {
        if (pv_mysql_error_code($e) === 1062) {
            // 6) Rennen verloren: SLOT_TAKEN plus bis zu 3 Alternativen
            throw new PvError('SLOT_TAKEN', 409, '', ['suggestions' => pv_suggestions($pdo, $location, $court, $date, $minute, $deviceId, $now)]);
        }
        throw $e;
    }

    $price = pv_court_price($court, $date, $minute);
    $len = pv_rules()['slotMinutes'];
    return [
        'holdId' => $holdId,
        'holdToken' => $token,
        'expiresAt' => pv_iso($expires),
        'courtId' => $courtId,
        'date' => $date,
        'time' => pv_minutes_to_hhmm($minute),
        'endTime' => pv_minutes_to_hhmm(($minute + $len) % 1440),
        'start' => pv_iso($start),
        'end' => pv_iso($start->modify('+' . $len . ' minutes')),
        'priceCents' => array_sum($price),
        'prime' => $price['primeCents'] > 0,
    ];
}

/** Hold freigeben – nur mit passendem Token (Vergleich in konstanter Zeit) */
function pv_release_hold(PDO $pdo, string $holdId, string $token): bool
{
    return pv_transaction($pdo, static function (PDO $pdo) use ($holdId, $token): bool {
        $stmt = $pdo->prepare("SELECT hold_token_hash FROM slot_cells WHERE hold_id = ? AND status = 'hold' LIMIT 1 FOR UPDATE");
        $stmt->execute([$holdId]);
        $hash = $stmt->fetchColumn();
        if (!is_string($hash) || !hash_equals($hash, hash('sha256', $token))) {
            return false;
        }
        $pdo->prepare("DELETE FROM slot_cells WHERE hold_id = ? AND status = 'hold'")->execute([$holdId]);
        pv_bump_version($pdo);
        return true;
    });
}

/** Buchung laden (Spaltenname aus fester Liste – nie aus Nutzereingaben) */
function pv_find_booking(PDO $pdo, string $column, string|int $value): ?array
{
    if (!in_array($column, ['id', 'idempotency_key', 'booking_code'], true)) {
        throw new InvalidArgumentException('Ungültige Spalte');
    }
    $stmt = $pdo->prepare("SELECT * FROM bookings WHERE $column = ? LIMIT 1");
    $stmt->execute([$value]);
    $row = $stmt->fetch();
    return is_array($row) ? $row : null;
}

/** Buchung für das Ticket aufbereiten (nur für den Kunden selbst bzw. Admin) */
function pv_booking_public(array $row): array
{
    $bookingType = (string) ($row['booking_type'] ?? 'court');
    $eventId = isset($row['event_id']) && $row['event_id'] !== '' ? (string) $row['event_id'] : null;
    $eventTitle = isset($row['event_title']) && $row['event_title'] !== '' ? (string) $row['event_title'] : null;
    $eventType = isset($row['event_type']) && $row['event_type'] !== '' ? (string) $row['event_type'] : null;
    $found = pv_court((string) $row['court_id']);
    $court = $found['court'] ?? ['name' => (string) $row['court_id'], 'kind' => 'outdoor', 'panorama' => false];
    $location = $found['location'] ?? null;
    $tz = pv_tz($location['timezone'] ?? 'Europe/Berlin');
    [$date, $minute] = pv_utc_to_local(pv_from_db((string) $row['starts_at']), $tz);
    [, $endMinute] = pv_utc_to_local(pv_from_db((string) $row['ends_at']), $tz);
    $parts = pv_price_parts($court, $date, $minute, (int) $row['rackets'], (int) $row['balls']);
    if ($bookingType === 'event') {
        $parts = ['baseCents' => 0, 'panoramaCents' => 0, 'primeCents' => 0, 'racketsCents' => 0, 'ballsCents' => 0, 'totalCents' => 0];
    } else {
        $parts['totalCents'] = (int) $row['price_cents']; // gespeicherter Preis ist verbindlich
    }
    return [
        'code' => $row['booking_code'],
        'status' => $row['status'],
        'bookingType' => $bookingType === 'event' ? 'event' : 'court',
        'eventId' => $eventId,
        'eventTitle' => $eventTitle,
        'eventType' => $eventType,
        'locationSlug' => $location['slug'] ?? '',
        'locationName' => $location['name'] ?? '',
        'city' => $location['city'] ?? '',
        'courtId' => $row['court_id'],
        'courtName' => $bookingType === 'event' ? 'Event-Anmeldung' : $court['name'],
        'courtKind' => $court['kind'],
        'panorama' => (bool) $court['panorama'],
        'date' => $date,
        'dateLabel' => pv_date_long($date),
        'time' => pv_minutes_to_hhmm($minute),
        'endTime' => pv_minutes_to_hhmm($endMinute),
        'timezoneLabel' => pv_tz_label($location['city'] ?? '', $tz, $date),
        'fullName' => $row['full_name'],
        'email' => $row['email'],
        'rackets' => (int) $row['rackets'],
        'balls' => (int) $row['balls'],
        'price' => $parts,
        'createdAt' => pv_iso_ms(pv_from_db((string) $row['created_at'])),
    ];
}

/**
 * Hold verbindlich in eine Buchung umwandeln.
 * @throws PvError VALIDATION, LIMIT_REACHED, HOLD_EXPIRED
 */
function pv_confirm_booking(PDO $pdo, array $body): array
{
    $pricing = pv_pricing();
    $eventId = trim(pv_str($body, 'eventId'));
    if ($eventId !== '') {
        return pv_confirm_event_booking($pdo, $body, $eventId, $pricing);
    }

    $holdId = pv_v_uuid(pv_str($body, 'holdId'), 'holdId');
    $token = pv_v_token(pv_str($body, 'holdToken'));
    $name = pv_v_name(pv_str($body, 'fullName'));
    [$email, $emailNorm] = pv_v_email(pv_str($body, 'email'));
    $rackets = pv_int_range($body, 'rackets', 0, (int) $pricing['maxRackets']);
    $balls = pv_int_range($body, 'balls', 0, (int) $pricing['maxBalls']);
    if (($body['consent'] ?? false) !== true) {
        pv_invalid('consent', 'Bitte bestätige die Einwilligung.');
    }
    $idem = pv_v_uuid(pv_str($body, 'idempotencyKey'), 'idempotencyKey');
    $now = pv_now();

    // 1) Schlüssel schon benutzt → dieselbe Buchung zurückgeben, keine zweite anlegen
    $existing = pv_find_booking($pdo, 'idempotency_key', $idem);
    if ($existing !== null) {
        return pv_booking_public($existing);
    }

    try {
        $bookingId = pv_transaction($pdo, static function (PDO $pdo) use ($holdId, $token, $name, $email, $emailNorm, $rackets, $balls, $idem, $now): int {
            // 2) E-Mail-Sperre: Zeile anlegen (falls neu) und SPERREN. Kommen zwei Buchungen
            //    derselben E-Mail gleichzeitig, WARTET die zweite hier, bis die erste fertig
            //    ist – und zählt dann deren Buchung schon mit. Ohne diese Sperre könnten beide
            //    "1 offene Buchung" zählen und die Grenze von 2 gemeinsam überschreiten.
            $pdo->prepare('INSERT IGNORE INTO email_guards (email_normalized, created_at) VALUES (?, ?)')->execute([$emailNorm, pv_db_time($now)]);
            $pdo->prepare('SELECT email_normalized FROM email_guards WHERE email_normalized = ? FOR UPDATE')->execute([$emailNorm]);

            // 3) Offene (zukünftige, nicht stornierte) Buchungen zählen (Index idx_bookings_email)
            $count = $pdo->prepare("SELECT COUNT(*) FROM bookings WHERE email_normalized = ? AND status = 'confirmed' AND ends_at > ?");
            $count->execute([$emailNorm, pv_db_time($now)]);
            if ((int) $count->fetchColumn() >= pv_rules()['maxOpenBookingsPerEmail']) {
                throw new PvError('LIMIT_REACHED', 409);
            }

            // 4) Gehören die 3 Hold-Zellen zu diesem Token und laufen sie noch? (gesperrt lesen)
            $stmt = $pdo->prepare('SELECT court_id, cell_start, status, hold_token_hash, expires_at FROM slot_cells WHERE hold_id = ? ORDER BY cell_start FOR UPDATE');
            $stmt->execute([$holdId]);
            $cells = $stmt->fetchAll();
            $valid = count($cells) === pv_cells_per_slot();
            foreach ($cells as $cell) {
                $valid = $valid
                    && $cell['status'] === 'hold'
                    && $cell['court_id'] === $cells[0]['court_id']
                    && is_string($cell['hold_token_hash'])
                    && hash_equals($cell['hold_token_hash'], hash('sha256', $token))
                    && pv_from_db((string) $cell['expires_at']) > $now;
            }
            if (!$valid) {
                throw new PvError('HOLD_EXPIRED', 409);
            }

            // 5) Preis IMMER hier berechnen, Buchung einfügen
            $found = pv_court((string) $cells[0]['court_id']);
            if ($found === null) {
                throw new PvError('NOT_FOUND', 404, 'Unbekannter Court.');
            }
            $start = pv_from_db((string) $cells[0]['cell_start']);
            [$localDate, $localMinute] = pv_utc_to_local($start, pv_tz($found['location']['timezone']));
            $price = pv_price_parts($found['court'], $localDate, $localMinute, $rackets, $balls);
            $end = $start->modify('+' . pv_rules()['slotMinutes'] . ' minutes');

            // Buchungscode bei (sehr unwahrscheinlicher) Kollision neu würfeln. Ein
            // fehlgeschlagenes INSERT rollt in InnoDB nur diese Anweisung zurück.
            $insert = $pdo->prepare(
                "INSERT INTO bookings (booking_code, court_id, starts_at, ends_at, full_name, email, email_normalized, rackets, balls, price_cents, status, idempotency_key, device_id, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?)"
            );
            $bookingId = 0;
            for ($attempt = 0; $attempt < 5 && $bookingId === 0; $attempt++) {
                try {
                    $insert->execute([
                        pv_generate_code(), $cells[0]['court_id'], pv_db_time($start), pv_db_time($end), $name, $email, $emailNorm,
                        $rackets, $balls, $price['totalCents'], $idem, pv_device_id(), pv_db_time_ms($now),
                    ]);
                    $bookingId = (int) $pdo->lastInsertId();
                } catch (PDOException $e) {
                    if (pv_mysql_error_code($e) === 1062 && str_contains($e->getMessage(), 'uq_booking_code')) {
                        continue;
                    }
                    throw $e;
                }
            }
            if ($bookingId === 0) {
                throw new RuntimeException('Kein freier Buchungscode gefunden.');
            }

            // 6) Zellen von 'hold' auf 'confirmed', Hold-Daten leeren
            $pdo->prepare("UPDATE slot_cells SET status = 'confirmed', hold_token_hash = NULL, device_id = NULL, expires_at = NULL, booking_id = ? WHERE hold_id = ?")
                ->execute([$bookingId, $holdId]);
            // 7) Version erhöhen – COMMIT passiert in pv_transaction
            pv_bump_version($pdo);
            return $bookingId;
        });
    } catch (PDOException $e) {
        // Zwei identische Anfragen gleichzeitig: die zweite scheitert an uq_idempotency → erste zurückgeben
        if (pv_mysql_error_code($e) === 1062) {
            $again = pv_find_booking($pdo, 'idempotency_key', $idem);
            if ($again !== null) {
                return pv_booking_public($again);
            }
        }
        throw $e;
    }

    $row = pv_find_booking($pdo, 'id', $bookingId);
    if ($row === null) {
        throw new RuntimeException('Buchung nach dem Speichern nicht gefunden.');
    }
    return pv_booking_public($row);
}

/**
 * Event registrations do not reserve a court slot; their event time is fixed
 * by the event card and persisted with the booking for admin review.
 * @param array<string, mixed> $pricing
 */
function pv_confirm_event_booking(PDO $pdo, array $body, string $eventId, array $pricing): array
{
    $name = pv_v_name(pv_str($body, 'fullName'));
    [$email, $emailNorm] = pv_v_email(pv_str($body, 'email'));
    $rackets = pv_int_range($body, 'rackets', 0, (int) $pricing['maxRackets']);
    $balls = pv_int_range($body, 'balls', 0, (int) $pricing['maxBalls']);
    if (($body['consent'] ?? false) !== true) {
        pv_invalid('consent', 'Bitte bestätige die Einwilligung.');
    }
    $idem = pv_v_uuid(pv_str($body, 'idempotencyKey'), 'idempotencyKey');

    if (!preg_match('/^([a-z]{2})-[1-9][0-9]*$/', $eventId, $matches)) {
        throw new PvError('NOT_FOUND', 404, 'Event nicht gefunden.');
    }
    $eventLocations = [
        'kn' => 'konstanz',
        'mb' => 'marbella',
        'pv' => 'porto-vecchio',
        'st' => 'santorini',
        'ch' => 'chania',
    ];
    $expectedLocation = $eventLocations[$matches[1]] ?? null;
    $courtId = pv_str($body, 'courtId');
    $found = pv_v_court($courtId);
    if ($expectedLocation === null || $found['location']['slug'] !== $expectedLocation) {
        throw new PvError('NOT_FOUND', 404, 'Event oder Standort nicht gefunden.');
    }

    $title = trim(pv_str($body, 'eventTitle'));
    $type = trim(pv_str($body, 'eventType'));
    if ($title === '' || mb_strlen($title) > 160) {
        pv_invalid('eventTitle', 'Ungültiger Event-Titel.');
    }
    if (!in_array($type, ['turnier', 'kurs', 'community', 'camp'], true)) {
        pv_invalid('eventType', 'Ungültige Event-Art.');
    }
    $date = pv_v_date(pv_str($body, 'date'));
    $minute = pv_v_time(pv_str($body, 'time'));
    $duration = $body['durationMinutes'] ?? null;
    if (!is_int($duration) || $duration < 15 || $duration > 720) {
        pv_invalid('durationMinutes', 'Ungültige Event-Dauer.');
    }
    $now = pv_now();
    $timezone = pv_tz($found['location']['timezone']);
    $start = pv_local_to_utc($date, $minute, $timezone);
    $end = $start->modify('+' . $duration . ' minutes');
    if ($start <= $now) {
        pv_invalid('eventId', 'Dieses Event hat bereits begonnen.');
    }

    $existing = pv_find_booking($pdo, 'idempotency_key', $idem);
    if ($existing !== null) {
        return pv_booking_public($existing);
    }

    try {
        $bookingId = pv_transaction($pdo, static function (PDO $pdo) use (
            $courtId,
            $start,
            $end,
            $name,
            $email,
            $emailNorm,
            $rackets,
            $balls,
            $idem,
            $eventId,
            $title,
            $type,
            $now
        ): int {
            $pdo->prepare('INSERT IGNORE INTO email_guards (email_normalized, created_at) VALUES (?, ?)')->execute([$emailNorm, pv_db_time($now)]);
            $pdo->prepare('SELECT email_normalized FROM email_guards WHERE email_normalized = ? FOR UPDATE')->execute([$emailNorm]);
            $count = $pdo->prepare("SELECT COUNT(*) FROM bookings WHERE email_normalized = ? AND status = 'confirmed' AND ends_at > ?");
            $count->execute([$emailNorm, pv_db_time($now)]);
            if ((int) $count->fetchColumn() >= pv_rules()['maxOpenBookingsPerEmail']) {
                throw new PvError('LIMIT_REACHED', 409);
            }

            $insert = $pdo->prepare(
                "INSERT INTO bookings (booking_code, court_id, booking_type, event_id, event_title, event_type, starts_at, ends_at, full_name, email, email_normalized, rackets, balls, price_cents, status, idempotency_key, device_id, created_at)
                 VALUES (?, ?, 'event', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'confirmed', ?, ?, ?)"
            );
            for ($attempt = 0; $attempt < 5; $attempt++) {
                try {
                    $insert->execute([
                        pv_generate_code(), $courtId, $eventId, $title, $type, pv_db_time($start), pv_db_time($end),
                        $name, $email, $emailNorm, $rackets, $balls, $idem, pv_device_id(), pv_db_time_ms($now),
                    ]);
                    $bookingId = (int) $pdo->lastInsertId();
                    pv_bump_version($pdo);
                    return $bookingId;
                } catch (PDOException $e) {
                    if (pv_mysql_error_code($e) === 1062 && str_contains($e->getMessage(), 'uq_booking_code')) {
                        continue;
                    }
                    throw $e;
                }
            }
            throw new RuntimeException('Kein freier Buchungscode gefunden.');
        });
    } catch (PDOException $e) {
        if (pv_mysql_error_code($e) === 1062) {
            $again = pv_find_booking($pdo, 'idempotency_key', $idem);
            if ($again !== null) {
                return pv_booking_public($again);
            }
        }
        throw $e;
    }

    $row = pv_find_booking($pdo, 'id', $bookingId);
    if ($row === null) {
        throw new RuntimeException('Event-Buchung nach dem Speichern nicht gefunden.');
    }
    return pv_booking_public($row);
}

/**
 * Stornieren durch den Kunden (Buchungsnummer + E-Mail).
 * Fehlermeldung bewusst neutral – niemand soll herausfinden, ob eine Nummer existiert.
 */
function pv_cancel_booking(PDO $pdo, string $code, string $email): array
{
    $neutral = new PvError('NOT_FOUND', 404, 'Wir konnten keine passende Buchung finden.');
    $code = pv_v_code($code);
    try {
        [, $emailNorm] = pv_v_email($email);
    } catch (PvError) {
        throw $neutral;
    }
    $now = pv_now();
    return pv_transaction($pdo, static function (PDO $pdo) use ($code, $emailNorm, $now, $neutral): array {
        $stmt = $pdo->prepare("SELECT * FROM bookings WHERE booking_code = ? AND email_normalized = ? AND status = 'confirmed' FOR UPDATE");
        $stmt->execute([$code, $emailNorm]);
        $row = $stmt->fetch();
        if (!is_array($row) || pv_from_db((string) $row['starts_at']) <= $now) {
            throw $neutral;
        }
        $pdo->prepare("UPDATE bookings SET status = 'cancelled', cancelled_at = ? WHERE id = ?")->execute([pv_db_time($now), $row['id']]);
        // Zellen LÖSCHEN → Slot sofort wieder frei
        $pdo->prepare('DELETE FROM slot_cells WHERE booking_id = ?')->execute([$row['id']]);
        pv_bump_version($pdo);
        $row['status'] = 'cancelled';
        return pv_booking_public($row);
    });
}

function pv_admin_cancel(PDO $pdo, int $bookingId): void
{
    pv_transaction($pdo, static function (PDO $pdo) use ($bookingId): void {
        $stmt = $pdo->prepare("SELECT id FROM bookings WHERE id = ? AND status = 'confirmed' FOR UPDATE");
        $stmt->execute([$bookingId]);
        if ($stmt->fetchColumn() === false) {
            throw new PvError('NOT_FOUND', 404, 'Buchung nicht gefunden oder schon storniert.');
        }
        $pdo->prepare("UPDATE bookings SET status = 'cancelled', cancelled_at = ? WHERE id = ?")->execute([pv_db_time(pv_now()), $bookingId]);
        $pdo->prepare('DELETE FROM slot_cells WHERE booking_id = ?')->execute([$bookingId]);
        pv_bump_version($pdo);
    });
}

/** Alle Testdaten löschen (Standorte/Courts bleiben) */
function pv_admin_reset(PDO $pdo): void
{
    pv_transaction($pdo, static function (PDO $pdo): void {
        $pdo->exec('DELETE FROM slot_cells');
        $pdo->exec('DELETE FROM bookings');
        $pdo->exec('DELETE FROM email_guards');
        $pdo->exec('DELETE FROM rate_events');
        pv_bump_version($pdo);
    });
}