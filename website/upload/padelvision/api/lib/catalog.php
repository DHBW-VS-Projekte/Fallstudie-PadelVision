<?php
declare(strict_types=1);
/**
 * lib/catalog.php – liest api/data/catalog.json (Kopie von src/data/catalog.json)
 *
 * Standorte, Courts, Öffnungszeiten, Preise und Regeln kommen IMMER aus dem
 * Katalog – exakt dieselbe Datei wie im Frontend. Die Datenbank kennt nur die
 * IDs (für Fremdschlüssel).
 */

/** @return array<string, mixed> */
function pv_catalog(): array
{
    static $catalog = null;
    if (is_array($catalog)) {
        return $catalog;
    }
    $path = dirname(__DIR__) . '/data/catalog.json';
    $raw = is_file($path) ? file_get_contents($path) : false;
    if ($raw === false) {
        error_log('PadelVision: api/data/catalog.json fehlt – npm run build bzw. node scripts/copy-catalog.mjs ausführen.');
        throw new PvError('SERVER_ERROR', 503);
    }
    $catalog = json_decode($raw, true, 32, JSON_THROW_ON_ERROR);
    return $catalog;
}

/** @return array<string, int> */
function pv_rules(): array
{
    return pv_catalog()['rules'];
}

/** @return array<string, mixed> */
function pv_pricing(): array
{
    return pv_catalog()['pricing'];
}

/** @return array<string, mixed>|null */
function pv_location(string $slug): ?array
{
    foreach (pv_catalog()['locations'] as $location) {
        if ($location['slug'] === $slug) {
            return $location;
        }
    }
    return null;
}

/** @return array{court: array<string, mixed>, location: array<string, mixed>}|null */
function pv_court(string $courtId): ?array
{
    foreach (pv_catalog()['locations'] as $location) {
        foreach ($location['courts'] as $court) {
            if ($court['id'] === $courtId) {
                return ['court' => $court, 'location' => $location];
            }
        }
    }
    return null;
}