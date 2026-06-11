<?php
/**
 * ============================================================
 * MENU SEEDER — seed_menu.php
 * ============================================================
 * 
 * ONE-TIME SCRIPT: Run this once to insert all menu items
 * from the static HTML into the menu_items database table.
 * 
 * HOW TO RUN:
 *   php php_backend/seed_menu.php
 *   OR visit: http://localhost:8080/php_backend/seed_menu.php
 * 
 * This reads the menu from the CONTEXT.md and existing menu.html
 * and inserts them into the database.
 * 
 * SAFETY: This script checks if items already exist before inserting.
 * Running it twice is safe — it won't create duplicates.
 */

require_once __DIR__ . '/config/config.php';

// Set longer execution time for this script
set_time_limit(30);

echo "<h1>ClickEat — Menu Seeder</h1>";
echo "<pre>";

// -----------------------------------------------------------------
// 1. DEFINE ALL MENU ITEMS
// -----------------------------------------------------------------
// Based on menu.html static content (the real restaurant menu)

$menuItems = [
    // ---- MAIN COURSE ----
    [
        'item_name'   => 'Nasi Lemak',
        'category'    => 'Main Course',
        'description' => 'Fragrant coconut rice with spicy sambal, crispy anchovies, boiled egg, and fresh cucumber slices',
        'price'       => 8.90,
        'image_url'   => 'images/Main Course/Nasi-Lemak.png',
    ],
    [
        'item_name'   => 'Nasi Goreng Kampung',
        'category'    => 'Main Course',
        'description' => 'Traditional village fried rice with anchovies, water spinach (kangkung), and a fried egg',
        'price'       => 7.50,
        'image_url'   => 'images/Main Course/NG-Kampung.png',
    ],
    [
        'item_name'   => 'Mee Goreng Mamak',
        'category'    => 'Main Course',
        'description' => 'Spicy stir-fried yellow noodles with tofu, potato cubes, egg, and special mamak sauce',
        'price'       => 6.90,
        'image_url'   => 'images/Main Course/Mee-Goreng-Mamak.png',
    ],
    [
        'item_name'   => 'Hainanese Chicken Rice',
        'category'    => 'Main Course',
        'description' => 'Poached chicken with fragrant rice, chilli sauce, ginger paste, and clear soup',
        'price'       => 9.50,
        'image_url'   => 'images/Main Course/Nasi-Ayam-Hainanese.png',
    ],
    [
        'item_name'   => 'Char Kuey Teow',
        'category'    => 'Main Course',
        'description' => 'Flat rice noodles wok-fried with prawns, cockles, bean sprouts, egg, and soy sauce',
        'price'       => 8.00,
        'image_url'   => 'images/Main Course/Char-Kuey-Teow.png',
    ],
    [
        'item_name'   => 'Chicken Satay',
        'category'    => 'Main Course',
        'description' => 'Grilled marinated chicken skewers served with spicy peanut sauce, cucumber, and ketupat',
        'price'       => 10.00,
        'image_url'   => 'images/Main Course/Chicken-Satay.png',
    ],
    [
        'item_name'   => 'Roti Canai',
        'category'    => 'Main Course',
        'description' => 'Crispy flatbread served with dhal curry and sambal — a Malaysian breakfast classic',
        'price'       => 3.50,
        'image_url'   => 'images/Main Course/Roti-Canai.png',
    ],
    [
        'item_name'   => 'Curry Laksa',
        'category'    => 'Main Course',
        'description' => 'Spicy coconut curry noodle soup with chicken, tofu puffs, bean sprouts, and egg',
        'price'       => 9.00,
        'image_url'   => 'images/Main Course/Curry-Laksa.png',
    ],

    // ---- BEVERAGES ----
    [
        'item_name'   => 'Teh Tarik',
        'category'    => 'Beverage',
        'description' => 'Malaysia\'s iconic pulled tea — creamy, frothy, and perfectly sweetened with condensed milk',
        'price'       => 3.50,
        'image_url'   => 'images/Beverages/Teh-Tarik.png',
    ],
    [
        'item_name'   => 'Milo Ais',
        'category'    => 'Beverage',
        'description' => 'Iced chocolate malt drink topped with a generous amount of Milo powder — a local favourite',
        'price'       => 4.00,
        'image_url'   => 'images/Beverages/Milo-Ais.png',
    ],
    [
        'item_name'   => 'Sirap Bandung',
        'category'    => 'Beverage',
        'description' => 'Rose syrup mixed with evaporated milk — sweet, creamy, and refreshingly pink',
        'price'       => 3.50,
        'image_url'   => 'images/Beverages/Sirap-Bandung.png',
    ],
    [
        'item_name'   => 'Fresh Lemonade',
        'category'    => 'Beverage',
        'description' => 'Freshly squeezed lemonade with mint leaves — perfectly refreshing on a hot day',
        'price'       => 4.50,
        'image_url'   => 'images/Beverages/Fresh-Lemonade.png',
    ],

    // ---- DESSERTS ----
    [
        'item_name'   => 'Cendol',
        'category'    => 'Dessert',
        'description' => 'Shaved ice with green rice flour jelly, coconut milk, and gula melaka palm sugar syrup',
        'price'       => 5.00,
        'image_url'   => 'images/Desserts/Cendol.png',
    ],
    [
        'item_name'   => 'Ais Kacang (ABC)',
        'category'    => 'Dessert',
        'description' => 'Shaved ice mountain topped with red beans, sweet corn, grass jelly, attap chee, and rose syrup',
        'price'       => 5.50,
        'image_url'   => 'images/Desserts/Ais-Kacang-ABC.png',
    ],
    [
        'item_name'   => 'Pisang Goreng',
        'category'    => 'Dessert',
        'description' => 'Crispy golden banana fritters — a classic Malaysian street-food dessert served warm',
        'price'       => 4.00,
        'image_url'   => 'images/Desserts/Pisang-Goreng.png',
    ],
    [
        'item_name'   => 'Bubur Chacha',
        'category'    => 'Dessert',
        'description' => 'Warm coconut milk dessert with sweet potato, yam, tapioca jelly, and sago pearls',
        'price'       => 4.50,
        'image_url'   => 'images/Desserts/Bubur-Chacha.png',
    ],
];

// -----------------------------------------------------------------
// 2. INSERT INTO DATABASE
// -----------------------------------------------------------------

$inserted = 0;
$skipped  = 0;

$stmtCheck = $pdo->prepare("SELECT item_id FROM menu_items WHERE item_name = :name LIMIT 1");
$stmtInsert = $pdo->prepare("
    INSERT INTO menu_items (item_name, category, description, price, image_url, availability)
    VALUES (:name, :category, :description, :price, :image_url, TRUE)
");

foreach ($menuItems as $item) {
    // Check if already exists
    $stmtCheck->execute([':name' => $item['item_name']]);
    
    if ($stmtCheck->fetch()) {
        echo "⏭  SKIPPED (already exists): {$item['item_name']}\n";
        $skipped++;
    } else {
        // Insert new item
        $stmtInsert->execute([
            ':name'        => $item['item_name'],
            ':category'    => $item['category'],
            ':description' => $item['description'],
            ':price'       => $item['price'],
            ':image_url'   => $item['image_url'],
        ]);
        echo "✅ INSERTED: {$item['item_name']} — RM " . number_format($item['price'], 2) . "\n";
        $inserted++;
    }
}

echo "\n========================================\n";
echo "SUMMARY: {$inserted} inserted, {$skipped} skipped (already in DB)\n";
echo "TOTAL MENU ITEMS IN DB: " . count($menuItems) . "\n";
echo "========================================\n";
echo "</pre>";
echo "<p><a href='../menu.html'>← Go to Menu Page</a></p>";
