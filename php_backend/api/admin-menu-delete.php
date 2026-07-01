<?php
require_once __DIR__ . '/../config/config.php';

if (!is_logged_in() || current_user_role() !== 'admin') {
    json_response(['success' => false, 'message' => 'Admin access required.'], 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'message' => 'Use POST.'], 405);
}

// Accept JSON body or POST form data
$input   = json_decode(file_get_contents('php://input'), true) ?? [];
$item_id = (int) ($input['item_id'] ?? $_POST['item_id'] ?? 0);

if ($item_id <= 0) {
    json_response(['success' => false, 'message' => 'Invalid item ID.'], 422);
}

// Soft delete — mark unavailable so historical order data stays intact
$stmt = $pdo->prepare("UPDATE menu_items SET availability = FALSE WHERE item_id = :id");
$stmt->execute([':id' => $item_id]);

if ($stmt->rowCount() === 0) {
    json_response(['success' => false, 'message' => 'Item not found.'], 404);
}

json_response(['success' => true, 'message' => 'Item removed from menu.']);
