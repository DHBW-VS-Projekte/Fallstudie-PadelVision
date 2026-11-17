<?php
declare(strict_types=1);
/**
 * POST /api/release.php  { holdId, holdToken }
 * Gibt einen Hold frei (nur mit passendem Token). Antwortet IMMER ok, damit
 * niemand herausfinden kann, ob eine Hold-ID existiert.
 */
require __DIR__ . '/lib/bootstrap.php';
pv_bootstrap_request();
$body = pv_post_json();
$pdo = pv_db();
pv_rate_guard($pdo, 'release', 20);
pv_release_hold($pdo, pv_v_uuid(pv_str($body, 'holdId'), 'holdId'), pv_v_token(pv_str($body, 'holdToken')));
pv_ok(['released' => true]);