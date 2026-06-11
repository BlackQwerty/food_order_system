<?php
/**
 * ============================================================
 * ORDER PROCESSOR — order-process.php
 * ============================================================
 * 
 * THIS IS THE MOST IMPORTANT FILE — it creates an order.
 * 
 * DATA FLOW:
 *   order.html (cart items from localStorage + delivery info + payment)
 *     → JS serializes cart to hidden <input name="cart_data">
 *     → POST to THIS FILE
 *     → Validate all fields
 *     → Calculate subtotal, tax, delivery fee, total
 *     → BEGIN MySQL TRANSACTION
 *       → INSERT into orders table (1 row)
 *       → INSERT into order_items table (N rows — one per cart item)
 *     → COMMIT (save everything, or ROLLBACK on error)
 *     → Handle receipt upload (if payment_method = receipt)
 *     → Store order number in session for confirmation page
 *     → Redirect to order-confirmation.html
 * 
 * WHY TRANSACTIONS?
 *   An order is incomplete without its items. If the orders INSERT
 *   succeeds but order_items INSERT fails, we'd have a "ghost order"
 *   with no items. A transaction ensures BOTH succeed or NEITHER does.
 */

require_once __DIR__ . '/config/config.php';

// -----------------------------------------------------------------
// 1. ENSURE POST REQUEST
// -----------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/order.html');
}

// -----------------------------------------------------------------
// 2. COLLECT FORM DATA
// -----------------------------------------------------------------

$orderType          = post('orderType');            // 'walkin' or 'online'
$tableNum           = post('tableNum');             // Table number (walk-in only)
$deliveryName       = post('deliveryName');         // Recipient name
$deliveryAddress    = post('deliveryAddress');       // Delivery address
$deliveryPhone      = post('deliveryPhone');        // Contact phone
$specialInstructions = post('specialInstructions');  // Optional notes
$paymentMethod      = post('paymentMethod');         // 'cod', 'card', 'receipt'
$cartDataJson       = post('cart_data');             // JSON string of cart items

$errors = [];

// -----------------------------------------------------------------
// 3. VALIDATE CART DATA
// -----------------------------------------------------------------
// The cart comes as JSON from the JS frontend.
// Example: [{"name":"Nasi Lemak","price":8.90,"quantity":2}, ...]
// -----------------------------------------------------------------

if (empty($cartDataJson)) {
    $errors['cart'] = 'Your cart is empty. Please add items before checking out.';
} else {
    $cartItems = json_decode($cartDataJson, true);  // true = return as array, not object
    
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($cartItems) || empty($cartItems)) {
        $errors['cart'] = 'Invalid cart data. Please refresh the page and try again.';
    }
}

// -----------------------------------------------------------------
// 4. VALIDATE ORDER TYPE
// -----------------------------------------------------------------

if (!in_array($orderType, ['walkin', 'online'])) {
    $errors['orderType'] = 'Please select an order type.';
}

// Walk-in: validate table number
if ($orderType === 'walkin') {
    if (empty($tableNum) || (int) $tableNum <= 0) {
        $errors['tableNum'] = 'Please enter a valid table number.';
    }
}

// Online: validate delivery details
if ($orderType === 'online') {
    if (empty($deliveryName)) {
        $errors['deliveryName'] = 'Please enter the recipient\'s full name.';
    }
    if (empty($deliveryAddress)) {
        $errors['deliveryAddress'] = 'Please enter the delivery address.';
    }
    if (empty($deliveryPhone)) {
        $errors['deliveryPhone'] = 'Please enter a contact phone number.';
    } elseif (!is_valid_malaysian_phone($deliveryPhone)) {
        $errors['deliveryPhone'] = 'Please enter a valid Malaysian phone number.';
    }
}

// -----------------------------------------------------------------
// 5. VALIDATE PAYMENT METHOD
// -----------------------------------------------------------------

$validPaymentMethods = ['cod', 'card', 'receipt'];
if (!in_array($paymentMethod, $validPaymentMethods)) {
    $errors['paymentMethod'] = 'Please select a valid payment method.';
}

// Receipt upload validation
$receiptPath = null;
if ($paymentMethod === 'receipt') {
    if (!isset($_FILES['receiptFile']) || $_FILES['receiptFile']['error'] === UPLOAD_ERR_NO_FILE) {
        $errors['receiptFile'] = 'Please upload your payment receipt.';
    } elseif ($_FILES['receiptFile']['error'] !== UPLOAD_ERR_OK) {
        $errors['receiptFile'] = 'Error uploading file. Please try again.';
    } else {
        // Validate file type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        $fileType = $_FILES['receiptFile']['type'];
        
        if (!in_array($fileType, $allowedTypes)) {
            $errors['receiptFile'] = 'Only JPG, PNG, GIF, or PDF files are allowed.';
        }
        
        // Validate file size
        if ($_FILES['receiptFile']['size'] > MAX_UPLOAD_SIZE) {
            $errors['receiptFile'] = 'File is too large. Maximum size is 5MB.';
        }
    }
}

// If there are validation errors, go back
if (!empty($errors)) {
    $_SESSION['checkout_errors'] = $errors;
    $_SESSION['checkout_old']   = $_POST;
    redirect('/order.html');
}

// -----------------------------------------------------------------
// 6. CALCULATE ORDER TOTALS
// -----------------------------------------------------------------

$subtotal = 0.00;
foreach ($cartItems as $item) {
    $subtotal += $item['price'] * $item['quantity'];
}

// Only online orders have delivery fee
$deliveryFee = ($orderType === 'online') ? DELIVERY_FEE : 0.00;
$tax         = round($subtotal * TAX_RATE, 2);
$totalAmount = round($subtotal + $deliveryFee + $tax, 2);

// -----------------------------------------------------------------
// 7. GENERATE UNIQUE ORDER NUMBER
// -----------------------------------------------------------------
// Format: CE-20260612-A1B2 (ClickEat-Date-Random4chars)
// This is human-readable and unique enough for a restaurant.
// -----------------------------------------------------------------

$orderNumber = 'CE-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));

// -----------------------------------------------------------------
// 8. HANDLE RECEIPT UPLOAD
// -----------------------------------------------------------------
// Save the uploaded receipt to uploads/receipts/
// We rename the file to prevent filename collisions.
// -----------------------------------------------------------------

if ($paymentMethod === 'receipt' && isset($_FILES['receiptFile'])) {
    // Ensure the receipt directory exists
    if (!is_dir(RECEIPT_DIR)) {
        mkdir(RECEIPT_DIR, 0755, true);
    }
    
    $fileExt = pathinfo($_FILES['receiptFile']['name'], PATHINFO_EXTENSION);
    $fileName = $orderNumber . '_receipt.' . $fileExt;  // e.g., CE-20260612-A1B2_receipt.jpg
    $receiptPath = RECEIPT_DIR . $fileName;
    
    if (!move_uploaded_file($_FILES['receiptFile']['tmp_name'], $receiptPath)) {
        $_SESSION['checkout_errors'] = ['receiptFile' => 'Failed to save receipt. Please try again.'];
        redirect('/order.html');
    }
    
    // Store only the relative path in the database
    // (so the file can be accessed/referenced from the web)
    $receiptDbPath = 'uploads/receipts/' . $fileName;
}

// -----------------------------------------------------------------
// 9. BUILD DELIVERY ADDRESS (for online orders)
// -----------------------------------------------------------------

$deliveryAddressDb = null;
if ($orderType === 'online') {
    // Combine name + address + phone into one text field for simplicity
    $deliveryAddressDb = "Name: {$deliveryName}\nAddress: {$deliveryAddress}\nPhone: {$deliveryPhone}";
}

// -----------------------------------------------------------------
// 10. DETERMINE CUSTOMER ID
// -----------------------------------------------------------------
// If logged in, associate the order with the customer.
// Guest walk-in orders have customer_id = NULL.
// -----------------------------------------------------------------

$customerId = null;
$staffId = null;

if (is_logged_in()) {
    $role = current_user_role();
    $userId = current_user_id();
    
    if ($role === 'customer') {
        $customerId = $userId;
    } elseif ($role === 'staff') {
        $staffId = $userId;  // Staff member who placed the order (waiter)
    }
}

// Map payment method to database ENUM values
$paymentMap = [
    'cod'     => 'Cash',
    'card'    => 'Card',
    'receipt' => 'Receipt Upload',
];
$paymentMethodDb = $paymentMap[$paymentMethod] ?? 'Cash';

// -----------------------------------------------------------------
// 11. BEGIN TRANSACTION — INSERT ORDER + ORDER ITEMS
// -----------------------------------------------------------------
// A transaction groups multiple queries into one atomic unit.
// If ANY query fails, ALL changes are rolled back.
// -----------------------------------------------------------------

try {
    $pdo->beginTransaction();
    
    // --- 11a. INSERT INTO orders table ---
    $stmt = $pdo->prepare("
        INSERT INTO orders (
            order_number, customer_id, staff_id, order_type,
            table_number, order_status, payment_status, payment_method,
            payment_receipt, subtotal, delivery_fee, tax, total_amount,
            delivery_address, special_instructions
        ) VALUES (
            :order_number, :customer_id, :staff_id, :order_type,
            :table_number, 'Pending', 'Unpaid', :payment_method,
            :payment_receipt, :subtotal, :delivery_fee, :tax, :total_amount,
            :delivery_address, :special_instructions
        )
    ");
    
    $stmt->execute([
        ':order_number'         => $orderNumber,
        ':customer_id'          => $customerId,
        ':staff_id'             => $staffId,
        ':order_type'           => $orderType,
        ':table_number'         => $orderType === 'walkin' ? (int) $tableNum : null,
        ':payment_method'       => $paymentMethodDb,
        ':payment_receipt'      => $receiptDbPath ?? null,
        ':subtotal'             => $subtotal,
        ':delivery_fee'         => $deliveryFee,
        ':tax'                  => $tax,
        ':total_amount'         => $totalAmount,
        ':delivery_address'     => $deliveryAddressDb,
        ':special_instructions' => $specialInstructions ?: null,
    ]);
    
    // Get the order_id for the order_items table
    $orderId = $pdo->lastInsertId();
    
    // --- 11b. INSERT INTO order_items table (one row per cart item) ---
    $stmtItem = $pdo->prepare("
        INSERT INTO order_items (order_id, item_id, quantity, unit_price, subtotal, special_request)
        VALUES (:order_id, :item_id, :quantity, :unit_price, :subtotal, :special_request)
    ");
    
    foreach ($cartItems as $item) {
        // Try to find matching menu item by name
        $itemId = null;
        $stmtFind = $pdo->prepare("SELECT item_id FROM menu_items WHERE item_name = :name LIMIT 1");
        $stmtFind->execute([':name' => $item['name']]);
        $menuItem = $stmtFind->fetch();
        
        if ($menuItem) {
            $itemId = $menuItem['item_id'];
        }
        // item_id can be NULL if the item isn't in the menu_items table
        // (for custom/special items added by waiter)
        
        $lineSubtotal = round($item['price'] * $item['quantity'], 2);
        
        $stmtItem->execute([
            ':order_id'        => $orderId,
            ':item_id'         => $itemId,
            ':quantity'        => $item['quantity'],
            ':unit_price'      => $item['price'],
            ':subtotal'        => $lineSubtotal,
            ':special_request' => $item['specialRequest'] ?? null,
        ]);
    }
    
    // --- 11c. COMMIT — Save everything ---
    $pdo->commit();
    
} catch (Exception $e) {
    // Something went wrong — roll back ALL changes
    $pdo->rollBack();
    
    // Delete the uploaded receipt if it was saved
    if ($receiptPath && file_exists($receiptPath)) {
        unlink($receiptPath);
    }
    
    error_log("Order failed: " . $e->getMessage());
    
    $_SESSION['checkout_errors'] = [
        'general' => 'An error occurred while placing your order. Please try again.'
    ];
    redirect('/order.html');
}

// -----------------------------------------------------------------
// 12. STORE ORDER INFO FOR CONFIRMATION PAGE
// -----------------------------------------------------------------
// The confirmation page (order-confirmation.html) needs the order
// number and total to display. We pass them via session.
// -----------------------------------------------------------------

$_SESSION['last_order'] = [
    'order_number' => $orderNumber,
    'total'        => $totalAmount,
    'order_type'   => $orderType,
    'table_number' => $orderType === 'walkin' ? (int) $tableNum : null,
];

// Log the successful order
error_log("Order placed: {$orderNumber} — RM{$totalAmount} — {$orderType}");

// -----------------------------------------------------------------
// 13. REDIRECT TO CONFIRMATION PAGE
// -----------------------------------------------------------------

redirect('/order-confirmation.html');
