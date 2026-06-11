<?php
/**
 * ============================================================
 * LOGIN PROCESSOR — login-process.php
 * ============================================================
 * 
 * THIS FILE HANDLES LOGIN FOR ALL THREE USER TYPES:
 *   - Customer  (customers table)  → redirects to history.html
 *   - Staff     (staff table)      → redirects to staff-dashboard.html
 *   - Admin     (admin table)      → redirects to staff-dashboard.html
 * 
 * FLOW:
 *   login.html (email + password entered)
 *     → [JS validates fields aren't empty]
 *     → POST to login-process.php
 *     → [PHP validates again]
 *     → Search customers table for email
 *       → Found? verify password → yes? LOG IN as customer
 *     → Not in customers? Search staff table
 *       → Found? verify password → yes? LOG IN as staff
 *     → Not in staff? Search admin table
 *       → Found? verify password → yes? LOG IN as admin
 *     → No match? Error: "Invalid email or password"
 * 
 * WHY "Invalid email or password" and not "Email not found"?
 *   Telling the attacker whether the email exists helps them
 *   enumerate users. Vague error messages are more secure.
 */

require_once __DIR__ . '/config/config.php';

// -----------------------------------------------------------------
// 1. ENSURE POST REQUEST
// -----------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/login.html');
}

// -----------------------------------------------------------------
// 2. COLLECT FORM DATA
// -----------------------------------------------------------------
// login.html fields: email, password, rememberMe (checkbox)
// -----------------------------------------------------------------

$email      = post('email');
$password   = post('password');
$rememberMe = isset($_POST['rememberMe']);  // Checkbox: present if checked

// -----------------------------------------------------------------
// 3. VALIDATE
// -----------------------------------------------------------------

$errors = [];

if (empty($email)) {
    $errors['email'] = 'Please enter your email address.';
}

if (empty($password)) {
    $errors['password'] = 'Please enter your password.';
}

if (!empty($errors)) {
    $_SESSION['login_errors'] = $errors;
    $_SESSION['login_old']   = ['email' => $email];  // Only save email, not password
    redirect('/login.html');
}

// -----------------------------------------------------------------
// 4. SEARCH ACROSS ALL THREE TABLES
// -----------------------------------------------------------------
// We'll try each table one by one. The first match wins.
// We store the table source so we know what role this user has.
// -----------------------------------------------------------------

$user         = null;   // Will hold the user's row from whichever table
$user_source  = null;   // 'customers', 'staff', or 'admin'

// ---- TRY CUSTOMERS TABLE ----
$stmt = $pdo->prepare("
    SELECT customer_id, name, email, password, phone, customer_type 
    FROM customers 
    WHERE email = :email AND status = 'active'
    LIMIT 1
");
$stmt->execute([':email' => $email]);
$row = $stmt->fetch();

if ($row) {
    // Found in customers table — now verify the password
    if (password_verify($password, $row['password'])) {
        $user = $row;
        $user_source = 'customers';
    }
}

// ---- TRY STAFF TABLE (only if not found in customers) ----
if ($user === null) {
    $stmt = $pdo->prepare("
        SELECT staff_id, full_name, email, password, phone, position, shift, staff_code
        FROM staff 
        WHERE email = :email AND status = 'Active'
        LIMIT 1
    ");
    $stmt->execute([':email' => $email]);
    $row = $stmt->fetch();
    
    if ($row && password_verify($password, $row['password'])) {
        $user = $row;
        $user_source = 'staff';
    }
}

// ---- TRY ADMIN TABLE (only if not found in customers or staff) ----
if ($user === null) {
    $stmt = $pdo->prepare("
        SELECT admin_id, full_name, email, password, role, username
        FROM admin 
        WHERE email = :email AND status = 'Active'
        LIMIT 1
    ");
    $stmt->execute([':email' => $email]);
    $row = $stmt->fetch();
    
    if ($row && password_verify($password, $row['password'])) {
        $user = $row;
        $user_source = 'admin';
    }
}

// -----------------------------------------------------------------
// 5. LOGIN FAILED — SEND BACK WITH ERROR
// -----------------------------------------------------------------
if ($user === null) {
    $_SESSION['login_errors'] = [
        'general' => 'Invalid email or password. Please try again.'
    ];
    $_SESSION['login_old'] = ['email' => $email];
    redirect('/login.html');
}

// -----------------------------------------------------------------
// 6. LOGIN SUCCESSFUL — BUILD SESSION DATA
// -----------------------------------------------------------------
// We store user info in $_SESSION['user'] so every page knows
// who is logged in and what they're allowed to do.
// 
// The nav_bar.js script can read which nav links to show
// based on the user's role (stored in session, accessible via AJAX).
// -----------------------------------------------------------------

switch ($user_source) {
    case 'customers':
        $_SESSION['user'] = [
            'user_id'       => (int) $user['customer_id'],
            'name'          => $user['name'],
            'email'         => $user['email'],
            'phone'         => $user['phone'],
            'role'          => 'customer',
            'customer_type' => $user['customer_type'],  // 'walkin' or 'online'
            'logged_in_at'  => date('Y-m-d H:i:s'),
        ];
        $redirect_url = '/history.html';
        break;

    case 'staff':
        $_SESSION['user'] = [
            'user_id'      => (int) $user['staff_id'],
            'name'         => $user['full_name'],
            'email'        => $user['email'],
            'phone'        => $user['phone'],
            'role'         => 'staff',
            'position'     => $user['position'],     // Waiter, Kitchen, Runner, etc.
            'shift'        => $user['shift'],         // Morning, Evening, Night
            'staff_code'   => $user['staff_code'],
            'logged_in_at' => date('Y-m-d H:i:s'),
        ];
        $redirect_url = '/staff-dashboard.html';
        break;

    case 'admin':
        $_SESSION['user'] = [
            'user_id'      => (int) $user['admin_id'],
            'name'         => $user['full_name'],
            'email'        => $user['email'],
            'role'         => 'admin',
            'admin_role'   => $user['role'],          // Super Admin, Manager, Support
            'username'     => $user['username'],
            'logged_in_at' => date('Y-m-d H:i:s'),
        ];
        $redirect_url = '/staff-dashboard.html';     // Admins also manage orders
        break;
}

// -----------------------------------------------------------------
// 7. UPDATE LAST LOGIN TIMESTAMP
// -----------------------------------------------------------------
// For admin table, record when they last logged in.
// (Customers don't have a last_login column)
// -----------------------------------------------------------------

if ($user_source === 'admin') {
    $stmt = $pdo->prepare("UPDATE admin SET last_login = NOW() WHERE admin_id = :id");
    $stmt->execute([':id' => $user['admin_id']]);
}

// -----------------------------------------------------------------
// 8. "REMEMBER ME" — SET A PERSISTENT COOKIE
// -----------------------------------------------------------------
// If the user checked "Remember Me", we set a long-lived cookie
// with a token so they stay logged in across browser restarts.
// 
// SIMPLIFIED VERSION: We just extend the session cookie lifetime.
// For a production app, you'd use a proper "remember_token" in the DB.
// -----------------------------------------------------------------

if ($rememberMe) {
    // Extend session cookie to 30 days
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        session_id(),
        time() + 60 * 60 * 24 * 30,  // 30 days
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

// -----------------------------------------------------------------
// 9. REDIRECT TO THE APPROPRIATE DASHBOARD
// -----------------------------------------------------------------
// Customer → history.html (their member dashboard)
// Staff/Admin → staff-dashboard.html (order management)
// -----------------------------------------------------------------

error_log("Login: {$user['email']} as {$user_source} — redirecting to {$redirect_url}");

set_flash('success', 'Welcome back, ' . $_SESSION['user']['name'] . '!');
redirect($redirect_url);
