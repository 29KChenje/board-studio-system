CREATE DATABASE IF NOT EXISTS board_studio_system;
USE board_studio_system;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_role_created_at (role, created_at)
);

CREATE TABLE IF NOT EXISTS projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(160) NOT NULL,
  width DECIMAL(10,2) NOT NULL,
  height DECIMAL(10,2) NOT NULL,
  depth DECIMAL(10,2) NOT NULL,
  board_width DECIMAL(10,2) NOT NULL DEFAULT 2750,
  board_height DECIMAL(10,2) NOT NULL DEFAULT 1830,
  material VARCHAR(120) NOT NULL DEFAULT 'Melamine White',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_projects_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_projects_user_created_at (user_id, created_at),
  INDEX idx_projects_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS pieces (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  name VARCHAR(160) NOT NULL,
  width DECIMAL(10,2) NOT NULL,
  height DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  grain_direction ENUM('fixed', 'flexible') NOT NULL DEFAULT 'fixed',
  edging_top TINYINT(1) NOT NULL DEFAULT 0,
  edging_bottom TINYINT(1) NOT NULL DEFAULT 0,
  edging_left TINYINT(1) NOT NULL DEFAULT 0,
  edging_right TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pieces_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_pieces_project_id (project_id)
);

CREATE TABLE IF NOT EXISTS boards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  material VARCHAR(120) NOT NULL,
  width DECIMAL(10,2) NOT NULL,
  height DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_boards_material (material)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  project_id INT NULL,
  order_type ENUM('workshop', 'shop') NOT NULL DEFAULT 'workshop',
  total_cost DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'awaiting_payment_confirmation', 'quoted', 'approved', 'in_production', 'completed') NOT NULL DEFAULT 'pending',
  payment_status ENUM('pending', 'awaiting_confirmation', 'authorized', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  payment_reference VARCHAR(120) NULL,
  payment_method VARCHAR(50) NULL,
  payment_amount DECIMAL(10,2) NULL,
  quote_json JSON NULL,
  shipping_name VARCHAR(120) NULL,
  shipping_email VARCHAR(180) NULL,
  shipping_phone VARCHAR(50) NULL,
  shipping_address TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_orders_user_created_at (user_id, created_at),
  INDEX idx_orders_status_created_at (status, created_at),
  INDEX idx_orders_order_type_created_at (order_type, created_at),
  INDEX idx_orders_payment_status (payment_status)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(160) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_items_order_id (order_id),
  INDEX idx_order_items_product_id (product_id)
);

CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  category VARCHAR(120) NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255) NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_active_category (is_active, category),
  INDEX idx_products_name (name),
  INDEX idx_products_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS carts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_carts_updated_at (updated_at)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id),
  INDEX idx_cart_items_cart_id (cart_id),
  INDEX idx_cart_items_product_id (product_id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  user_id INT NOT NULL,
  provider VARCHAR(60) NOT NULL DEFAULT 'simulated',
  reference_code VARCHAR(120) NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'ZAR',
  method VARCHAR(50) NOT NULL DEFAULT 'card',
  status ENUM('pending', 'awaiting_confirmation', 'authorized', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  customer_reference VARCHAR(120) NULL,
  proof_of_payment_url VARCHAR(255) NULL,
  verified_at TIMESTAMP NULL,
  verified_by_user_id INT NULL,
  provider_response JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_verified_by FOREIGN KEY (verified_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_payments_order_id (order_id),
  INDEX idx_payments_user_created_at (user_id, created_at),
  INDEX idx_payments_status_created_at (status, created_at),
  INDEX idx_payments_customer_reference (customer_reference)
);
