<?php
/**
 * ============================================================
 * GET MY ORDERS — api/get-my-orders.php
 * ============================================================
 * Returns the current customer's own orders, most recent first.
 * Session-scoped: only the logged-in customer sees their orders.
 *
 * USAGE:  GET /php_backend/api/get-my-orders.php
 * RESPONSE:
 *   {
 *     "success": true,
 *     "count": 3,
 *     "orders": [
 *       {
 *         "order_number": "CE-20260702-A1B2",
 *         "order_type": "online",
 *         "order_status": "In Progress",
 *         "total_amount": "28.50",
 *         "order_date": "2026-07-02 14:30:00",
 *         "item_count": 3,
 *         "items_summary": "Nasi Lemak x2, Teh Tarik x1"
 *       }, ...
 *     ]
 *   }
 */

require_once __DIR__ . '/../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['success' => false, 'message' => 'Use GET request.'], 405);
}

if (!is_logged_in()) {
    json_response(['success' => false, 'message' => 'Login required.'], 401);
}

$role = current_user_role();
$customerId = null;

if ($role === 'customer') {
    $customerId = current_user_id();
} elseif ($role === 'admin' || $role === 'staff') {
    // Admin/staff can also be a customer — look up by email
    $userEmail = $_SESSION['user']['email'] ?? '';
    if ($userEmail) {
        $stmtCust = $pdo->prepare("SELECT customer_id FROM customers WHERE email = :email LIMIT 1");
        $stmtCust->execute([':email' => $userEmail]);
        $custRow = $stmtCust->fetch();
        if ($custRow) {
            $customerId = (int) $custRow['customer_id'];
        }
    }
}

if (!$customerId) {
    json_response(['success' => true, 'count' => 0, 'orders' => []]);
}

$stmt = $pdo->prepare("
    SELECT
        o.order_id,
        o.order_number,
        o.order_type,
        o.order_status,
        o.total_amount,
        o.table_number,
        o.order_date,
        COUNT(oi.order_item_id) AS item_count,
        GROUP_CONCAT(
            CONCAT(COALESCE(mi.item_name, 'Item'), ' x', oi.quantity)
            ORDER BY oi.order_item_id
            SEPARATOR ', '
        ) AS items_summary
    FROM orders o
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    LEFT JOIN menu_items  mi ON oi.item_id  = mi.item_id
    WHERE o.customer_id = :cid
    GROUP BY o.order_id
    ORDER BY o.order_date DESC
    LIMIT 25
");
$stmt->execute([':cid' => $customerId]);
$orders = $stmt->fetchAll();

foreach ($orders as &$o) {
    $o['total_amount'] = number_format((float) $o['total_amount'], 2);
}
unset($o);

json_response([
    'success' => true,
    'count'   => count($orders),
    'orders'  => $orders,
]);
