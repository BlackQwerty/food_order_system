<?php
/**
 * Run this ONCE to create the default admin account.
 * Visit: https://food-order-system.local/php_backend/seed_admin.php
 * DELETE this file after use.
 */

require_once __DIR__ . '/config/config.php';

// Check if admin already exists
$stmt = $pdo->prepare("SELECT admin_id FROM admin WHERE email = :email");
$stmt->execute([':email' => 'admin@clickeat.my']);
if ($stmt->fetch()) {
    echo '<p style="font-family:monospace">Admin account already exists. <a href="/admin.html">Go to Admin Panel</a></p>';
    exit;
}

$password = password_hash('Admin@123', PASSWORD_DEFAULT);

$stmt = $pdo->prepare("
    INSERT INTO admin (username, email, password, full_name, role, status)
    VALUES ('admin', 'admin@clickeat.my', :password, 'Super Admin', 'Super Admin', 'Active')
");
$stmt->execute([':password' => $password]);

echo '<div style="font-family:monospace;padding:24px;background:#f5f5f7">
<h2>✅ Admin account created!</h2>
<p><strong>Email:</strong> admin@clickeat.my</p>
<p><strong>Password:</strong> Admin@123</p>
<p style="color:#d32f2f;margin-top:16px">⚠️ Delete this file after logging in!</p>
<p><a href="/login.html">Go to Login</a></p>
</div>';
