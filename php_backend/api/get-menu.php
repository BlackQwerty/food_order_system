<?php
/**
 * ============================================================
 * GET MENU — api/get-menu.php
 * ============================================================
 * 
 * THIS IS THE AJAX ENDPOINT for loading menu items dynamically.
 * Called from menu.html to fetch items from the database.
 * 
 * USAGE:
 *   GET /php_backend/api/get-menu.php              → all items
 *   GET /php_backend/api/get-menu.php?category=Main Course → filtered
 * 
 * RESPONSE:
 *   {
 *     "success": true,
 *     "items": [
 *       {
 *         "item_id": 1,
 *         "item_name": "Nasi Lemak",
 *         "category": "Main Course",
 *         "description": "Fragrant coconut rice...",
 *         "price": "8.90",
 *         "image_url": "images/Main Course/Nasi-Lemak.png",
 *         "availability": true
 *       },
 *       ...
 *     ],
 *     "categories": ["Main Course", "Beverage", "Dessert"]
 *   }
 */

require_once __DIR__ . '/../config/config.php';

// -----------------------------------------------------------------
// 1. ACCEPT GET REQUEST
// -----------------------------------------------------------------

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['success' => false, 'message' => 'Use GET request.'], 405);
}

// -----------------------------------------------------------------
// 2. BUILD QUERY (with optional category filter)
// -----------------------------------------------------------------

$category = trim($_GET['category'] ?? '');

$sql = "SELECT item_id, item_name, category, description, price, image_url, availability 
        FROM menu_items 
        WHERE availability = TRUE";

$params = [];

if (!empty($category)) {
    $sql .= " AND category = :category";
    $params[':category'] = $category;
}

$sql .= " ORDER BY category, item_name";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$items = $stmt->fetchAll();

// -----------------------------------------------------------------
// 3. FORMAT PRICES
// -----------------------------------------------------------------
// PDO returns DECIMAL values as strings. Format them consistently.

foreach ($items as &$item) {
    $item['price'] = number_format((float) $item['price'], 2);
    // If image_url is null, provide a placeholder
    if (empty($item['image_url'])) {
        $item['image_url'] = 'images/.gitkeep';  // Placeholder
    }
}
unset($item);  // Unset reference to avoid side effects

// -----------------------------------------------------------------
// 4. GET ALL DISTINCT CATEGORIES
// -----------------------------------------------------------------
// The menu.html filter tabs need to know what categories exist.

$stmtCat = $pdo->query("SELECT DISTINCT category FROM menu_items WHERE availability = TRUE ORDER BY category");
$categories = $stmtCat->fetchAll(PDO::FETCH_COLUMN);

// -----------------------------------------------------------------
// 5. RETURN RESPONSE
// -----------------------------------------------------------------

json_response([
    'success'    => true,
    'count'      => count($items),
    'items'      => $items,
    'categories' => $categories,
]);
