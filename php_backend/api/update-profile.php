<?php
/**
 * UPDATE PROFILE — api/update-profile.php
 * Updates the logged-in customer's address (and optionally phone).
 *
 * POST /php_backend/api/update-profile.php
 * Body (JSON): { "address": "...", "phone": "..." }
 */

require_once __DIR__ . '/../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'message' => 'Use POST request.'], 405);
}

if (!is_logged_in()) {
    json_response(['success' => false, 'message' => 'Login required.'], 401);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    json_response(['success' => false, 'message' => 'Invalid JSON.'], 400);
}

$role = current_user_role();
$email = $_SESSION['user']['email'] ?? '';

// Find customer record (admin/staff may also have one)
$customerId = null;
if ($role === 'customer') {
    $customerId = current_user_id();
} elseif ($email) {
    $stmt = $pdo->prepare("SELECT customer_id FROM customers WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $row = $stmt->fetch();
    if ($row) $customerId = (int) $row['customer_id'];
}

if (!$customerId) {
    json_response(['success' => false, 'message' => 'Customer record not found.'], 404);
}

$fields = [];
$params = [':cid' => $customerId];

if (isset($input['address'])) {
    $fields[] = 'address = :address';
    $params[':address'] = trim($input['address']);
    $_SESSION['user']['address'] = trim($input['address']);
}

if (isset($input['phone']) && !empty(trim($input['phone']))) {
    $fields[] = 'phone = :phone';
    $params[':phone'] = trim($input['phone']);
    $_SESSION['user']['phone'] = trim($input['phone']);
}

if (empty($fields)) {
    json_response(['success' => false, 'message' => 'Nothing to update.'], 400);
}

$sql = "UPDATE customers SET " . implode(', ', $fields) . " WHERE customer_id = :cid";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);

json_response(['success' => true, 'message' => 'Profile updated.']);
