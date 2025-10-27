-- Database
CREATE DATABASE IF NOT EXISTS ev_service_center
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE ev_service_center;

-- 1. users
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'staff', 'technician', 'admin') NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- 2. customers
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. staffs

CREATE TABLE IF NOT EXISTS staffs (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    position ENUM('receptionist', 'technician', 'manager', 'admin') NOT NULL,
    hire_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    vin VARCHAR(17) NOT NULL UNIQUE,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT CHECK (year BETWEEN 2000 AND 2100),
    battery_capacity_kwh DECIMAL(5,2),
    odometer_km DECIMAL(10,2) DEFAULT 0,
    last_service_date DATE,
    last_service_km DECIMAL(10,2) DEFAULT 0,
    next_service_due_km DECIMAL(10,2),
    next_service_due_date DATE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. services
CREATE TABLE IF NOT EXISTS services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    estimated_duration_minutes INT,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    type ENUM('maintenance', 'repair', 'inspection', 'package') NOT NULL,
    is_package BOOLEAN DEFAULT FALSE,
    validity_days INT CHECK (validity_days >= 0)
) ENGINE=InnoDB;

-- 6. parts
CREATE TABLE IF NOT EXISTS parts (
    part_id INT AUTO_INCREMENT PRIMARY KEY,
    part_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    manufacturer VARCHAR(100)
) ENGINE=InnoDB;

-- 7. appointments
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    service_id INT,
    requested_date_time DATETIME NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. service_orders
CREATE TABLE IF NOT EXISTS service_orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT UNIQUE,
    vehicle_id INT NOT NULL,
    assigned_technician_id INT,
    status ENUM('queued', 'in_progress', 'completed', 'delayed') NOT NULL DEFAULT 'queued',
    check_in_time DATETIME,
    check_out_time DATETIME,
    total_amount DECIMAL(12,2) DEFAULT 0,
    payment_status ENUM('unpaid', 'paid', 'partially_paid') DEFAULT 'unpaid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_technician_id) REFERENCES staffs(staff_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9. order_items
CREATE TABLE IF NOT EXISTS order_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    service_id INT,
    part_id INT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    type ENUM('service', 'part') NOT NULL,
    FOREIGN KEY (order_id) REFERENCES service_orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE SET NULL,
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 10. part_inventories
CREATE TABLE IF NOT EXISTS part_inventories (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    part_id INT NOT NULL,
    quantity_in_stock INT NOT NULL DEFAULT 0 CHECK (quantity_in_stock >= 0),
    min_stock_level INT NOT NULL DEFAULT 5 CHECK (min_stock_level >= 0),
    UNIQUE KEY unique_part (part_id),
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. part_usage_history
CREATE TABLE IF NOT EXISTS part_usage_history (
    usage_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    part_id INT NOT NULL,
    quantity_used INT NOT NULL CHECK (quantity_used > 0),
    used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    vehicle_model VARCHAR(100) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES service_orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 12. service_checklists
CREATE TABLE IF NOT EXISTS service_checklists (
    checklist_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    completed_by INT,
    completed_at DATETIME,
    FOREIGN KEY (order_id) REFERENCES service_orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (completed_by) REFERENCES staffs(staff_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 13. payments
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    payment_method ENUM('cash', 'bank_transfer', 'ewallet', 'credit_card') NOT NULL,
    transaction_id VARCHAR(100),
    status ENUM('pending', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    paid_at DATETIME,
    FOREIGN KEY (order_id) REFERENCES service_orders(order_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    staff_id INT NOT NULL,
    content TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    sender_role ENUM('customer', 'staff') NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staffs(staff_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 15. notifications
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('maintenance_reminder', 'payment_due', 'appointment_status', 'low_stock') NOT NULL,
    related_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 16. part_requests: phiếu yêu cầu xuất kho
CREATE TABLE IF NOT EXISTS part_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,                                   -- tham chiếu lệnh sửa chữa (nếu có)
    created_by_staff_id INT NOT NULL,               -- người tạo (Technician)
    approved_by_staff_id INT,                       -- người duyệt (Admin/Manager)
    status ENUM('PENDING','APPROVED','REJECTED','FULFILLED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    reason TEXT,                                    -- lý do (kèm mô tả hư hỏng, hạng mục)
    reject_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    fulfilled_at DATETIME,
    FOREIGN KEY (order_id) REFERENCES service_orders(order_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_staff_id) REFERENCES staffs(staff_id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by_staff_id) REFERENCES staffs(staff_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 17. part_request_items: chi tiết phụ tùng trong yêu cầu
CREATE TABLE IF NOT EXISTS part_request_items (
    request_item_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    part_id INT NOT NULL,
    quantity_requested INT NOT NULL CHECK (quantity_requested > 0),
    quantity_approved INT DEFAULT 0 CHECK (quantity_approved >= 0),
    FOREIGN KEY (request_id) REFERENCES part_requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 18. part_transactions: lịch sử nhập/xuất (audit)
CREATE TABLE IF NOT EXISTS part_transactions (
    txn_id INT AUTO_INCREMENT PRIMARY KEY,
    part_id INT NOT NULL,
    type ENUM('IMPORT','EXPORT','ADJUSTMENT') NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    related_request_id INT,         -- link tới phiếu yêu cầu khi xuất
    related_order_id INT,           -- link tới service_orders khi xuất cho 1 order
    note TEXT,
    created_by_staff_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE RESTRICT,
    FOREIGN KEY (related_request_id) REFERENCES part_requests(request_id) ON DELETE SET NULL,
    FOREIGN KEY (related_order_id) REFERENCES service_orders(order_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_staff_id) REFERENCES staffs(staff_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Index
CREATE INDEX idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_service_orders_status ON service_orders(status);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_part_requests_status ON part_requests(status, created_at);
CREATE INDEX idx_part_request_items_req ON part_request_items(request_id);
CREATE INDEX idx_part_txn_part ON part_transactions(part_id, type, created_at);