<?php
require_once __DIR__ . '/../config/config.php';

if (!is_logged_in() || current_user_role() !== 'admin') {
    json_response(['success' => false, 'message' => 'Admin access required.'], 403);
}

$rows = $pdo->query("
    SELECT staff_id, staff_code, full_name, email, phone, position, shift, hire_date, status
    FROM staff
    ORDER BY hire_date DESC, staff_id DESC
")->fetchAll(PDO::FETCH_ASSOC);

json_response(['success' => true, 'staff' => $rows]);
