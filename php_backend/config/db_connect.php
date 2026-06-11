<?php
/**
 * ============================================================
 * DATABASE CONNECTION — db_connect.php
 * ============================================================
 * 
 * This file creates and returns a PDO connection to MySQL.
 * Every other PHP file in this project includes this file
 * to talk to the database.
 * 
 * WHY PDO (not mysqli)?
 *  - Prepared statements prevent SQL injection
 *  - Named parameters (:name) are cleaner than ?
 *  - Same PDO code works with other databases (PostgreSQL, SQLite...)
 *  - Better exception handling
 * 
 * HOW OTHER FILES USE THIS:
 *   require_once __DIR__ . '/config/db_connect.php';
 *   // Now $pdo is available — use it for all queries
 */

// -----------------------------------------------------------------
// 0. LOAD .ENV FILE (loads DB_PASS etc. from project root)
// -----------------------------------------------------------------
// Walks up from this file to find the .env at the project root.
// Parses KEY=VALUE lines and makes them available via getenv().
// -----------------------------------------------------------------

(function () {
    // Start from this file's directory, walk up to find .env
    $dir = __DIR__;                        // php_backend/config/
    $envFile = null;

    // Search up to 3 levels (config → php_backend → project root)
    for ($i = 0; $i < 3; $i++) {
        $candidate = $dir . '/.env';
        if (file_exists($candidate)) {
            $envFile = $candidate;
            break;
        }
        $dir = dirname($dir);  // Go up one level
    }

    if ($envFile === null) {
        return;  // No .env found — will use fallback values
    }

    // Read and parse .env line by line
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);

        // Skip comments (lines starting with #)
        if ($line === '' || $line[0] === '#') {
            continue;
        }

        // Split on first = sign
        $eqPos = strpos($line, '=');
        if ($eqPos === false) {
            continue;  // No = sign, skip
        }

        $key   = trim(substr($line, 0, $eqPos));
        $value = trim(substr($line, $eqPos + 1));

        // Remove surrounding quotes if present ("value" or 'value')
        if (
            (strlen($value) >= 2) &&
            (
                ($value[0] === '"' && $value[strlen($value) - 1] === '"') ||
                ($value[0] === "'" && $value[strlen($value) - 1] === "'")
            )
        ) {
            $value = substr($value, 1, -1);
        }

        // Make available via getenv()
        putenv("{$key}={$value}");
        $_ENV[$key] = $value;
    }
})();

// -----------------------------------------------------------------
// 1. DATABASE CREDENTIALS
// -----------------------------------------------------------------
// Password comes from .env file (DB_PASS=...).
// Everything else can be overridden by .env too if you add them.
// -----------------------------------------------------------------

$db_host    = getenv('DB_HOST')    ?: 'localhost';
$db_port    = getenv('DB_PORT')    ?: '3306';
$db_name    = getenv('DB_NAME')    ?: 'clickeat_db';
$db_user    = getenv('DB_USER')    ?: 'root';
$db_pass    = getenv('DB_PASS')    ?: '';   // ← From your .env file
$db_socket  = getenv('DB_SOCKET')  ?: '/Applications/ServBay/tmp/mysql-8.4.sock';
$db_charset = getenv('DB_CHARSET') ?: 'utf8mb4';

// -----------------------------------------------------------------
// 2. BUILD THE DSN (Data Source Name)
// -----------------------------------------------------------------
// DSN tells PDO WHERE to connect and HOW.
// We use unix_socket for ServBay (faster than TCP for local connections).
// -----------------------------------------------------------------

$dsn = "mysql:unix_socket={$db_socket};dbname={$db_name};charset={$db_charset}";

// -----------------------------------------------------------------
// 3. CONNECTION OPTIONS
// -----------------------------------------------------------------
// These tell PDO HOW to behave when connected.
// -----------------------------------------------------------------

$options = [
    // Throw exceptions on errors (so we can catch and handle them)
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    
    // Return rows as associative arrays (column_name => value)
    // Example: $row['customer_id'] instead of $row[0]
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    
    // Disable emulated prepares (use REAL MySQL prepared statements)
    // This is more secure — MySQL, not PHP, handles the prepared statement
    PDO::ATTR_EMULATE_PREPARES   => false,
    
    // Use buffered queries (results are read into memory at once)
    // Allows rowCount() to work and lets you run another query while
    // iterating results
    PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true,
];

// -----------------------------------------------------------------
// 4. CREATE THE CONNECTION
// -----------------------------------------------------------------
// Wrap in try-catch so we can handle connection errors gracefully.
// -----------------------------------------------------------------

try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
    
    // Set timezone to Malaysia (UTC+8) so all TIMESTAMPs match local time
    $pdo->exec("SET time_zone = '+08:00'");
    
} catch (PDOException $e) {
    // In production, log the error instead of showing it to users.
    // For development, we show it to help debugging.
    // error_log($e->getMessage());  // <-- Production logging
    
    // Send a JSON error response (most AJAX calls expect JSON)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed. Please try again later.',
        // Only show details in development:
        // 'debug'   => $e->getMessage()
    ]);
    exit;  // Stop execution — no database = no point continuing
}

// -----------------------------------------------------------------
// 5. HOW TO USE $pdo IN OTHER FILES
// -----------------------------------------------------------------
// The variable $pdo is now available to any file that includes this.
// 
// EXAMPLES:
// 
// --- SELECT (fetch ONE row) ---
// $stmt = $pdo->prepare("SELECT * FROM customers WHERE email = :email");
// $stmt->execute([':email' => $email]);
// $customer = $stmt->fetch();  // Returns assoc array or false if not found
//
// --- SELECT (fetch ALL rows) ---
// $stmt = $pdo->prepare("SELECT * FROM menu_items WHERE category = :cat");
// $stmt->execute([':cat' => $category]);
// $items = $stmt->fetchAll();  // Returns array of assoc arrays
//
// --- INSERT ---
// $stmt = $pdo->prepare("INSERT INTO customers (name, email) VALUES (:name, :email)");
// $stmt->execute([':name' => $name, ':email' => $email]);
// $new_id = $pdo->lastInsertId();  // Get the AUTO_INCREMENT id
//
// --- UPDATE ---
// $stmt = $pdo->prepare("UPDATE orders SET order_status = :status WHERE order_id = :id");
// $stmt->execute([':status' => $status, ':id' => $id]);
// $affected = $stmt->rowCount();  // How many rows were updated
//
// --- DELETE ---
// $stmt = $pdo->prepare("DELETE FROM order_items WHERE order_id = :id");
// $stmt->execute([':id' => $id]);
// -----------------------------------------------------------------
