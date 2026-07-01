<?php
require_once __DIR__ . '/../config/config.php';

if (!is_logged_in() || current_user_role() !== 'admin') {
    json_response(['success' => false, 'message' => 'Admin access required.'], 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'message' => 'Use POST.'], 405);
}

$item_id      = (int)   ($_POST['item_id']      ?? 0);
$item_name    = trim(    $_POST['item_name']    ?? '');
$category     = trim(    $_POST['category']     ?? '');
$description  = trim(    $_POST['description']  ?? '');
$price        = trim(    $_POST['price']        ?? '');
$availability = isset($_POST['availability']) ? 1 : 0;

$errors = [];
if ($item_id <= 0)                              $errors['item_id']   = 'Invalid item.';
if (empty($item_name))                          $errors['item_name'] = 'Item name is required.';
if (empty($category))                           $errors['category']  = 'Category is required.';
if (!is_numeric($price) || (float)$price < 0)  $errors['price']     = 'Enter a valid price.';

if (!empty($errors)) {
    json_response(['success' => false, 'errors' => $errors], 422);
}

$stmt = $pdo->prepare("SELECT item_id, image_url FROM menu_items WHERE item_id = :id");
$stmt->execute([':id' => $item_id]);
$existing = $stmt->fetch();

if (!$existing) {
    json_response(['success' => false, 'message' => 'Item not found.'], 404);
}

$image_url = $existing['image_url'];

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['image'];

    if ($file['size'] > 2 * 1024 * 1024) {
        json_response(['success' => false, 'message' => 'Image must be under 2MB.'], 422);
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime  = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'])) {
        json_response(['success' => false, 'message' => 'Only JPG, PNG, or WebP images allowed.'], 422);
    }

    $ext       = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $filename  = uniqid('menu_', true) . '.' . $ext;
    $uploadDir = __DIR__ . '/../../images/menu/';

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    if (move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
        // Delete old uploaded image (only if it's in the managed folder)
        if ($image_url && strpos($image_url, 'images/menu/') === 0) {
            $oldPath = __DIR__ . '/../../' . $image_url;
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        }
        $image_url = 'images/menu/' . $filename;
    }
}

$stmt = $pdo->prepare("
    UPDATE menu_items
    SET item_name = :name, category = :category, description = :description,
        price = :price, image_url = :image_url, availability = :availability
    WHERE item_id = :id
");

$stmt->execute([
    ':name'         => $item_name,
    ':category'     => $category,
    ':description'  => $description,
    ':price'        => (float) $price,
    ':image_url'    => $image_url,
    ':availability' => $availability,
    ':id'           => $item_id,
]);

json_response([
    'success'   => true,
    'message'   => 'Menu item updated.',
    'image_url' => $image_url,
]);
