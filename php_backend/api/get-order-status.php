<?php
/**
 * ============================================================
 * GET ORDER STATUS — api/get-order-status.php
 * ============================================================
 * 
 * THIS IS THE AJAX ENDPOINT for the tracking page.
 * Called from tracking.html when user clicks "Track Order".
 * 
 * USAGE:
 *   GET /php_backend/api/get-order-status.php?order_number=CE-20260612-A1B2
 * 
 * RESPONSE:
 *   {
 *     "success": true,
 *     "order": {
 *       "order_number": "CE-20260612-A1B2",
 *       "order_type": "online",
 *       "order_status": "In Progress",
 *       "current_step": 2,
 *       "total_amount": "28.50",
 *       "items": [
 *         {"name": "Nasi Lemak", "quantity": 2, "price": "8.90"},
 *         ...
 *       ],
 *       "order_date": "2026-06-12 14:30:00"
 *     }
 *   }
 * 
 * PROGRESS STEPS MAPPING:
 *   Step 1: "Order Placed"     → always active after order created
 *   Step 2: "Kitchen Prep"     → order_status = "In Progress"
 *   Step 3: "Ready"            → order_status = "Ready"
 *   Step 4: "Out for Delivery" → order_status = "Ready" (online) or "Completed" (walkin)
 *   Step 5: "Delivered"        → order_status = "Delivered" (online) or "Completed" (walkin)
 */

require_once __DIR__ . '/../config/config.php';

// -----------------------------------------------------------------
// 1. ACCEPT GET REQUEST
// -----------------------------------------------------------------
// The tracking page sends: GET ?order_number=CE-20260612-A1B2

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['success' => false, 'message' => 'Use GET request.'], 405);
}

$orderNumber = trim($_GET['order_number'] ?? '');

if (empty($orderNumber)) {
    json_response(['success' => false, 'message' => 'Please provide an order number.'], 400);
}

// -----------------------------------------------------------------
// 2. LOOK UP THE ORDER
// -----------------------------------------------------------------

$stmt = $pdo->prepare("
    SELECT 
        o.order_id,
        o.order_number,
        o.order_type,
        o.order_status,
        o.total_amount,
        o.table_number,
        o.delivery_address,
        o.order_date,
        o.estimated_complete_time,
        o.completed_time,
        c.name AS customer_name
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.customer_id
    WHERE o.order_number = :order_number
    LIMIT 1
");
$stmt->execute([':order_number' => $orderNumber]);
$order = $stmt->fetch();

if (!$order) {
    json_response(['success' => false, 'message' => 'Order not found. Please check your order number.'], 404);
}

// -----------------------------------------------------------------
// 3. LOOK UP ORDER ITEMS
// -----------------------------------------------------------------

$stmtItems = $pdo->prepare("
    SELECT 
        oi.quantity,
        oi.unit_price AS price,
        oi.subtotal,
        COALESCE(mi.item_name, 'Unknown Item') AS item_name
    FROM order_items oi
    LEFT JOIN menu_items mi ON oi.item_id = mi.item_id
    WHERE oi.order_id = :order_id
");
$stmtItems->execute([':order_id' => $order['order_id']]);
$items = $stmtItems->fetchAll();

// -----------------------------------------------------------------
// 4. MAP STATUS TO PROGRESS STEP
// -----------------------------------------------------------------
// The tracking page has 5 visual steps:
//   1 = Order Placed
//   2 = Kitchen Prep (In Progress)
//   3 = Ready
//   4 = Out for Delivery / Completed
//   5 = Delivered / Completed

$statusToStep = [
    'Pending'     => 1,
    'In Progress' => 2,
    'Ready'       => 3,
    'Completed'   => 5,  // Walk-in: jumps to step 5 (final)
    'Delivered'   => 5,  // Online: final step
    'Cancelled'   => 0,  // Special case — cancelled
];

// For online orders, Ready = step 3, then there's step 4 (Out for Delivery)
// before Delivered (step 5). But we don't have a separate status for
// "Out for Delivery" in the schema, so we use Completed as step 4 for online.

$currentStep = $statusToStep[$order['order_status']] ?? 1;

// -----------------------------------------------------------------
// 5. BUILD RESPONSE
// -----------------------------------------------------------------

json_response([
    'success' => true,
    'order'   => [
        'order_number'            => $order['order_number'],
        'order_type'              => $order['order_type'],
        'order_status'            => $order['order_status'],
        'current_step'            => $currentStep,
        'total_amount'            => number_format((float) $order['total_amount'], 2),
        'table_number'            => $order['table_number'],
        'customer_name'           => $order['customer_name'] ?? 'Guest',
        'items'                   => $items,
        'order_date'              => $order['order_date'],
        'estimated_complete_time' => $order['estimated_complete_time'],
        'completed_time'          => $order['completed_time'],
    ]
]);
