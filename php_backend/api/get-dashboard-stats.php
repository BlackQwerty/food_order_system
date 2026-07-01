<?php
/**
 * GET DASHBOARD STATS — api/get-dashboard-stats.php
 *
 * Returns analytics data tailored to the logged-in user's role.
 *
 * Customer: their own spending, order counts, favourite item, etc.
 * Admin:    restaurant-wide stats — revenue, order counts, popular items, customer count.
 */

require_once __DIR__ . '/../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['success' => false, 'message' => 'Use GET request.'], 405);
}

if (!is_logged_in()) {
    json_response(['success' => false, 'message' => 'Login required.'], 401);
}

$role = current_user_role();

if ($role === 'admin') {
    // ---- ADMIN STATS (restaurant-wide) ----

    // Total revenue
    $row = $pdo->query("SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE order_status != 'Cancelled'")->fetch();
    $totalRevenue = (float) $row['total'];

    // Today's revenue
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE DATE(order_date) = CURDATE() AND order_status != 'Cancelled'");
    $stmt->execute();
    $todayRevenue = (float) $stmt->fetch()['total'];

    // Order counts by status
    $rows = $pdo->query("SELECT order_status, COUNT(*) AS cnt FROM orders GROUP BY order_status")->fetchAll();
    $statusCounts = [];
    $totalOrders = 0;
    foreach ($rows as $r) {
        $statusCounts[$r['order_status']] = (int) $r['cnt'];
        $totalOrders += (int) $r['cnt'];
    }

    // Today's orders
    $stmt = $pdo->prepare("SELECT COUNT(*) AS cnt FROM orders WHERE DATE(order_date) = CURDATE()");
    $stmt->execute();
    $todayOrders = (int) $stmt->fetch()['cnt'];

    // Order type split
    $rows = $pdo->query("SELECT order_type, COUNT(*) AS cnt FROM orders WHERE order_status != 'Cancelled' GROUP BY order_type")->fetchAll();
    $typeCounts = [];
    foreach ($rows as $r) $typeCounts[$r['order_type']] = (int) $r['cnt'];

    // Total customers
    $totalCustomers = (int) $pdo->query("SELECT COUNT(*) AS cnt FROM customers WHERE status = 'active'")->fetch()['cnt'];

    // Total menu items
    $totalMenuItems = (int) $pdo->query("SELECT COUNT(*) AS cnt FROM menu_items WHERE availability = 1")->fetch()['cnt'];

    // Top 5 popular items
    $topItems = $pdo->query("
        SELECT mi.item_name, SUM(oi.quantity) AS total_qty, SUM(oi.subtotal) AS total_sales
        FROM order_items oi
        JOIN menu_items mi ON oi.item_id = mi.item_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.order_status != 'Cancelled'
        GROUP BY oi.item_id
        ORDER BY total_qty DESC
        LIMIT 5
    ")->fetchAll();
    foreach ($topItems as &$ti) {
        $ti['total_qty'] = (int) $ti['total_qty'];
        $ti['total_sales'] = number_format((float) $ti['total_sales'], 2);
    }
    unset($ti);

    // Average order value
    $avgOrder = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

    json_response([
        'success' => true,
        'role'    => 'admin',
        'stats'   => [
            'total_revenue'    => number_format($totalRevenue, 2),
            'today_revenue'    => number_format($todayRevenue, 2),
            'total_orders'     => $totalOrders,
            'today_orders'     => $todayOrders,
            'avg_order_value'  => number_format($avgOrder, 2),
            'status_counts'    => $statusCounts,
            'type_counts'      => $typeCounts,
            'total_customers'  => $totalCustomers,
            'total_menu_items' => $totalMenuItems,
            'top_items'        => $topItems,
        ]
    ]);

} else {
    // ---- CUSTOMER STATS ----
    $customerId = null;
    if ($role === 'customer') {
        $customerId = current_user_id();
    } else {
        $email = $_SESSION['user']['email'] ?? '';
        if ($email) {
            $stmt = $pdo->prepare("SELECT customer_id FROM customers WHERE email = :e LIMIT 1");
            $stmt->execute([':e' => $email]);
            $r = $stmt->fetch();
            if ($r) $customerId = (int) $r['customer_id'];
        }
    }

    if (!$customerId) {
        json_response(['success' => true, 'role' => $role, 'stats' => null]);
    }

    // Total spent
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE customer_id = :cid AND order_status != 'Cancelled'");
    $stmt->execute([':cid' => $customerId]);
    $totalSpent = (float) $stmt->fetch()['total'];

    // Order count
    $stmt = $pdo->prepare("SELECT COUNT(*) AS cnt FROM orders WHERE customer_id = :cid");
    $stmt->execute([':cid' => $customerId]);
    $totalOrders = (int) $stmt->fetch()['cnt'];

    // Completed orders
    $stmt = $pdo->prepare("SELECT COUNT(*) AS cnt FROM orders WHERE customer_id = :cid AND order_status IN ('Completed','Delivered')");
    $stmt->execute([':cid' => $customerId]);
    $completedOrders = (int) $stmt->fetch()['cnt'];

    // Active orders (not completed/cancelled)
    $stmt = $pdo->prepare("SELECT COUNT(*) AS cnt FROM orders WHERE customer_id = :cid AND order_status IN ('Pending','In Progress','Ready')");
    $stmt->execute([':cid' => $customerId]);
    $activeOrders = (int) $stmt->fetch()['cnt'];

    // Average order value
    $avgOrder = $totalOrders > 0 ? $totalSpent / $totalOrders : 0;

    // Favourite item (most ordered)
    $stmt = $pdo->prepare("
        SELECT mi.item_name, SUM(oi.quantity) AS total_qty
        FROM order_items oi
        JOIN menu_items mi ON oi.item_id = mi.item_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.customer_id = :cid AND o.order_status != 'Cancelled'
        GROUP BY oi.item_id
        ORDER BY total_qty DESC
        LIMIT 1
    ");
    $stmt->execute([':cid' => $customerId]);
    $fav = $stmt->fetch();

    // Order type breakdown
    $stmt = $pdo->prepare("SELECT order_type, COUNT(*) AS cnt FROM orders WHERE customer_id = :cid AND order_status != 'Cancelled' GROUP BY order_type");
    $stmt->execute([':cid' => $customerId]);
    $typeCounts = [];
    foreach ($stmt->fetchAll() as $r) $typeCounts[$r['order_type']] = (int) $r['cnt'];

    // Top 3 items
    $stmt = $pdo->prepare("
        SELECT mi.item_name, SUM(oi.quantity) AS total_qty
        FROM order_items oi
        JOIN menu_items mi ON oi.item_id = mi.item_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.customer_id = :cid AND o.order_status != 'Cancelled'
        GROUP BY oi.item_id
        ORDER BY total_qty DESC
        LIMIT 3
    ");
    $stmt->execute([':cid' => $customerId]);
    $topItems = $stmt->fetchAll();
    foreach ($topItems as &$ti) $ti['total_qty'] = (int) $ti['total_qty'];
    unset($ti);

    json_response([
        'success' => true,
        'role'    => $role,
        'stats'   => [
            'total_spent'      => number_format($totalSpent, 2),
            'total_orders'     => $totalOrders,
            'completed_orders' => $completedOrders,
            'active_orders'    => $activeOrders,
            'avg_order_value'  => number_format($avgOrder, 2),
            'favourite_item'   => $fav ? $fav['item_name'] : null,
            'type_counts'      => $typeCounts,
            'top_items'        => $topItems,
        ]
    ]);
}
