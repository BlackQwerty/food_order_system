
CREATE DATABASE IF NOT EXISTS clickeat_db;
USE clickeat_db;


CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    address TEXT,
    customer_type ENUM('walkin', 'online') DEFAULT 'online',
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active'
);


CREATE TABLE menu_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(100) NOT NULL,
    category ENUM('Main Course', 'Beverage', 'Dessert', 'Appetizer') DEFAULT 'Main Course',
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    availability BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff (
    staff_id INT PRIMARY KEY AUTO_INCREMENT,
    staff_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    position ENUM('Waiter', 'Kitchen', 'Runner', 'Manager', 'Cashier') DEFAULT 'Waiter',
    shift ENUM('Morning', 'Evening', 'Night') DEFAULT 'Morning',
    hire_date DATE NOT NULL,
    salary DECIMAL(10,2),
    status ENUM('Active', 'Inactive', 'On Leave') DEFAULT 'Active',
    profile_image VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT,
    staff_id INT,  -- Which staff took/processed the order
    order_type ENUM('walkin', 'online') DEFAULT 'online',
    table_number INT NULL,  -- For walk-in customers
    order_status ENUM('Pending', 'In Progress', 'Ready', 'Completed', 'Cancelled') DEFAULT 'Pending',
    payment_status ENUM('Unpaid', 'Paid', 'Refunded') DEFAULT 'Unpaid',
    payment_method ENUM('Cash', 'Card', 'Receipt Upload') NULL,
    payment_receipt VARCHAR(255) NULL,  -- Path to uploaded receipt
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    tax DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_address TEXT NULL,
    special_instructions TEXT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estimated_complete_time DATETIME NULL,
    completed_time DATETIME NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);


CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    special_request VARCHAR(255) NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
);


CREATE TABLE admin (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('Super Admin', 'Manager', 'Support') DEFAULT 'Manager',
    last_login DATETIME NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE order_assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    runner_id INT NOT NULL,  -- staff_id with position 'Runner'
    assigned_by INT NOT NULL,  -- admin_id or staff_id
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pickup_time DATETIME NULL,
    delivery_time DATETIME NULL,
    status ENUM('Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Failed') DEFAULT 'Assigned',
    notes TEXT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (runner_id) REFERENCES staff(staff_id),
    FOREIGN KEY (assigned_by) REFERENCES admin(admin_id)
);

