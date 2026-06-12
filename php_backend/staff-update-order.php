<?php
/**
 * ============================================================
 * STAFF UPDATE ORDER STATUS — staff-update-order.php
 * ============================================================
 * 
 * THIS IS THE AJAX ENDPOINT for updating order status.
 * Called from dashboard.html when a staff member clicks
 * the "→ In Progress" / "→ Ready" / "→ Completed" button.
 * 
 * FLOW:
 *   Staff clicks status button on dashboard.html
 *     → JS sends fetch() POST to THIS FILE with order_id + new_status
 *     → PHP checks: Is the user logged in as staff/admin?
 *     → PHP validates: Is this a valid status transition?
 *     → PHP updates the order in the database
 *     → PHP sets completed_time if status is Completed/Delivered
 *     → Returns JSON: {"success": true, "new_status": "..."}
 *     → JS updates the table row without page reload
 * 
 * VALID STATUS TRANSITIONS:
 *   Pending    → In Progress
 *   In Progress → Ready
 *   Ready      → Completed (walk-in)
 *   Ready      → Delivered (online)
 *   Any        → Cancelled
 */

require_once __DIR__ . '/config/config.php';

// -----------------------------------------------------------------
// 1. AUTH CHECK — Only staff and admin can update orders
// -----------------------------------------------------------------

if (!is_logged_in()) {
    json_response([
        'success' => false,
        'message' => 'You must be logged in to perform this action.'
    ], 401);  // 401 Unauthorized
}

$role = current_user_role();
if (!in_array($role, ['staff', 'admin'])) {
    json_response([
        'success' => false,
        'message' => 'Only staff members can update order status.'
    ], 403);  // 403 Forbidden
}

// -----------------------------------------------------------------
// 2. ENSURE POST REQUEST
// -----------------------------------------------------------------

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response([
        'success' => false,
        'message' => 'Invalid request method.'
    ], 405);
}

// -----------------------------------------------------------------
// 3. GET AND VALIDATE INPUT
// -----------------------------------------------------------------

$orderId   = post('order_id');
$newStatus = post('new_status');

if (empty($orderId) || empty($newStatus)) {
    json_response([
        'success' => false,
        'message' => 'Order ID and new status are required.'
    ], 400);
}

// Allowed status values (must match your ENUM)
$allowedStatuses = ['Pending', 'In Progress', 'Ready', 'Completed', 'Delivered', 'Cancelled'];

if (!in_array($newStatus, $allowedStatuses)) {
    json_response([
        'success' => false,
        'message' => 'Invalid status: ' . h($newStatus)
    ], 400);
}

// -----------------------------------------------------------------
// 4. FETCH THE CURRENT ORDER
// -----------------------------------------------------------------
// We need to check the current status to validate the transition.
// For example, you shouldn't jump directly from Pending to Completed.
// -----------------------------------------------------------------

$stmt = $pdo->prepare("
    SELECT order_id, order_number, order_status, order_type, payment_status
    FROM orders
    WHERE order_id = :order_id
    LIMIT 1
");
$stmt->execute([':order_id' => $orderId]);
$order = $stmt->fetch();

if (!$order) {
    json_response([
        'success' => false,
        'message' => 'Order not found.'
    ], 404);
}

$currentStatus = $order['order_status'];

// -----------------------------------------------------------------
// 5. VALIDATE THE STATUS TRANSITION
// -----------------------------------------------------------------
// Define which transitions are allowed.
// This prevents staff from accidentally skipping steps.
// -----------------------------------------------------------------

$validTransitions = [
    'Pending'     => ['In Progress', 'Cancelled'],
    'In Progress' => ['Ready', 'Cancelled'],
    'Ready'       => ['Completed', 'Delivered', 'Cancelled'],
    'Completed'   => [],           // Final state — no further transitions
    'Delivered'   => [],           // Final state
    'Cancelled'   => [],           // Final state
];

// Check if the transition is allowed
if (!isset($validTransitions[$currentStatus]) || 
    !in_array($newStatus, $validTransitions[$currentStatus])) {
    json_response([
        'success' => false,
        'message' => "Cannot change status from '{$currentStatus}' to '{$newStatus}'."
    ], 400);
}

// For online orders, Ready → Delivered (not Completed)
if ($order['order_type'] === 'online' && $currentStatus === 'Ready' && $newStatus === 'Completed') {
    // Suggest Delivered instead
    json_response([
        'success' => false,
        'message' => "For online orders, use 'Delivered' instead of 'Completed'."
    ], 400);
}

if ($order['order_type'] === 'walkin' && $currentStatus === 'Ready' && $newStatus === 'Delivered') {
    json_response([
        'success' => false,
        'message' => "For walk-in orders, use 'Completed' instead of 'Delivered'."
    ], 400);
}

// -----------------------------------------------------------------
// 6. UPDATE THE ORDER
// -----------------------------------------------------------------

try {
    // Build the UPDATE query
    // Set completed_time when order reaches final state
    $sql = "UPDATE orders SET order_status = :new_status";
    $params = [':new_status' => $newStatus, ':order_id' => $orderId];
    
    if (in_array($newStatus, ['Completed', 'Delivered'])) {
        $sql .= ", completed_time = NOW()";
    }
    
    // Mark payment as Paid when delivered
    if ($newStatus === 'Delivered') {
        $sql .= ", payment_status = 'Paid'";
    }
    
    $sql .= " WHERE order_id = :order_id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Check if any row was actually updated
    if ($stmt->rowCount() === 0) {
        json_response([
            'success' => false,
            'message' => 'No changes were made. The order may have been modified by another staff member.'
        ], 409);  // 409 Conflict
    }
    
} catch (PDOException $e) {
    error_log("Failed to update order {$orderId}: " . $e->getMessage());
    json_response([
        'success' => false,
        'message' => 'Database error. Please try again.'
    ], 500);
}

// -----------------------------------------------------------------
// 7. RETURN SUCCESS
// -----------------------------------------------------------------

error_log("Order {$order['order_number']}: {$currentStatus} → {$newStatus} (by user " . current_user_id() . ")");

json_response([
    'success'    => true,
    'message'    => "Order #{$order['order_number']} updated to '{$newStatus}'.",
    'order_id'   => (int) $orderId,
    'old_status' => $currentStatus,
    'new_status' => $newStatus,
]);
