<?php
/**
 * ============================================================
 * REGISTRATION PROCESSOR — register-process.php
 * ============================================================
 * 
 * THIS IS THE "CREATE ACCOUNT" PAGE.
 * 
 * FLOW (what happens when user clicks REGISTER):
 * 
 *   register.html (form filled) 
 *     → [JS validates in browser — fast feedback] 
 *     → form submits to THIS FILE (register-process.php)
 *     → [PHP validates again — NEVER trust the browser]
 *     → Check if email already exists in database
 *     → Hash password (never store raw passwords!)
 *     → INSERT new customer row
 *     → Set success flash message
 *     → Redirect to login.html
 * 
 * KEY LESSONS IN THIS FILE:
 *   1. "Defense in depth" — validate on BOTH client AND server
 *   2. password_hash() — never store plain-text passwords
 *   3. Always check for duplicate emails
 *   4. Redirect after POST (PRG pattern — Post/Redirect/Get)
 */

// -----------------------------------------------------------------
// 1. LOAD CONFIGURATION (session, database, helpers)
// -----------------------------------------------------------------
require_once __DIR__ . '/config/config.php';

// -----------------------------------------------------------------
// 2. ENSURE THIS IS A POST REQUEST
// -----------------------------------------------------------------
// Someone typing register-process.php in the browser bar
// sends a GET request — we ignore those.
// Only POST (form submission) is processed.
// -----------------------------------------------------------------

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    // Not a form submission — redirect to the register page
    redirect('/register.html');
}

// -----------------------------------------------------------------
// 3. COLLECT AND TRIM FORM DATA
// -----------------------------------------------------------------
// $_POST contains all form fields sent with method="POST".
// We use the helper function post() to safely get trimmed values.
// 
// HTML form field names (from register.html):
//   fullName, email, phone, password, confirmPassword, customerType, agreeTerms
// -----------------------------------------------------------------

$name           = post('fullName');          // Customer's full name
$email          = post('email');             // Email (must be unique)
$phone          = post('phone');             // Phone number
$password       = post('password');          // Raw password (will be hashed)
$confirmPassword = post('confirmPassword');  // Must match $password
$customerType   = post('customerType');      // 'walkin' or 'online'
$agreeTerms     = isset($_POST['agreeTerms']);  // Checkbox — exists only if checked

// Initialize an array to collect error messages
$errors = [];

// -----------------------------------------------------------------
// 4. SERVER-SIDE VALIDATION
// -----------------------------------------------------------------
// WHY? JavaScript validation can be bypassed (disable JS, curl, Postman).
// PHP validation is the REAL security gate.
// We validate EVERYTHING again on the server.
// -----------------------------------------------------------------

// --- Full Name ---
if (empty($name)) {
    $errors['fullName'] = 'Please enter your full name.';
} elseif (strlen($name) < 2) {
    $errors['fullName'] = 'Name must be at least 2 characters.';
} elseif (strlen($name) > 100) {
    $errors['fullName'] = 'Name must not exceed 100 characters.';
}

// --- Email ---
if (empty($email)) {
    $errors['email'] = 'Please enter your email address.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    // filter_var with FILTER_VALIDATE_EMAIL is PHP's built-in email checker
    // It checks for proper format: something@something.something
    $errors['email'] = 'Please enter a valid email address.';
}

// --- Phone Number ---
if (empty($phone)) {
    $errors['phone'] = 'Please enter your phone number.';
} elseif (!is_valid_malaysian_phone($phone)) {
    // Uses our helper function from config.php
    $errors['phone'] = 'Please enter a valid Malaysian phone number (01X-XXXXXXX).';
}

// --- Password ---
if (empty($password)) {
    $errors['password'] = 'Please enter a password.';
} elseif (strlen($password) < 6) {
    $errors['password'] = 'Password must be at least 6 characters.';
} elseif (strlen($password) > 72) {
    // Bcrypt has a 72-byte limit on the input password
    $errors['password'] = 'Password must not exceed 72 characters.';
}

// --- Confirm Password ---
if ($password !== $confirmPassword) {
    $errors['confirmPassword'] = 'Passwords do not match.';
}

// --- Customer Type ---
if (!in_array($customerType, ['walkin', 'online'])) {
    $errors['customerType'] = 'Please select a valid customer type.';
}

// --- Terms Checkbox ---
if (!$agreeTerms) {
    $errors['terms'] = 'You must agree to the Terms & Conditions.';
}

// -----------------------------------------------------------------
// 5. IF THERE ARE ERRORS, SEND USER BACK TO THE FORM
// -----------------------------------------------------------------
// We store errors in the session so the register page can display them.
// This is called "flash input" — data that survives one redirect.
// -----------------------------------------------------------------

if (!empty($errors)) {
    $_SESSION['register_errors'] = $errors;
    $_SESSION['register_old']   = $_POST;  // Save what user typed (so they don't lose it)
    redirect('/register.html');
}

// -----------------------------------------------------------------
// 6. CHECK FOR DUPLICATE EMAIL
// -----------------------------------------------------------------
// Emails must be unique (UNIQUE constraint in the DB table).
// We check BEFORE inserting so we can give a friendly error message.
// -----------------------------------------------------------------

$stmt = $pdo->prepare("SELECT customer_id FROM customers WHERE email = :email LIMIT 1");
$stmt->execute([':email' => $email]);

if ($stmt->fetch()) {
    // Email already exists!
    $_SESSION['register_errors'] = ['email' => 'This email is already registered. Please login instead.'];
    $_SESSION['register_old']   = $_POST;
    redirect('/register.html');
}

// -----------------------------------------------------------------
// 7. HASH THE PASSWORD
// -----------------------------------------------------------------
// NEVER store raw passwords in the database. If your database is
// ever leaked, attackers would see everyone's passwords.
//
// password_hash() uses bcrypt (one-way encryption):
//   - Same password always produces DIFFERENT hash (random salt)
//   - Impossible to reverse (you can't get the password from the hash)
//   - password_verify() checks if a password matches a hash
//
// PASSWORD_BCRYPT:
//   - Cost factor 10 (takes about 0.1s on modern hardware)
//   - Output is always 60 characters
//   - Includes the salt in the output (no separate salt column needed)
// -----------------------------------------------------------------

$hashed_password = password_hash($password, PASSWORD_BCRYPT);

// -----------------------------------------------------------------
// 8. INSERT THE NEW CUSTOMER
// -----------------------------------------------------------------
// Prepared statements prevent SQL injection.
// The :name syntax tells PDO: "this is a VALUE, not part of the SQL".
// Even if someone types "DROP TABLE customers" in the name field,
// it's treated as literal text — not executed as SQL.
// -----------------------------------------------------------------

$stmt = $pdo->prepare("
    INSERT INTO customers (name, email, phone, password, customer_type)
    VALUES (:name, :email, :phone, :password, :customer_type)
");

$stmt->execute([
    ':name'          => $name,
    ':email'         => $email,
    ':phone'         => $phone,
    ':password'      => $hashed_password,   // THE HASH, NOT the raw password!
    ':customer_type' => $customerType,
]);

// Get the auto-generated customer_id
$new_customer_id = $pdo->lastInsertId();

// -----------------------------------------------------------------
// 9. SET SUCCESS FLASH MESSAGE AND REDIRECT
// -----------------------------------------------------------------
// Flash messages survive one redirect — the login page will display
// "Registration successful! Please log in."
// -----------------------------------------------------------------

set_flash('success', 'Registration successful! Your account has been created. Please log in.');

// Log the registration (optional, but good practice for debugging)
error_log("New customer registered: ID={$new_customer_id}, Email={$email}");

// Redirect to login page
redirect('/login.html');
