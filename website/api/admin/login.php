<?php
declare(strict_types=1);
/** POST /api/admin/login.php { password } – 5 Fehlversuche pro Gerät → 1 Minute Sperre */
require dirname(__DIR__) . '/lib/bootstrap.php';
pv_bootstrap_request();
$body = pv_post_json();
pv_admin_login(pv_db(), pv_str($body, 'password'));
pv_ok(['loggedIn' => true]);