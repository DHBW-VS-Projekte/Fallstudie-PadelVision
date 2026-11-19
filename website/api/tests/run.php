<?php
declare(strict_types=1);
/**
 * api/tests/run.php – Tests der reinen PHP-Logik OHNE Datenbank und ohne PHPUnit
 *
 * Aufruf (lokal, NICHT auf den Server hochladen):
 *   php api/tests/run.php
 *   Windows/XAMPP:  C:\xampp\php\php.exe api\tests\run.php
 *
 * Geprüft: Zeitzonen inkl. Sommerzeit-Wechsel, Startzeiten, Zellen-Berechnung,
 * Überlappung, Prime Time, Preise, Saison, Vorlaufzeit, Slot-Status, Codes, Validierung.
 * Voraussetzung: api/data/catalog.json existiert (node scripts/copy-catalog.mjs).
 * Eine config.php ist NICHT nötig – die Logik läuft ohne Datenbank.
 */
require dirname(__DIR__) . '/lib/bootstrap.php';

/** Kleiner Test-Zähler ohne globale Variablen */
final class T
{
    public static int $passed = 0;
    public static int $failed = 0;

    public static function check(string $name, bool $ok, string $info = ''): void
    {
        if ($ok) {
            self::$passed++;
            echo "  ✔ $name\n";
        } else {
            self::$failed++;
            echo "  ✘ $name" . ($info !== '' ? "  ($info)" : '') . "\n";
        }
    }

    public static function throwsCode(callable $fn, string $code): bool
    {
        try {
            $fn();
        } catch (PvError $e) {
            return $e->errorCode === $code;
        }
        return false;
    }
}

$utc = new DateTimeZone('UTC');
$berlin = pv_tz('Europe/Berlin');
$konstanz = pv_location('konstanz');
$marbella = pv_location('marbella');
$porto = pv_location('porto-vecchio');
$santorini = pv_location('santorini');

echo "Katalog\n";
$courtCount = array_sum(array_map(static fn (array $l): int => count($l['courts']), pv_catalog()['locations']));
T::check('5 Standorte', count(pv_catalog()['locations']) === 5);
T::check('20 Courts', $courtCount === 20, (string) $courtCount);

echo "Zeitzonen & Sommerzeit\n";
T::check('Konstanz 18:00 im Januar = 17:00 UTC', pv_db_time(pv_local_to_utc('2027-01-15', 1080, $berlin)) === '2027-01-15 17:00:00');
T::check('Konstanz 18:00 im Juli = 16:00 UTC', pv_db_time(pv_local_to_utc('2027-07-15', 1080, $berlin)) === '2027-07-15 16:00:00');
T::check('Umstellungstag 28.03.2027: 07:00 = 05:00 UTC', pv_db_time(pv_local_to_utc('2027-03-28', 420, $berlin)) === '2027-03-28 05:00:00');
T::check('Vortag 27.03.2027: 07:00 = 06:00 UTC', pv_db_time(pv_local_to_utc('2027-03-27', 420, $berlin)) === '2027-03-27 06:00:00');
T::check('Santorini 18:00 im März = 16:00 UTC', pv_db_time(pv_local_to_utc('2027-03-14', 1080, pv_tz('Europe/Athens'))) === '2027-03-14 16:00:00');
T::check('Kurzes Datum enthält das Jahr', pv_date_short('2027-03-14') === 'So 14.03.2027');
T::check('Zeitzonen-Hinweis Santorini +1 Std.', str_contains(pv_tz_label('Santorini', pv_tz('Europe/Athens'), '2027-03-14'), '+1 Std.'));
T::check('Zeitzonen-Hinweis Konstanz', str_contains(pv_tz_label('Konstanz', $berlin, '2027-03-14'), 'wie deutsche Zeit'));
T::check('24:00 Marbella = 23:00 UTC (Winter)', pv_db_time(pv_local_to_utc('2027-03-14', 1440, pv_tz('Europe/Madrid'))) === '2027-03-14 23:00:00');
[$d, $m] = pv_utc_to_local(new DateTimeImmutable('2027-07-15 16:00:00', $utc), $berlin);
T::check('UTC → Ortszeit zurück', $d === '2027-07-15' && $m === 1080);
// Zellen über die Zeitumstellung hinweg: 01:30 Ortszeit + 90 echte Minuten
$cellsDst = pv_cells_for(pv_local_to_utc('2027-03-28', 90, $berlin));
T::check('Zellen am Umstellungstag lückenlos (UTC)', $cellsDst === ['2027-03-28 00:30:00', '2027-03-28 01:00:00', '2027-03-28 01:30:00']);

echo "Startzeiten\n";
$starts = pv_slot_starts($konstanz);
T::check('Konstanz: erster Start 07:00', $starts[0] === 420);
T::check('Konstanz: letzter Start 21:30', end($starts) === 1290);
T::check('Konstanz: 30 Startzeiten', count($starts) === 30, (string) count($starts));
$mStarts = pv_slot_starts($marbella);
T::check('Marbella 8–24 Uhr: letzter Start 22:30', end($mStarts) === 1350);

echo "Zellen & Überlappung\n";
$cells = pv_cells_for(pv_local_to_utc('2027-03-14', 600, $berlin));
T::check('3 Zellen pro Slot', count($cells) === 3);
T::check('10:00/10:30/11:00 Ortszeit in UTC', $cells === ['2027-03-14 09:00:00', '2027-03-14 09:30:00', '2027-03-14 10:00:00']);
$overlap = static fn (int $a, int $b): bool => array_intersect(
    pv_cells_for(pv_local_to_utc('2027-03-14', $a, $berlin)),
    pv_cells_for(pv_local_to_utc('2027-03-14', $b, $berlin)),
) !== [];
T::check('10:00 blockiert 09:00', $overlap(600, 540));
T::check('10:00 blockiert 09:30', $overlap(600, 570));
T::check('10:00 blockiert 10:30', $overlap(600, 630));
T::check('10:00 blockiert 11:00', $overlap(600, 660));
T::check('10:00 blockiert NICHT 08:30', !$overlap(600, 510));
T::check('10:00 blockiert NICHT 11:30', !$overlap(600, 690));

echo "Preise & Prime Time\n";
$indoor = pv_court('konstanz-1')['court'];
$outdoor = pv_court('konstanz-3')['court'];
$panorama = pv_court('marbella-3')['court'];
// 2027-03-15 = Montag, 2027-03-13 = Samstag
T::check('Prime Time Mo 17:00', pv_is_prime('2027-03-15', 1020));
T::check('Prime Time Mo 20:30', pv_is_prime('2027-03-15', 1230));
T::check('keine Prime Time Mo 21:00', !pv_is_prime('2027-03-15', 1260));
T::check('keine Prime Time Mo 16:30', !pv_is_prime('2027-03-15', 990));
T::check('keine Prime Time Sa 18:00', !pv_is_prime('2027-03-13', 1080));
T::check('Outdoor 28 €', pv_price_parts($outdoor, '2027-03-13', 600, 0, 0)['totalCents'] === 2800);
T::check('Indoor 32 €', pv_price_parts($indoor, '2027-03-13', 600, 0, 0)['totalCents'] === 3200);
T::check('Panorama Mo 18:00 = 28 + 6 + 8 = 42 €', pv_price_parts($panorama, '2027-03-15', 1080, 0, 0)['totalCents'] === 4200);
T::check('Extras 2 Schläger + 1 Dose = +14 €', pv_price_parts($outdoor, '2027-03-13', 600, 2, 1)['totalCents'] === 4200);

echo "Regeln\n";
$now = new DateTimeImmutable('2027-03-14 09:50:00', $utc); // Konstanz: 10:50 Ortszeit
T::check('Vergangene Startzeit → OUTSIDE_HOURS', T::throwsCode(static fn () => pv_validate_slot($konstanz, '2027-03-14', 600, $now), 'OUTSIDE_HOURS'));
T::check('Start in < 15 Min (11:00) → OUTSIDE_HOURS', T::throwsCode(static fn () => pv_validate_slot($konstanz, '2027-03-14', 660, $now), 'OUTSIDE_HOURS'));
T::check('Start 11:30 erlaubt', pv_validate_slot($konstanz, '2027-03-14', 690, $now) instanceof DateTimeImmutable);
T::check('heute + 14 nicht buchbar', T::throwsCode(static fn () => pv_validate_slot($konstanz, '2027-03-28', 690, $now), 'OUTSIDE_HOURS'));
T::check('heute + 13 buchbar', pv_validate_slot($konstanz, '2027-03-27', 690, $now) instanceof DateTimeImmutable);
T::check('21:45 (kein Raster) → OUTSIDE_HOURS', T::throwsCode(static fn () => pv_validate_slot($konstanz, '2027-03-15', 1305, $now), 'OUTSIDE_HOURS'));
T::check('22:00 (Ende nach 23 Uhr) → OUTSIDE_HOURS', T::throwsCode(static fn () => pv_validate_slot($konstanz, '2027-03-15', 1320, $now), 'OUTSIDE_HOURS'));
T::check('Porto-Vecchio im März geschlossen', pv_day_open($porto, '2027-03-20')[0] === false);
T::check('Porto-Vecchio im April offen', pv_day_open($porto, '2027-04-01')[0] === true);
T::check('Porto-Vecchio im März → OUTSIDE_HOURS', T::throwsCode(static fn () => pv_validate_slot($porto, '2027-03-15', 600, $now), 'OUTSIDE_HOURS'));
T::check('Santorini ganzjährig offen', pv_day_open($santorini, '2027-01-10')[0] === true);

echo "Slot-Status\n";
$keys = ['2027-03-14 09:00:00', '2027-03-14 09:30:00', '2027-03-14 10:00:00'];
$future = '2027-03-14 10:00:00';
$past = '2027-03-14 09:40:00';
$row = static fn (string $status, string $device, string $hold, ?string $exp): array => ['status' => $status, 'device_id' => $device, 'hold_id' => $hold, 'expires_at' => $exp];
T::check('leer → free', pv_slot_status([], $keys, 'me', $now)['status'] === 'free');
T::check('bestätigt → booked', pv_slot_status([$keys[1] => $row('confirmed', '', 'h', null)], $keys, 'me', $now)['status'] === 'booked');
T::check('fremder Hold → held', pv_slot_status([$keys[2] => $row('hold', 'other', 'h', $future)], $keys, 'me', $now)['status'] === 'held');
T::check('abgelaufener Hold → free', pv_slot_status([$keys[0] => $row('hold', 'other', 'h', $past)], $keys, 'me', $now)['status'] === 'free');
$mine = array_fill_keys($keys, $row('hold', 'me', 'h1', $future));
T::check('eigener Hold auf allen 3 Zellen → mine', pv_slot_status($mine, $keys, 'me', $now)['status'] === 'mine');
T::check('eigener Hold teilweise → free', pv_slot_status([$keys[2] => $row('hold', 'me', 'h1', $future)], $keys, 'me', $now)['status'] === 'free');

echo "Codes & Validierung\n";
$code = pv_generate_code();
T::check('Buchungscode-Format', (bool) preg_match('/^PV-[A-HJ-NP-Z2-9]{6}$/', $code), $code);
T::check('UUID v4', (bool) preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/', pv_uuid()));
T::check('Name wird bereinigt', pv_v_name('  Matheo   Mena Arribas ') === 'Matheo Mena Arribas');
T::check('Name mit Apostroph ok', pv_v_name("Zoë O'Neill") === "Zoë O'Neill");
T::check('Name zu kurz → VALIDATION', T::throwsCode(static fn () => pv_v_name('A'), 'VALIDATION'));
T::check('Name mit <script> → VALIDATION', T::throwsCode(static fn () => pv_v_name('<script>'), 'VALIDATION'));
T::check('E-Mail normalisiert', pv_v_email(' Max@Example.COM ')[1] === 'max@example.com');
T::check('ungültige E-Mail → VALIDATION', T::throwsCode(static fn () => pv_v_email('max@'), 'VALIDATION'));
T::check('E-Mail kürzen', pv_mask_email('matheo@gmail.com') === 'm***@gmail.com');
T::check('Uhrzeit 18:00 → 1080', pv_v_time('18:00') === 1080);
T::check('2027-02-31 ungültig', !pv_is_valid_date('2027-02-31'));
T::check('Code falsches Format → NOT_FOUND (neutral)', T::throwsCode(static fn () => pv_v_code('PV-0O1I23'), 'NOT_FOUND'));

echo "\nErgebnis: " . T::$passed . ' bestanden, ' . T::$failed . " fehlgeschlagen\n";
exit(T::$failed === 0 ? 0 : 1);