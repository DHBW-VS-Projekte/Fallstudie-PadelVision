<?php
declare(strict_types=1);
/** POST /api/admin/reset.php { confirm: "RESET" } – löscht alle Testdaten (Standorte/Courts bleiben) */
require dirname(__DIR__) . '/lib/bootstrap.php';
pv_bootstrap_request();
$body = pv_post_json();
pv_admin_require();
if (pv_str($body, 'confirm') !== 'RESET') {
    pv_fail('VALIDATION', 422, 'Bitte RESET eintippen.');
}
pv_admin_reset(pv_db());
pv_ok(['reset' => true]);