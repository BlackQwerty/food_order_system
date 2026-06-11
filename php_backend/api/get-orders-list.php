<?php
/**
 * ============================================================
 * GET ORDERS LIST — api/get-orders-list.php
 * ============================================================
 * 
 * THIS IS THE AJAX ENDPOINT for the staff dashboard.
 * Returns all orders with optional filtering by status.
 * 
 * USAGE:
 *   GET /php_backend/api/get-orders-list.php              → all orders
 *   GET /php_backend/api/get-orders-list.php?status=Pending → filtered
 *   GET /php_backend/api/get-orders-list.php?type=walkin    → walk-in only
 * 
 * REQUIRES: Staff or Admin login (checks session)
 */

require_once __DIR__ . '/../config/config.php';

// -----------------------------------------------------------------
// 1. AUTH CHECK
// -----------------------------------------------------------------

if (!is_logged_in()) {
    json_response(['success' => false, 'message' => 'Login required.'], 401);
}

$role = current_user_role();
if (!in_array($role, ['staff', 'admin'])) {
    json_response(['success' => false, 'message' => 'Access denied.'], 403);
}

// -----------------------------------------------------------------
// 2. ACCEPT GET REQUEST WITH OPTIONAL FILTERS
// -----------------------------------------------------------------

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['success' => false, 'message' => 'Use GET request.'], 405);
}

$filterStatus = trim($_GET['status'] ?? '');
$filterType   = trim($_GET['type'] ?? '');

// -----------------------------------------------------------------
// 3. BUILD AND EXECUTE QUERY
// -----------------------------------------------------------------
// Join with customers to get customer name.
// Group order items into a comma-separated string using GROUP_CONCAT.

$sql = "
    SELECT 
        o.order_id,
        o.order_number,
        o.order_type,
        o.table_number,
        o.order_status,
        o.payment_status,
        o.payment_method,
        o.total_amount,
        o.delivery_address,
        o.special_instructions,
        o.order_date,
        o.completed_time,
        COALESCE(c.name, 'Guest') AS customer_name,
        GROUP_CONCAT(
            CONCAT(COALESCE(mi.item_name, 'Item'), ' x', oi.quantity)
            ORDER BY oi.order_item_id
            SEPARATOR ', '
        ) AS items_summary,
        COUNT(oi.order_item_id) AS item_count
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.customer_id
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    LEFT JOIN menu_items mi ON oi.item_id = mi.item_id
    WHERE 1=1
";

$params = [];

// Apply status filter
if (!empty($filterStatus)) {
    $sql .= " AND o.order_status = :status";
    $params[':status'] = $filterStatus;
}

// Apply order type filter
if (!empty($filterType)) {
    $sql .= " AND o.order_type = :type";
    $params[':type'] = $filterType;
}

$sql .= " GROUP BY o.order_id ORDER BY o.order_date DESC LIMIT 100";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$orders = $stmt->fetchAll();

// -----------------------------------------------------------------
// 4. FORMAT DATA
// -----------------------------------------------------------------

foreach ($orders as &$order) {
    $order['total_amount'] = number_format((float) $order['total_amount'], 2);
    // Format table number for display
    if ($order['order_type'] === 'walkin' && $order['table_number']) {
        $order['table_display'] = "Table {$order['table_number']}";
    } else {
        $order['table_display'] = null;
    }
    // Determine next allowed status transitions
    $transitions = [
        'Pending'     => ['In Progress'],
        'In Progress' => ['Ready'],
        'Ready'       => ($order['order_type'] === 'online') ? ['Delivered'] : ['Completed'],
        'Completed'   => [],
        'Delivered'   => [],
        'Cancelled'   => [],
    ];
    $order['next_statuses'] = $transitions[$order['order_status']] ?? [];
}
unset($order);

// -----------------------------------------------------------------
// 5. RETURN RESPONSE
// -----------------------------------------------------------------

json_response([
    'success' => true,
    'count'   => count($orders),
    'orders'  => $orders,
    'filters' => [
        'status' => $filterStatus ?: 'all',
        'type'   => $filterType ?: 'all',
    ]
]);
