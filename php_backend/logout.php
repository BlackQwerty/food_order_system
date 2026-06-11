<?php
/**
 * ============================================================
 * LOGOUT — logout.php
 * ============================================================
 * 
 * This file DESTROYS the user's session and sends them
 * back to the home page. It's linked from the nav bar
 * "Logout" button on every page.
 * 
 * FLOW:
 *   User clicks "Logout" (nav link → logout.php)
 *     → Session completely destroyed
 *     → Session cookie deleted
 *     → Redirected to index.html
 * 
 * WHY DESTROY EVERYTHING?
 *   Simply unsetting $_SESSION['user'] is not enough.
 *   We must destroy the entire session to prevent
 *   session fixation attacks and ensure a clean slate.
 */

// -----------------------------------------------------------------
// 1. START SESSION (needed to destroy it)
// -----------------------------------------------------------------
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// -----------------------------------------------------------------
// 2. CLEAR ALL SESSION DATA
// -----------------------------------------------------------------

// Unset every session variable
$_SESSION = [];

// -----------------------------------------------------------------
// 3. DELETE THE SESSION COOKIE
// -----------------------------------------------------------------
// The session data on the server is gone, but the browser
// still has a cookie pointing to the old session ID.
// We tell the browser to delete that cookie.

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),     // e.g., "PHPSESSID"
        '',                 // Empty value
        time() - 42000,     // Expire in the past (forces deletion)
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

// -----------------------------------------------------------------
// 4. DESTROY THE SERVER-SIDE SESSION FILE
// -----------------------------------------------------------------
session_destroy();

// -----------------------------------------------------------------
// 5. REDIRECT TO HOME
// -----------------------------------------------------------------
// Use a basic header redirect (we don't need config.php for this)
header('Location: ../index.html');
exit;
