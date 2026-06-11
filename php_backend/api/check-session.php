<?php
/**
 * ============================================================
 * CHECK SESSION — api/check-session.php
 * ============================================================
 * 
 * Called by nav_bar.js to check if the user is logged in.
 * The navbar shows different links based on login state.
 * 
 * USAGE (from JS):
 *   fetch('php_backend/api/check-session.php')
 *     .then(res => res.json())
 *     .then(data => {
 *       if (data.logged_in) {
 *         // Show: Menu | Order | Track | My Account | Logout
 *       } else {
 *         // Show: Menu | Order | Track | Dashboard | Login
 *       }
 *     });
 * 
 * RESPONSE:
 *   {
 *     "logged_in": true,
 *     "user": {
 *       "name": "Ahmad",
 *       "role": "customer",
 *       ...
 *     }
 *   }
 */

require_once __DIR__ . '/../config/config.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['success' => false, 'message' => 'Use GET request.'], 405);
}

if (is_logged_in()) {
    json_response([
        'success'  => true,
        'logged_in' => true,
        'user'     => [
            'name'  => $_SESSION['user']['name'],
            'role'  => $_SESSION['user']['role'],
            'email' => $_SESSION['user']['email'],
        ]
    ]);
} else {
    json_response([
        'success'  => true,
        'logged_in' => false,
        'user'     => null
    ]);
}
