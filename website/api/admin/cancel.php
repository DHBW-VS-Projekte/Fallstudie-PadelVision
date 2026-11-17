<?php
declare(strict_types=1);
/** POST /api/admin/cancel.php { bookingId } – Buchung stornieren, Slot sofort wieder frei */
require dirname(__DIR__) . '/lib/bootstrap.php';
pv_bootstrap_request();
$body = pv_post_json();
pv_admin_require();
$id = $body['bookingId'] ?? null;
if (!is_int($id) || $id < 1) {
    pv_fail('VALIDATION', 422, 'Ungültige Buchung.');
}
pv_admin_cancel(pv_db(), $id);
pv_ok(['cancelled' => true]);