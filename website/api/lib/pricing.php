<?php
declare(strict_types=1);
/**
 * lib/pricing.php – Preisberechnung (IMMER serverseitig)
 *
 * Ein Preis aus dem Browser wird nie übernommen:
 *   Grundpreis (Outdoor 28 € / Indoor 32 €) + Panorama 6 € + Prime Time 8 €
 *   + Schläger 4 € je Stück (0–4) + Bälle 6 € je Dose (0–2).
 * Alle Beträge in Cent (Integer) → keine Rundungsfehler.
 */

function pv_court_price(array $court, string $date, int $minute): array
{
    $p = pv_pricing();
    return [
        'baseCents' => $court['kind'] === 'indoor' ? $p['indoorCents'] : $p['outdoorCents'],
        'panoramaCents' => $court['panorama'] ? $p['panoramaCents'] : 0,
        'primeCents' => pv_is_prime($date, $minute) ? $p['primeTimeCents'] : 0,
    ];
}

function pv_price_parts(array $court, string $date, int $minute, int $rackets, int $balls): array
{
    $p = pv_pricing();
    $parts = pv_court_price($court, $date, $minute);
    $parts['racketsCents'] = $rackets * $p['racketCents'];
    $parts['ballsCents'] = $balls * $p['ballsCents'];
    $parts['totalCents'] = array_sum($parts);
    return $parts;
}