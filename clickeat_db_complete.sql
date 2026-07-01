-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jul 01, 2026 at 08:57 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `clickeat_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('Super Admin','Manager','Support') DEFAULT 'Manager',
  `last_login` datetime DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `username`, `email`, `password`, `full_name`, `role`, `last_login`, `status`, `created_at`) VALUES
(1, 'admin', 'admin@clickeat.my', '$2y$10$dOfZml0nQMrEa3HeHXAqheiouV/WCQiCigv.5imSrzmKWtfGHOtrO', 'Super Admin', 'Super Admin', '2026-07-02 02:47:49', 'Active', '2026-07-01 15:44:46'),
(2, 'admincuki', 'admin@gmail.com', '$2y$10$3Kb28xLJJB6EEXRiq7ol2ubvdDv2PsZ5lLhP5gZmBjA/ck2KM3r6G', 'cuki', 'Super Admin', '2026-07-02 02:42:41', 'Active', '2026-07-01 16:20:11');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customer_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `customer_type` enum('walkin','online') DEFAULT 'online',
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customer_id`, `name`, `email`, `phone`, `password`, `address`, `customer_type`, `registration_date`, `status`) VALUES
(1, 'cukie', 'cuki@gmail.com', '01129953751', '$2y$10$WH.5nxoKmO.UZ14gvJ.zJe9exj1roVMN6jOefY.QlPkQ8.7Z4Qg.q', NULL, 'online', '2026-07-01 16:28:11', 'active'),
(2, 'Shukri Test', 'shukri.test@clickeat.my', '0123456789', '$2y$10$GuoFX/hF2z8BaIY1Ks/Oju2QVt0C/9uF6W05p2Wd7CqF.XeUPSwJu', '12, Jalan Teknologi 5, Taman Teknologi, 75450 Melaka', 'online', '2026-07-01 17:15:22', 'active'),
(3, 'maroq', 'maroq@gmail.com', '01129953751', '$2y$10$4RCCDwakYiy9xAhesKK/N.t4LGSlzeJlZV9AfGemgrPQ6sTAtMvMW', NULL, 'online', '2026-07-01 17:26:37', 'active'),
(4, 'Super Admin', 'admin@clickeat.my', '', '$2y$10$DYpNDt/FWPHOusthjH9CeutNVAndNiKDlseoswpSQ9WAwbQU0Aq4K', NULL, 'online', '2026-07-01 18:26:44', 'active'),
(5, 'cuki', 'admin@gmail.com', '', '$2y$10$y0lOQjFAKiuC/MuYWj1QeubxqFkvRcM5.1oyeDzLDB8Y8JceduT1q', NULL, 'online', '2026-07-01 18:26:44', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE `menu_items` (
  `item_id` int(11) NOT NULL,
  `item_name` varchar(100) NOT NULL,
  `category` enum('Main Course','Beverage','Dessert','Appetizer') DEFAULT 'Main Course',
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `availability` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`item_id`, `item_name`, `category`, `description`, `price`, `image_url`, `availability`, `created_at`) VALUES
(1, 'Nasi Lemak', 'Main Course', 'Fragrant coconut rice with spicy sambal, crispy anchovies, boiled egg, and fresh cucumber slices', 8.90, 'images/Main Course/Nasi-Lemak.png', 1, '2026-07-01 15:44:46'),
(2, 'Nasi Goreng Kampung', 'Main Course', 'Traditional village fried rice with anchovies, water spinach (kangkung), and a fried egg', 7.50, 'images/Main Course/NG-Kampung.png', 1, '2026-07-01 15:44:46'),
(3, 'Mee Goreng Mamak', 'Main Course', 'Spicy stir-fried yellow noodles with tofu, potato cubes, egg, and special mamak sauce', 6.90, 'images/Main Course/Mee-Goreng-Mamak.png', 1, '2026-07-01 15:44:46'),
(4, 'Hainanese Chicken Rice', 'Main Course', 'Poached chicken with fragrant rice, chilli sauce, ginger paste, and clear soup', 9.50, 'images/Main Course/Nasi-Ayam-Hainanese.png', 1, '2026-07-01 15:44:46'),
(5, 'Char Kuey Teow', 'Main Course', 'Flat rice noodles wok-fried with prawns, cockles, bean sprouts, egg, and soy sauce', 8.00, 'images/Main Course/Char-Kuey-Teow.png', 1, '2026-07-01 15:44:46'),
(6, 'Chicken Satay', 'Main Course', 'Grilled marinated chicken skewers served with spicy peanut sauce, cucumber, and ketupat', 10.00, 'images/Main Course/Chicken-Satay.png', 1, '2026-07-01 15:44:46'),
(7, 'Roti Canai', 'Main Course', 'Crispy flatbread served with dhal curry and sambal — a Malaysian breakfast classic', 3.50, 'images/Main Course/Roti-Canai.png', 1, '2026-07-01 15:44:46'),
(8, 'Curry Laksa', 'Main Course', 'Spicy coconut curry noodle soup with chicken, tofu puffs, bean sprouts, and egg', 9.00, 'images/Main Course/Curry-Laksa.png', 1, '2026-07-01 15:44:46'),
(9, 'Teh Tarik', 'Beverage', 'Malaysia\'s iconic pulled tea — creamy, frothy, and perfectly sweetened with condensed milk', 3.50, 'images/Beverages/Teh-Tarik.png', 1, '2026-07-01 15:44:46'),
(10, 'Milo Ais', 'Beverage', 'Iced chocolate malt drink topped with a generous amount of Milo powder — a local favourite', 4.00, 'images/Beverages/Milo-Ais.png', 1, '2026-07-01 15:44:46'),
(11, 'Sirap Bandung', 'Beverage', 'Rose syrup mixed with evaporated milk — sweet, creamy, and refreshingly pink', 3.50, 'images/Beverages/Sirap-Bandung.png', 1, '2026-07-01 15:44:46'),
(12, 'Fresh Lemonade', 'Beverage', 'Freshly squeezed lemonade with mint leaves — perfectly refreshing on a hot day', 4.50, 'images/Beverages/Fresh-Lemonade.png', 1, '2026-07-01 15:44:46'),
(13, 'Cendol', 'Dessert', 'Shaved ice with green rice flour jelly, coconut milk, and gula melaka palm sugar syrup', 5.00, 'images/Desserts/Cendol.png', 1, '2026-07-01 15:44:46'),
(14, 'Ais Kacang (ABC)', 'Dessert', 'Shaved ice mountain topped with red beans, sweet corn, grass jelly, attap chee, and rose syrup', 5.50, 'images/Desserts/Ais-Kacang-ABC.png', 1, '2026-07-01 15:44:46'),
(15, 'Pisang Goreng', 'Dessert', 'Crispy golden banana fritters — a classic Malaysian street-food dessert served warm', 4.00, 'images/Desserts/Pisang-Goreng.png', 1, '2026-07-01 15:44:46'),
(16, 'Bubur Chacha', 'Dessert', 'Warm coconut milk dessert with sweet potato, yam, tapioca jelly, and sago pearls', 4.50, 'images/Desserts/Bubur-Chacha.png', 1, '2026-07-01 15:44:46');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `order_number` varchar(20) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `order_type` enum('walkin','online') DEFAULT 'online',
  `table_number` int(11) DEFAULT NULL,
  `order_status` enum('Pending','In Progress','Ready','Completed','Cancelled') DEFAULT 'Pending',
  `payment_status` enum('Unpaid','Paid','Refunded') DEFAULT 'Unpaid',
  `payment_method` enum('Cash','Card','Receipt Upload') DEFAULT NULL,
  `payment_receipt` varchar(255) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `delivery_fee` decimal(10,2) DEFAULT 0.00,
  `tax` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL,
  `delivery_address` text DEFAULT NULL,
  `special_instructions` text DEFAULT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `estimated_complete_time` datetime DEFAULT NULL,
  `completed_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `order_number`, `customer_id`, `staff_id`, `order_type`, `table_number`, `order_status`, `payment_status`, `payment_method`, `payment_receipt`, `subtotal`, `delivery_fee`, `tax`, `total_amount`, `delivery_address`, `special_instructions`, `order_date`, `estimated_complete_time`, `completed_time`) VALUES
(1, 'CE-20260701-5B12', 2, NULL, 'online', NULL, 'In Progress', 'Unpaid', 'Cash', NULL, 21.30, 3.00, 1.28, 25.58, 'Name: Shukri Test\nAddress: 10 Jalan Merdeka, Bandar Melaka, 75000 Melaka\nPhone: 0123456789', NULL, '2026-07-01 17:16:44', NULL, NULL),
(2, 'CE-20260628-XYZ1', 2, NULL, 'walkin', 7, 'Completed', 'Paid', 'Cash', NULL, 12.50, 0.00, 0.75, 13.25, NULL, NULL, '2026-07-01 17:17:52', NULL, NULL),
(3, 'CE-20260701-885C', 4, NULL, 'online', NULL, 'Pending', 'Unpaid', 'Cash', NULL, 19.00, 3.00, 1.14, 23.14, 'Name: Super Admin\nAddress: sdeeee3e3e3e3e3e3ee33e3\nPhone: 01234561892', NULL, '2026-07-01 17:23:15', NULL, NULL),
(4, 'CE-20260701-D212', 3, NULL, 'online', NULL, 'Pending', 'Unpaid', 'Cash', NULL, 18.00, 3.00, 1.08, 22.08, 'Name: maroq\nAddress: xx\nPhone: 01129953751', 'xx', '2026-07-01 17:27:05', NULL, NULL),
(5, 'CE-20260701-150E', 3, NULL, 'online', NULL, 'Pending', 'Unpaid', 'Cash', NULL, 24.50, 3.00, 1.47, 28.97, 'Name: maroq\nAddress: jalan pak abbas\nPhone: 01129953751', NULL, '2026-07-01 18:04:39', NULL, NULL),
(6, 'CE-20260701-40C9', 5, NULL, 'walkin', 3, 'Pending', 'Unpaid', 'Card', NULL, 22.00, 0.00, 1.32, 23.32, NULL, NULL, '2026-07-01 18:06:20', NULL, NULL),
(7, 'CE-20260701-95B6', 5, NULL, 'walkin', 1, 'Pending', 'Unpaid', 'Cash', NULL, 23.00, 0.00, 1.38, 24.38, NULL, NULL, '2026-07-01 18:06:59', NULL, NULL),
(8, 'CE-20260701-6153', 3, NULL, 'online', NULL, 'Pending', 'Unpaid', 'Cash', NULL, 28.50, 3.00, 1.71, 33.21, 'Name: maroq\nAddress: cgfffgvgt\nPhone: 01129953751', NULL, '2026-07-01 18:28:06', NULL, NULL),
(9, 'CE-20260701-CA1B', 3, NULL, 'walkin', 2, 'Pending', 'Unpaid', 'Card', NULL, 13.90, 0.00, 0.83, 14.73, NULL, NULL, '2026-07-01 18:31:43', NULL, NULL),
(10, 'CE-20260701-DB1E', 4, NULL, 'walkin', 1, 'Pending', 'Unpaid', 'Card', NULL, 18.00, 0.00, 1.08, 19.08, NULL, NULL, '2026-07-01 18:32:39', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `order_assignments`
--

CREATE TABLE `order_assignments` (
  `assignment_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `runner_id` int(11) NOT NULL,
  `assigned_by` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `pickup_time` datetime DEFAULT NULL,
  `delivery_time` datetime DEFAULT NULL,
  `status` enum('Assigned','Picked Up','In Transit','Delivered','Failed') DEFAULT 'Assigned',
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `special_request` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`order_item_id`, `order_id`, `item_id`, `quantity`, `unit_price`, `subtotal`, `special_request`) VALUES
(1, 1, 1, 2, 8.90, 17.80, NULL),
(2, 1, 9, 1, 3.50, 3.50, NULL),
(3, 2, 6, 1, 10.00, 10.00, NULL),
(4, 2, 9, 1, 3.50, 3.50, NULL),
(5, 3, 6, 1, 10.00, 10.00, NULL),
(6, 3, 8, 1, 9.00, 9.00, NULL),
(7, 4, 6, 1, 10.00, 10.00, NULL),
(8, 4, 5, 1, 8.00, 8.00, NULL),
(9, 5, 5, 1, 8.00, 8.00, NULL),
(10, 5, 8, 1, 9.00, 9.00, NULL),
(11, 5, 11, 1, 3.50, 3.50, NULL),
(12, 5, 15, 1, 4.00, 4.00, NULL),
(13, 6, 6, 1, 10.00, 10.00, NULL),
(14, 6, 5, 1, 8.00, 8.00, NULL),
(15, 6, 10, 1, 4.00, 4.00, NULL),
(16, 7, 6, 1, 10.00, 10.00, NULL),
(17, 7, 5, 1, 8.00, 8.00, NULL),
(18, 7, 13, 1, 5.00, 5.00, NULL),
(19, 8, 6, 1, 10.00, 10.00, NULL),
(20, 8, 8, 1, 9.00, 9.00, NULL),
(21, 8, 16, 1, 4.50, 4.50, NULL),
(22, 8, 13, 1, 5.00, 5.00, NULL),
(23, 9, 3, 1, 6.90, 6.90, NULL),
(24, 9, 7, 1, 3.50, 3.50, NULL),
(25, 9, 9, 1, 3.50, 3.50, NULL),
(26, 10, 6, 1, 10.00, 10.00, NULL),
(27, 10, 5, 1, 8.00, 8.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `staff_id` int(11) NOT NULL,
  `staff_code` varchar(20) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `position` enum('Waiter','Kitchen','Runner','Manager','Cashier') DEFAULT 'Waiter',
  `shift` enum('Morning','Evening','Night') DEFAULT 'Morning',
  `hire_date` date NOT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `status` enum('Active','Inactive','On Leave') DEFAULT 'Active',
  `profile_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`item_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `order_assignments`
--
ALTER TABLE `order_assignments`
  ADD PRIMARY KEY (`assignment_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `runner_id` (`runner_id`),
  ADD KEY `assigned_by` (`assigned_by`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`staff_id`),
  ADD UNIQUE KEY `staff_code` (`staff_code`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `order_assignments`
--
ALTER TABLE `order_assignments`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `staff_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`);

--
-- Constraints for table `order_assignments`
--
ALTER TABLE `order_assignments`
  ADD CONSTRAINT `order_assignments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  ADD CONSTRAINT `order_assignments_ibfk_2` FOREIGN KEY (`runner_id`) REFERENCES `staff` (`staff_id`),
  ADD CONSTRAINT `order_assignments_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `admin` (`admin_id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `menu_items` (`item_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
