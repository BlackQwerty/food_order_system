# CONTEXT.md — Project Context for AI Agents

This file gives AI agents the full context of this web application project so they can generate relevant, accurate, and consistent code, content, and decisions.

---

## Project Overview

| Field             | Detail                                                               |
|-------------------|----------------------------------------------------------------------|
| **Project Title** | Restaurant Order Management System for Walk-In and Online Customers |
| **Brand Name**    | ClickEat                                                       |
| **Course**        | Internet Technologies (UTeM — FTMK)                                 |
| **Institution**   | Universiti Teknikal Malaysia Melaka (UTeM)                          |
| **Group Size**    | 4 students                                                           |
| **Deliverables**  | Assignment 2 (8%) + Mini Project (end-of-semester demo)             |

---

## Team Roles

| Member | Role |
|--------|------|
| Piji   | HTML structure — builds all page skeletons |
| Iki    | CSS styling — external stylesheet, responsive design |
| Makdi  | JavaScript — all form validation, cart logic, dynamic UI |
| Shukri | Backend — PHP, MySQL, sessions, QR code, email |
| Apek   | Testing — verifies all pages and flows, screenshots for presentation |

---

## Two Deliverables — Same Topic, Different Scope

### Assignment 2 (8% of course grade)
A simpler, client-side only version of the system.

| Component                     | Marks | Requirements                                                  |
|-------------------------------|-------|---------------------------------------------------------------|
| Interfaces (HTML/HTML5)       | 2.4   | Multiple linked pages                                         |
| CSS Styling (external `.css`) | 1.6   | All styles in a separate CSS file, no inline styles           |
| JavaScript Validation         | 2.0   | Form validation on all forms                                  |
| Web Server                    | 0.8   | Installed, configured, and serving the project                |
| Database                      | 1.2   | At least 3 tables created (schema only at this stage is fine) |

**Tech stack for Assignment 2:** HTML, HTML5, CSS (external), JavaScript only. No PHP/backend yet.

### Mini Project (end-of-semester demo, 15 min presentation)
Full-stack version with server-side logic, real database operations, and complete functionality.

**Tech stack for Mini Project:** HTML, CSS, JavaScript (frontend) + PHP & MySQL backend (or Laravel).

---

## System Description

A web-based restaurant order management system — **ClickEat** — that handles two types of customers:

### Walk-In Customers
- Each table has a **QR code** that customers scan to view the menu and place orders directly.
- **Waiters** can also scan a QR code to place orders on behalf of customers.
- Orders have real-time **status tracking**: `Pending → In Progress → Ready`.

### Online Customers
- A public-facing **online ordering interface** where customers browse the menu, add to cart, and check out.
- Checkout collects: customer name, delivery address, payment info (or receipt upload).
- **Order confirmation** shown after successful order placement.
- Restaurant **staff dashboard** to view and update both walk-in and online order statuses.

---

## Pages & File Map

| File                      | Page Name            | Description                                                           |
|---------------------------|----------------------|-----------------------------------------------------------------------|
| `index.html`              | Home                 | Landing page — entry point with hero banner, feature cards, popular menu preview |
| `menu.html`               | Menu                 | Browse all food items by category, add to cart, QR code modal for walk-in |
| `register.html`           | Register             | New customer sign-up form                                             |
| `login.html`              | Login                | Existing customer sign-in form                                        |
| `dashboard.html`          | Member Dashboard     | Logged-in member area — profile, recent orders, quick actions (View, Edit profile, track) |
| `order.html`              | Order / Cart         | Review cart, set order type (walk-in/online), delivery details, payment method |
| `order-confirmation.html` | Order Confirmation   | Success page shown after order is placed                              |
| `tracking.html`           | Order Tracking       | Enter order number → see step-by-step status progress bar            |
| `cart.html`               | Cart                 | Review cart items, adjust quantities, see subtotal/tax/delivery fee, apply promo |
| `staff-dashboard.html`    | Staff Dashboard      | Staff-only view to manage and update all walk-in and online orders    |
| `waiter.html`             | Waiter Interface     | Waiter scans QR or enters table number to place order on behalf of customer |

---

## Navigation Bar

The **same navbar** appears on every page.

**Before login:**
```
ClickEat   [Menu] [Order] [Track] [Dashboard] [Login]
```

**After login:**
```
ClickEat   [Menu] [Order] [Track] [My Account] [Logout]
```

---

## Page-by-Page UI Flow

### index.html — Home
- Hero banner: "Delicious meals prepared with love" + [View Menu] [Order Online] buttons
- Three feature cards: Walk-In Order (QR), Online Order (Delivery), Track Order
- Popular menu items preview (4 cards with name, image, price)
- Footer: About, Contact, Hours

### menu.html — Menu
- Category tabs: All / Main Course / Beverages / Desserts (JS filter, no page reload)
- Each item: name, description, price, [+ Add to Cart] button
- Cart counter in header updates on add
- "Add to Cart" shows a toast: "Added!" — stays on page
- QR Code Modal (for walk-in): shows QR image + table number input
- Bottom: [View Cart] → `cart.html` | [Continue to Checkout] → `cart.html` if logged in, else `login.html`

### register.html — Register
- Fields: Full Name, Email, Phone Number, Password, Confirm Password
- Radio: Customer Type — Walk-in / Online
- Checkbox: Agree to Terms & Conditions
- [REGISTER] → validate → `register-process.php` → success message → `login.html`
- [LOGIN] link → `login.html`

### login.html — Login
- Fields: Email, Password
- Checkbox: Remember Me
- [LOGIN] → validate → `login-process.php` → `dashboard.html` (success) or show error
- [Forgot Password?] → `forgot.html`
- [REGISTER] link → `register.html`

### dashboard.html — Member Dashboard
- Profile block: name, email, phone, member since, [Edit Profile]
- Recent orders table: Order #, date, total, status badge, [Tracking] link
- Quick action buttons: [ORDER NOW] → `menu.html` | [VIEW MENU] → `menu.html` | [TRACK ORDER] → `tracking.html`

### order.html — Order / Cart
- Order summary table: item, qty ([-][+]), price, subtotal, [Remove]
- Order type radio: Walk-in (table number input) / Online Delivery
- Delivery details section (shown only for online): address, special instructions, delivery time
- Payment method radio: Cash on Delivery / Card / Upload Receipt
- [Upload Payment Receipt] file input (shown only when receipt chosen)
- [CONTINUE TO CHECKOUT] → validate → `order-process.php` → `order-confirmation.html`
- [BACK TO MENU] → `menu.html`

### order-confirmation.html — Order Confirmation
- Shows: Order #, total, status = Pending, confirmation message
- Buttons: [TRACK ORDER] → `tracking.html` | [CONTINUE SHOPPING] → `menu.html`

### tracking.html — Order Tracking
- Input: Enter Order Number + [Track] button
- Progress bar: Order Placed → Kitchen Prep → Ready → Out for Delivery → Delivered
- Completed steps are highlighted; current step is active
- Order details block: items, total
- Status badge colors: Pending=Orange, In Progress=Yellow, Ready=Green, Completed=Blue, Delivered=Dark Green
- [Back to Dashboard] → `dashboard.html`

### cart.html — Cart
- Cart table: item, qty ([-][+]), price, total, [Edit] [Remove] per row
- Price summary: Subtotal, Delivery Fee (RM 3.00), Tax (6%), **TOTAL**
- Promo code: [________] [Apply] (JS validates code)
- [PROCEED TO CHECKOUT] → `order.html` | [ADD MORE ITEMS] → `menu.html`

---

## Button Action Reference

| Button              | Page              | Action                  | Destination                          |
|---------------------|-------------------|-------------------------|--------------------------------------|
| Login               | Home / Header     | Click                   | `login.html`                         |
| Register            | Home / Header     | Click                   | `register.html`                      |
| Logout              | Header            | Click                   | `logout.php` → `index.html`          |
| View Menu           | Home              | Click                   | `menu.html`                          |
| Order Online        | Home              | Click                   | `menu.html`                          |
| Walk-In Order       | Home              | Open modal              | QR modal → `menu.html`              |
| Track Order         | Home / Dashboard  | Click                   | `tracking.html`                      |
| Add to Cart         | Menu              | JS — update cart count  | Stay on page (toast notification)    |
| View Cart           | Menu / Header     | Click                   | `cart.html`                          |
| Continue to Checkout| Menu              | Check login state       | `order.html` or `login.html`         |
| REGISTER            | Register          | Validate + submit       | `register-process.php` → `login.html`|
| LOGIN               | Login             | Validate + submit       | `login-process.php` → `dashboard.html`|
| [+] / [-]           | Order / Cart      | JS — update qty & total | Stay on page                         |
| Remove              | Order / Cart      | JS — remove row         | Stay on page                         |
| Place Order         | Order             | Validate + submit       | `order-process.php` → `order-confirmation.html` |
| Track (button)      | Tracking          | Search by order number  | Display status on same page          |
| Edit Profile        | Dashboard         | Click                   | `edit-profile.html`                  |
| Apply Promo         | Cart              | JS — validate code      | Update total on page                 |

---

## User Flow Scenarios

### Scenario 1: New Online Customer
1. `index.html` → clicks Register
2. `register.html` → fills form → submits
3. `login.html` → logs in
4. `dashboard.html` → clicks Order Now
5. `menu.html` → adds items to cart
6. `cart.html` → reviews, proceeds
7. `order.html` → fills delivery details, uploads receipt
8. `order-confirmation.html` → sees order # and status
9. `tracking.html` → checks progress

### Scenario 2: Walk-In Customer (QR Scan)
1. Scans QR code on table → opens `menu.html` (table number pre-set via URL param)
2. Adds items to cart
3. Order type auto-set to Walk-In
4. No delivery address needed
5. Places order → `order-confirmation.html`

### Scenario 3: Returning Customer
1. `index.html` → Login
2. `dashboard.html` → views recent orders
3. Clicks Order Now → `menu.html` → adds items
4. Quick checkout → `order-confirmation.html`

---

## Database Schema (Minimum 3 Tables)

### `users`
| Column       | Type         | Notes                         |
|--------------|--------------|-------------------------------|
| `id`         | INT PK AI    |                               |
| `name`       | VARCHAR(100) |                               |
| `email`      | VARCHAR(100) | Unique                        |
| `password`   | VARCHAR(255) | Hashed                        |
| `phone`      | VARCHAR(20)  |                               |
| `role`       | ENUM         | `customer`, `staff`, `waiter` |
| `created_at` | TIMESTAMP    |                               |

### `orders`
| Column          | Type         | Notes                                           |
|-----------------|--------------|-------------------------------------------------|
| `id`            | INT PK AI    |                                                 |
| `user_id`       | INT FK       | References `users.id` (null for guest walk-in)  |
| `order_type`    | ENUM         | `walkin`, `online`                              |
| `table_number`  | INT          | Walk-in only                                    |
| `status`        | ENUM         | `Pending`, `In Progress`, `Ready`, `Completed`  |
| `total_price`   | DECIMAL      |                                                 |
| `created_at`    | TIMESTAMP    |                                                 |

### `order_items`
| Column       | Type         | Notes                  |
|--------------|--------------|------------------------|
| `id`         | INT PK AI    |                        |
| `order_id`   | INT FK       | References `orders.id` |
| `item_name`  | VARCHAR(100) |                        |
| `quantity`   | INT          |                        |
| `price`      | DECIMAL      | Unit price             |

---

## Form Validation Rules (JavaScript)

| Form         | Required Fields                         | Validation Rules                                            |
|--------------|-----------------------------------------|-------------------------------------------------------------|
| Register     | Name, Email, Phone, Password, Confirm   | Email format, phone 10+ digits numbers only, password min 6 chars, passwords must match, terms checked |
| Login        | Email, Password                         | Neither field empty                                         |
| Order / Cart | Item selection, Quantity                | At least one item, quantity > 0                             |
| Checkout     | Name, Address, Payment proof/info       | No empty fields                                             |
| Waiter Order | Table number, Items                     | Table number positive integer, at least one item            |

---

## Constraints & Rules for Agents

1. **Assignment 2 scope** — do not add PHP or backend logic unless the task explicitly says "mini project" or "full-stack". Assignment 2 is HTML + CSS + JS only.
2. **External CSS only** — all styles go into a separate `.css` file. No `<style>` tags, no inline `style=""` attributes.
3. **JavaScript validation** — all forms must have JS validation. Do not rely on HTML5 `required` alone.
4. **Responsive design** — all pages must work on desktop and mobile (breakpoint: 768px).
5. **Linked pages** — all pages share the same navigation bar. Active page should be highlighted.
6. **Malaysian context** — currency is **MYR (RM)**, menu items are Malaysian food, phone numbers follow Malaysian format (01X-XXXXXXX).
7. **Consistent naming** — use exact filenames from the File Map above. Do not invent new page names.
8. Follow **DESIGN.md** for all visual styling decisions (colors, typography, spacing, components).

---

## Presentation Structure (Week 15)

The 15-minute group presentation must cover:
1. Introduction — project description, problem statement, importance
2. Role of each group member
3. System functions with screenshots
4. Conclusion
5. Live demonstration

---

## Project Timeline

| Week      | Task                                                              |
|-----------|-------------------------------------------------------------------|
| Week 8–12 | Client-side work (HTML, CSS, JS validation) — **Assignment 2**    |
| Week 10–13| Server-side scripting (PHP & MySQL) — full functionality          |
| Week 14   | Implementation, testing, bug fixes                                |
| Week 15   | Final presentation and demo                                       |