<?php
require_once __DIR__ . '/config/config.php';

if (!is_logged_in() || current_user_role() !== 'admin') {
    json_response(['success' => false, 'message' => 'Admin access required.'], 403);
}

$action = $_POST['action'] ?? '';

// ── CREATE ────────────────────────────────────────────────────────
if ($action === 'create') {
    $name     = trim($_POST['full_name']  ?? '');
    $email    = trim($_POST['email']      ?? '');
    $password = $_POST['password']        ?? '';
    $phone    = trim($_POST['phone']      ?? '');
    $position = trim($_POST['position']   ?? '');
    $shift    = trim($_POST['shift']      ?? 'Morning');

    $errors = [];
    if (!$name)                                     $errors[] = 'Full name is required.';
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Valid email is required.';
    if (strlen($password) < 6)                      $errors[] = 'Password must be at least 6 characters.';
    if (!$position)                                 $errors[] = 'Position is required.';

    if ($errors) {
        json_response(['success' => false, 'message' => implode(' ', $errors)]);
    }

    // Check duplicate email
    $chk = $pdo->prepare("SELECT staff_id FROM staff WHERE email = :email LIMIT 1");
    $chk->execute([':email' => $email]);
    if ($chk->fetch()) {
        json_response(['success' => false, 'message' => 'That email is already registered.']);
    }

    // Generate staff code: STF + zero-padded next ID
    $maxRow = $pdo->query("SELECT MAX(staff_id) as m FROM staff")->fetch();
    $nextId = ($maxRow['m'] ?? 0) + 1;
    $staffCode = 'STF' . str_pad($nextId, 3, '0', STR_PAD_LEFT);

    $stmt = $pdo->prepare("
        INSERT INTO staff (staff_code, full_name, email, phone, password, position, shift, hire_date, status)
        VALUES (:code, :name, :email, :phone, :pass, :position, :shift, CURDATE(), 'Active')
    ");
    $stmt->execute([
        ':code'     => $staffCode,
        ':name'     => $name,
        ':email'    => $email,
        ':phone'    => $phone,
        ':pass'     => password_hash($password, PASSWORD_BCRYPT),
        ':position' => $position,
        ':shift'    => $shift,
    ]);

    json_response(['success' => true, 'message' => "Staff account created ({$staffCode})."]);
}

// ── TOGGLE STATUS ─────────────────────────────────────────────────
if ($action === 'toggle_status') {
    $staffId = (int) ($_POST['staff_id'] ?? 0);
    if (!$staffId) json_response(['success' => false, 'message' => 'Invalid staff ID.']);

    $row = $pdo->prepare("SELECT status FROM staff WHERE staff_id = :id");
    $row->execute([':id' => $staffId]);
    $current = $row->fetchColumn();
    if ($current === false) json_response(['success' => false, 'message' => 'Staff not found.']);

    $newStatus = $current === 'Active' ? 'Inactive' : 'Active';
    $upd = $pdo->prepare("UPDATE staff SET status = :s WHERE staff_id = :id");
    $upd->execute([':s' => $newStatus, ':id' => $staffId]);

    json_response(['success' => true, 'new_status' => $newStatus]);
}

// ── DELETE ────────────────────────────────────────────────────────
if ($action === 'delete') {
    $staffId = (int) ($_POST['staff_id'] ?? 0);
    if (!$staffId) json_response(['success' => false, 'message' => 'Invalid staff ID.']);

    $del = $pdo->prepare("DELETE FROM staff WHERE staff_id = :id");
    $del->execute([':id' => $staffId]);

    json_response(['success' => true, 'message' => 'Staff account removed.']);
}

json_response(['success' => false, 'message' => 'Unknown action.']);
