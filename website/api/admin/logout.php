<?php
declare(strict_types=1);
/** POST /api/admin/logout.php – beendet die Admin-Session */
require dirname(__DIR__) . '/lib/bootstrap.php';
pv_bootstrap_request();
pv_post_json();
pv_admin_logout();
pv_ok(['loggedIn' => false]);