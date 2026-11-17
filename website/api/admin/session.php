<?php
declare(strict_types=1);
/** GET /api/admin/session.php → { loggedIn } – prüft beim Laden von /verwaltung, ob schon angemeldet */
require dirname(__DIR__) . '/lib/bootstrap.php';
pv_bootstrap_request();
pv_require_method('GET');
pv_ok(['loggedIn' => pv_admin_logged_in()]);