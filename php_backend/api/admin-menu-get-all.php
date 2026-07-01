<?php
require_once __DIR__ . '/../config/config.php';

if (!is_logged_in() || current_user_role() !== 'admin') {
    json_response(['success' => false, 'message' => 'Admin access required.'], 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['success' => false, 'message' => 'Use GET.'], 405);
}

$category = trim($_GET['category'] ?? '');

$sql = "SELECT item_id, item_name, category, description, price, image_url, availability, created_at
        FROM menu_items";

$params = [];

if (!empty($category) && $category !== 'all') {
    $sql .= " WHERE category = :category";
    $params[':category'] = $category;
}

$sql .= " ORDER BY category, item_name";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$items = $stmt->fetchAll();

foreach ($items as &$item) {
    $item['price']        = number_format((float) $item['price'], 2);
    $item['availability'] = (bool) $item['availability'];
}
unset($item);

json_response(['success' => true, 'items' => $items, 'count' => count($items)]);
