<?php
/**
 * ============================================================
 * GET SESSION USER — api/get-session-user.php
 * ============================================================
 * 
 * THIS IS THE BRIDGE between PHP session and JavaScript frontend.
 * 
 * PROBLEM: HTML pages can't directly read PHP $_SESSION.
 * SOLUTION: JS calls this endpoint, which reads the session
 *           and returns the user data as JSON.
 * 
 * USED BY:
 *   - nav_bar.js     → "Hello, Ahmad" in the navbar
 *   - dashboard.js   → profile name, email, phone
 *   - index.js       → "Welcome back!" or "Join us!" CTA
 *   - order-confirmation.js → last order info
 * 
 * RESPONSE (logged in):
 *   {
 *     "logged_in": true,
 *     "user": {
 *       "name": "Ahmad bin Ali",
 *       "email": "ahmad@example.com",
 *       "role": "customer",
 *       "phone": "0123456789",
 *       "user_id": 1
 *     },
 *     "last_order": { ... }    // Only if set
 *   }
 * 
 * RESPONSE (not logged in):
 *   {
 *     "logged_in": false,
 *     "user": null,
 *     "last_order": null
 *   }
 */

require_once __DIR__ . '/../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['success' => false, 'message' => 'Use GET request.'], 405);
}

$response = [
    'success'    => true,
    'logged_in'  => false,
    'user'       => null,
    'last_order' => null,
    'flash'      => null,   // ← Form errors, old input, success messages
];

// --- Flash messages (form errors, old input, success) ---
$flash = [];
if (!empty($_SESSION['register_errors'])) {
    $flash['errors']   = $_SESSION['register_errors'];
    $flash['old']      = $_SESSION['register_old'] ?? [];
    $flash['type']     = 'register';
    unset($_SESSION['register_errors'], $_SESSION['register_old']);
} elseif (!empty($_SESSION['login_errors'])) {
    $flash['errors']   = $_SESSION['login_errors'];
    $flash['old']      = $_SESSION['login_old'] ?? [];
    $flash['type']     = 'login';
    unset($_SESSION['login_errors'], $_SESSION['login_old']);
} elseif (!empty($_SESSION['checkout_errors'])) {
    $flash['errors']   = $_SESSION['checkout_errors'];
    $flash['old']      = $_SESSION['checkout_old'] ?? [];
    $flash['type']     = 'checkout';
    unset($_SESSION['checkout_errors'], $_SESSION['checkout_old']);
}
// Success message
if (isset($_SESSION['flash']['success'])) {
    $flash['success'] = $_SESSION['flash']['success'];
    unset($_SESSION['flash']['success']);
}
if (!empty($flash)) {
    $response['flash'] = $flash;
}

// --- If logged in, include user data ---
if (is_logged_in()) {
    $response['logged_in'] = true;
    $response['user'] = [
        'name'    => $_SESSION['user']['name']    ?? 'User',
        'email'   => $_SESSION['user']['email']   ?? '',
        'role'    => $_SESSION['user']['role']    ?? 'customer',
        'phone'   => $_SESSION['user']['phone']   ?? '',
        'user_id' => $_SESSION['user']['user_id'] ?? null,
    ];
    
    // Include role-specific fields
    if ($_SESSION['user']['role'] === 'customer') {
        $response['user']['customer_type'] = $_SESSION['user']['customer_type'] ?? 'online';
    }
    if ($_SESSION['user']['role'] === 'staff') {
        $response['user']['position']   = $_SESSION['user']['position'] ?? '';
        $response['user']['staff_code'] = $_SESSION['user']['staff_code'] ?? '';
    }
}

// --- Include last order info (set by order-process.php) ---
if (isset($_SESSION['last_order'])) {
    $response['last_order'] = [
        'order_number' => $_SESSION['last_order']['order_number'] ?? '',
        'total'        => $_SESSION['last_order']['total']        ?? '0.00',
        'order_type'   => $_SESSION['last_order']['order_type']   ?? '',
    ];
}

json_response($response);
