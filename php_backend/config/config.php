<?php
/**
 * ============================================================
 * APP CONFIGURATION — config.php
 * ============================================================
 * 
 * This file is the "brain" of the backend.
 * EVERY PHP page that needs the database or session
 * starts by including this one file:
 * 
 *   require_once __DIR__ . '/config/config.php';
 * 
 * That single line gives you:
 *   1. PHP session started (so $_SESSION works)
 *   2. $pdo — database connection ready to use
 *   3. APP_URL, APP_NAME etc. — constants
 *   4. Helper functions
 */

// -----------------------------------------------------------------
// 1. START THE PHP SESSION
// -----------------------------------------------------------------
// Sessions let us remember data across page loads.
// Examples: who is logged in, what's in their cart (server-side), 
// flash messages ("Registration successful!"), CSRF tokens.
//
// session_start() MUST be called before ANY output (HTML, echo, etc.)
// That's why this file has NO whitespace before <?php.
// -----------------------------------------------------------------

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// -----------------------------------------------------------------
// 2. LOAD THE DATABASE CONNECTION
// -----------------------------------------------------------------
// Include db_connect.php — this creates the $pdo variable.
// require_once ensures it's only loaded once (no duplicate connections).
// -----------------------------------------------------------------

require_once __DIR__ . '/db_connect.php';

// -----------------------------------------------------------------
// 3. APPLICATION CONSTANTS
// -----------------------------------------------------------------
// Use constants (not variables) for values that never change.
// They're globally accessible without global $var.
// -----------------------------------------------------------------

define('APP_NAME', 'ClickEat');              // Brand name
define('APP_URL',  'http://localhost:8080'); // Base URL — update to match your ServBay
define('APP_TIMEZONE', 'Asia/Kuala_Lumpur'); // Malaysia timezone

define('DELIVERY_FEE', 3.00);                // Flat delivery fee in RM
define('TAX_RATE',      0.06);              // 6% SST

// Upload settings
define('UPLOAD_DIR',     __DIR__ . '/../uploads/');          // Where files are stored
define('RECEIPT_DIR',    __DIR__ . '/../uploads/receipts/'); // Receipt images
define('MAX_UPLOAD_SIZE', 5 * 1024 * 1024);                  // 5MB max file size

// -----------------------------------------------------------------
// 4. HELPER FUNCTIONS
// -----------------------------------------------------------------
// These small reusable functions save code repetition across files.
// -----------------------------------------------------------------

/**
 * Redirect to another page and stop execution.
 * 
 * Usage: redirect('login.html');
 *        redirect('history.html?order=placed');
 *
 * @param string $url  The destination URL (relative or absolute)
 */
function redirect(string $url): void {
    header("Location: {$url}");
    exit;  // ALWAYS exit after header redirect — prevents code below from running
}

/**
 * Set a flash message that survives ONE redirect.
 * Flash messages are shown once then disappear (like "Login successful!").
 * 
 * Usage: set_flash('success', 'Registration complete! Please login.');
 *        // After redirect, in the target page:
 *        $msg = get_flash('success');  // Returns the message, then deletes it
 *
 * @param string $type    'success', 'error', 'warning', 'info'
 * @param string $message The message text
 */
function set_flash(string $type, string $message): void {
    $_SESSION['flash'][$type] = $message;
}

/**
 * Get and clear a flash message.
 * 
 * @param  string $type  The flash type to retrieve
 * @return string|null   The message, or null if none exists
 */
function get_flash(string $type): ?string {
    if (isset($_SESSION['flash'][$type])) {
        $message = $_SESSION['flash'][$type];
        unset($_SESSION['flash'][$type]);  // Delete after reading (one-time use)
        return $message;
    }
    return null;
}

/**
 * Check if a user is logged in.
 * After login, we set $_SESSION['user'] with their data.
 * 
 * Usage: if (is_logged_in()) { ... }
 *
 * @return bool  True if logged in
 */
function is_logged_in(): bool {
    return isset($_SESSION['user']) && !empty($_SESSION['user']);
}

/**
 * Get the currently logged-in user's ID.
 * 
 * @return int|null  User ID or null if not logged in
 */
function current_user_id(): ?int {
    return $_SESSION['user']['user_id'] ?? null;
}

/**
 * Get the currently logged-in user's role.
 * 
 * @return string|null  'customer', 'staff', 'admin', or null
 */
function current_user_role(): ?string {
    return $_SESSION['user']['role'] ?? null;
}

/**
 * Sanitize input — escape HTML special characters.
 * Use this when OUTPUTTING user data to prevent XSS attacks.
 * 
 * Example: echo h($user['name']);  // Safe even if name contains <script>
 *
 * @param  string|null $value  The potentially dangerous string
 * @return string              The safe string
 */
function h(?string $value): string {
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

/**
 * Send a JSON response and exit.
 * Most AJAX endpoints use this.
 * 
 * Usage: json_response(['success' => true, 'data' => $orders]);
 *
 * @param array $data      The data to encode as JSON
 * @param int   $http_code HTTP status code (200=OK, 400=Bad Request, 500=Error)
 */
function json_response(array $data, int $http_code = 200): void {
    http_response_code($http_code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Get POST data safely (returns null if key doesn't exist).
 * Always trim whitespace from both ends.
 * 
 * Usage: $email = post('email');  // instead of $_POST['email'] ?? ''
 *
 * @param  string $key  The form field name
 * @return string|null  The trimmed value, or null
 */
function post(string $key): ?string {
    return isset($_POST[$key]) ? trim($_POST[$key]) : null;
}

/**
 * Validate Malaysian phone number format.
 * Malaysian numbers: 01X-XXXXXXX (10-11 digits starting with 0)
 * 
 * @param  string $phone  Raw phone input
 * @return bool           True if valid
 */
function is_valid_malaysian_phone(string $phone): bool {
    $digits = preg_replace('/\D/', '', $phone);  // Remove all non-digits
    return preg_match('/^01[0-9]{8,9}$/', $digits) === 1;
}
