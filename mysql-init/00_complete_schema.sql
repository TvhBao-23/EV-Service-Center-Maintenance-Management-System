-- =====================================================
-- EV SERVICE CENTER - COMPLETE DATABASE SCHEMA
-- Database tổng quan hoàn chỉnh
-- Ưu tiên schema hiện tại trong hệ thống đang chạy
-- Bổ sung các bảng còn thiếu từ schema mới
-- =====================================================

-- Set charset to UTF-8
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS ev_service_center CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ev_service_center;

-- =====================================================
-- 1. USERS TABLE (Ưu tiên schema hiện tại, thêm is_active)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'staff', 'technician', 'admin') NOT NULL DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =====================================================
-- 2. CUSTOMERS TABLE (Giữ nguyên - đã ổn)
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    customer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_customers_user_id ON customers(user_id);

-- =====================================================
-- 3. STAFFS TABLE (Bảng mới - cần thiết cho Staff)
-- =====================================================
CREATE TABLE IF NOT EXISTS staffs (
    staff_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    position ENUM('receptionist', 'technician', 'manager', 'admin') NOT NULL,
    hire_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_staffs_user_id ON staffs(user_id);
CREATE INDEX idx_staffs_position ON staffs(position);

-- =====================================================
-- 4. SERVICE CENTERS TABLE (Giữ nguyên)
-- =====================================================
CREATE TABLE IF NOT EXISTS service_centers (
    center_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. SERVICES TABLE (Giữ nguyên, thêm type, is_package, validity_days nếu chưa có)
-- =====================================================
CREATE TABLE IF NOT EXISTS services (
    service_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_duration_minutes INT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    type ENUM('maintenance', 'repair', 'inspection', 'package') NOT NULL DEFAULT 'maintenance',
    is_package BOOLEAN DEFAULT FALSE,
    validity_days INT CHECK (validity_days >= 0),
    category VARCHAR(50) DEFAULT 'maintenance',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_type ON services(type);

-- =====================================================
-- 6. VEHICLES TABLE (Giữ nguyên - đã ổn cho Customer)
-- =====================================================
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    vin VARCHAR(17) UNIQUE NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    battery_capacity_kwh DECIMAL(5,2),
    odometer_km INT,
    last_service_date DATE,
    last_service_km INT,
    next_service_due_km DECIMAL(10,2),
    next_service_due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_vehicles_customer_id ON vehicles(customer_id);
CREATE INDEX idx_vehicles_vin ON vehicles(vin);

-- =====================================================
-- 7. APPOINTMENTS TABLE (Giữ nguyên - đã ổn cho Customer)
-- =====================================================
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    service_id BIGINT,
    center_id BIGINT,
    requested_date_time DATETIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'received') NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE SET NULL,
    FOREIGN KEY (center_id) REFERENCES service_centers(center_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_vehicle_id ON appointments(vehicle_id);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_requested_date_time ON appointments(requested_date_time);

-- =====================================================
-- 8. SERVICE ORDERS TABLE (Bảng mới - cần thiết cho Staff)
-- =====================================================
CREATE TABLE IF NOT EXISTS service_orders (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT UNIQUE,
    vehicle_id BIGINT NOT NULL,
    assigned_technician_id BIGINT,
    status ENUM('queued', 'in_progress', 'completed', 'delayed') NOT NULL DEFAULT 'queued',
    check_in_time DATETIME,
    check_out_time DATETIME,
    total_amount DECIMAL(12,2) DEFAULT 0,
    payment_status ENUM('unpaid', 'paid', 'partially_paid') DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_technician_id) REFERENCES staffs(staff_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_service_orders_appointment_id ON service_orders(appointment_id);
CREATE INDEX idx_service_orders_vehicle_id ON service_orders(vehicle_id);
CREATE INDEX idx_service_orders_status ON service_orders(status);
CREATE INDEX idx_service_orders_assigned_technician_id ON service_orders(assigned_technician_id);

-- =====================================================
-- 9. ORDER ITEMS TABLE (Bảng mới - cần thiết cho Staff)
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    service_id BIGINT,
    part_id BIGINT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    type ENUM('service', 'part') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES service_orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE SET NULL,
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_service_id ON order_items(service_id);
CREATE INDEX idx_order_items_part_id ON order_items(part_id);
CREATE INDEX idx_order_items_type ON order_items(type);

-- =====================================================
-- 10. PARTS TABLE (Giữ nguyên schema hiện tại)
-- =====================================================
CREATE TABLE IF NOT EXISTS parts (
    part_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100),
    compatible_models TEXT,
    unit_price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock_level INT NOT NULL DEFAULT 5,
    location VARCHAR(100),
    warranty_months INT DEFAULT 12,
    image_url VARCHAR(500),
    status ENUM('available', 'low_stock', 'out_of_stock', 'discontinued') NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_parts_part_code ON parts(part_code);
CREATE INDEX idx_parts_category ON parts(category);
CREATE INDEX idx_parts_status ON parts(status);

-- =====================================================
-- 11. PART INVENTORIES TABLE (Bảng mới - bổ sung cho parts)
-- =====================================================
CREATE TABLE IF NOT EXISTS part_inventories (
    inventory_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_id BIGINT NOT NULL,
    quantity_in_stock INT NOT NULL DEFAULT 0 CHECK (quantity_in_stock >= 0),
    min_stock_level INT NOT NULL DEFAULT 5 CHECK (min_stock_level >= 0),
    UNIQUE KEY unique_part (part_id),
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_part_inventories_part_id ON part_inventories(part_id);

-- =====================================================
-- 12. PART USAGE HISTORY TABLE (Bảng mới)
-- =====================================================
CREATE TABLE IF NOT EXISTS part_usage_history (
    usage_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    part_id BIGINT NOT NULL,
    quantity_used INT NOT NULL CHECK (quantity_used > 0),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vehicle_model VARCHAR(100) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES service_orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_part_usage_history_order_id ON part_usage_history(order_id);
CREATE INDEX idx_part_usage_history_part_id ON part_usage_history(part_id);
CREATE INDEX idx_part_usage_history_used_at ON part_usage_history(used_at);

-- =====================================================
-- 13. SERVICE CHECKLISTS TABLE (Bảng mới)
-- =====================================================
CREATE TABLE IF NOT EXISTS service_checklists (
    checklist_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    completed_by BIGINT,
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES service_orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (completed_by) REFERENCES staffs(staff_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_service_checklists_order_id ON service_checklists(order_id);
CREATE INDEX idx_service_checklists_completed_by ON service_checklists(completed_by);
CREATE INDEX idx_service_checklists_is_completed ON service_checklists(is_completed);

-- =====================================================
-- 14. PAYMENTS TABLE (Giữ nguyên schema hiện tại)
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'bank_transfer', 'e_wallet') NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    transaction_id VARCHAR(100) UNIQUE,
    payment_date TIMESTAMP NULL,
    verification_code VARCHAR(6),
    verification_expires_at TIMESTAMP NULL,
    verified BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);

-- =====================================================
-- 15. ASSIGNMENTS TABLE (Giữ nguyên - Staff management)
-- =====================================================
CREATE TABLE IF NOT EXISTS assignments (
    assignment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT NOT NULL,
    technician_id BIGINT NOT NULL,
    assigned_by BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('assigned', 'accepted', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'assigned',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_assignments_appointment_id ON assignments(appointment_id);
CREATE INDEX idx_assignments_technician_id ON assignments(technician_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_assigned_at ON assignments(assigned_at);

-- =====================================================
-- 16. SERVICE RECEIPTS TABLE (Giữ nguyên - Staff management)
-- =====================================================
CREATE TABLE IF NOT EXISTS service_receipts (
    receipt_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    received_by BIGINT NOT NULL,
    odometer_reading INT NOT NULL,
    fuel_level VARCHAR(20),
    exterior_condition TEXT,
    interior_condition TEXT,
    customer_complaints TEXT,
    estimated_completion DATETIME,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (received_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_service_receipts_appointment_id ON service_receipts(appointment_id);
CREATE INDEX idx_service_receipts_vehicle_id ON service_receipts(vehicle_id);
CREATE INDEX idx_service_receipts_receipt_number ON service_receipts(receipt_number);

-- =====================================================
-- 17. CHECKLISTS TABLE (Giữ nguyên - Staff management)
-- =====================================================
CREATE TABLE IF NOT EXISTS checklists (
    checklist_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    technician_id BIGINT NOT NULL,
    battery_health VARCHAR(20),
    battery_voltage DECIMAL(5,2),
    battery_temperature DECIMAL(5,2),
    brake_system VARCHAR(20),
    tire_condition VARCHAR(20),
    tire_pressure VARCHAR(100),
    lights_status VARCHAR(20),
    cooling_system VARCHAR(20),
    motor_condition VARCHAR(20),
    charging_port VARCHAR(20),
    software_version VARCHAR(50),
    overall_status VARCHAR(20),
    notes TEXT,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_checklists_assignment_id ON checklists(assignment_id);
CREATE INDEX idx_checklists_vehicle_id ON checklists(vehicle_id);
CREATE INDEX idx_checklists_technician_id ON checklists(technician_id);

-- =====================================================
-- 18. MAINTENANCE REPORTS TABLE (Giữ nguyên - Staff management)
-- =====================================================
CREATE TABLE IF NOT EXISTS maintenance_reports (
    report_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    technician_id BIGINT NOT NULL,
    work_performed TEXT NOT NULL,
    parts_used TEXT,
    issues_found TEXT,
    recommendations TEXT,
    labor_hours DECIMAL(5,2),
    status ENUM('draft', 'submitted', 'approved', 'rejected') NOT NULL DEFAULT 'draft',
    submitted_at TIMESTAMP NULL,
    approved_by BIGINT NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_maintenance_reports_assignment_id ON maintenance_reports(assignment_id);
CREATE INDEX idx_maintenance_reports_vehicle_id ON maintenance_reports(vehicle_id);
CREATE INDEX idx_maintenance_reports_technician_id ON maintenance_reports(technician_id);
CREATE INDEX idx_maintenance_reports_status ON maintenance_reports(status);

-- =====================================================
-- 19. PART REQUESTS TABLE (Giữ nguyên - Staff management)
-- =====================================================
CREATE TABLE IF NOT EXISTS part_requests (
    request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    part_id BIGINT NOT NULL,
    vehicle_id BIGINT,
    quantity INT NOT NULL DEFAULT 1,
    request_type ENUM('purchase', 'quote', 'warranty') NOT NULL DEFAULT 'purchase',
    status ENUM('pending', 'approved', 'rejected', 'fulfilled', 'cancelled') NOT NULL DEFAULT 'pending',
    requested_price DECIMAL(10,2),
    approved_price DECIMAL(10,2),
    approved_by BIGINT,
    approved_at TIMESTAMP NULL,
    notes TEXT,
    staff_notes TEXT,
    delivery_method ENUM('pickup', 'delivery') DEFAULT 'pickup',
    delivery_address TEXT,
    estimated_delivery_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_part_requests_customer_id ON part_requests(customer_id);
CREATE INDEX idx_part_requests_part_id ON part_requests(part_id);
CREATE INDEX idx_part_requests_status ON part_requests(status);
CREATE INDEX idx_part_requests_created_at ON part_requests(created_at);

-- =====================================================
-- 20. PART INVENTORY LOGS TABLE (Giữ nguyên - Staff management)
-- =====================================================
CREATE TABLE IF NOT EXISTS part_inventory_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_id BIGINT NOT NULL,
    type ENUM('in', 'out', 'adjustment', 'damaged', 'returned') NOT NULL,
    quantity INT NOT NULL,
    reference_type VARCHAR(50),
    reference_id BIGINT,
    performed_by BIGINT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_part_inventory_logs_part_id ON part_inventory_logs(part_id);
CREATE INDEX idx_part_inventory_logs_type ON part_inventory_logs(type);
CREATE INDEX idx_part_inventory_logs_created_at ON part_inventory_logs(created_at);

-- =====================================================
-- 21. CHAT MESSAGES TABLE (Giữ nguyên - messages và chat_conversations)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
    message_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    recipient_id BIGINT NOT NULL,
    subject VARCHAR(255),
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    parent_message_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_message_id) REFERENCES messages(message_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE TABLE IF NOT EXISTS chat_conversations (
    conversation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    staff_id BIGINT NOT NULL,
    subject VARCHAR(255),
    status ENUM('active', 'closed', 'archived') NOT NULL DEFAULT 'active',
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_chat_conversations_customer_id ON chat_conversations(customer_id);
CREATE INDEX idx_chat_conversations_staff_id ON chat_conversations(staff_id);
CREATE INDEX idx_chat_conversations_status ON chat_conversations(status);

-- =====================================================
-- 22. CHAT_MESSAGES TABLE (Schema mới - nếu cần)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    message_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    staff_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    sender_role ENUM('customer', 'staff') NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staffs(staff_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_chat_messages_customer_id ON chat_messages(customer_id);
CREATE INDEX idx_chat_messages_staff_id ON chat_messages(staff_id);
CREATE INDEX idx_chat_messages_sent_at ON chat_messages(sent_at);
CREATE INDEX idx_chat_messages_is_read ON chat_messages(is_read);

-- =====================================================
-- 23. NOTIFICATIONS TABLE (Bảng mới)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('maintenance_reminder', 'payment_due', 'appointment_status', 'low_stock') NOT NULL,
    related_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_notifications_user_id ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- 24. PASSWORD RESET TABLES (Giữ nguyên)
-- =====================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    ip_address VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

CREATE TABLE IF NOT EXISTS password_reset_attempts (
    attempt_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    attempt_count INT DEFAULT 1,
    last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blocked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_password_reset_attempts_email ON password_reset_attempts(email);
CREATE INDEX idx_password_reset_attempts_ip ON password_reset_attempts(ip_address);

-- =====================================================
-- 25. SUBSCRIPTION TABLES (Giữ nguyên)
-- =====================================================
CREATE TABLE IF NOT EXISTS service_packages (
    package_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_months INT NOT NULL,
    services_included INT NOT NULL,
    benefits TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_service_packages_active ON service_packages(active);

CREATE TABLE IF NOT EXISTS customer_subscriptions (
    subscription_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    services_used INT NOT NULL DEFAULT 0,
    status ENUM('ACTIVE', 'EXPIRED', 'CANCELLED', 'EXHAUSTED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES service_packages(package_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_customer_subscriptions_customer_id ON customer_subscriptions(customer_id);
CREATE INDEX idx_customer_subscriptions_package_id ON customer_subscriptions(package_id);
CREATE INDEX idx_customer_subscriptions_status ON customer_subscriptions(status);
CREATE INDEX idx_customer_subscriptions_end_date ON customer_subscriptions(end_date);

-- =====================================================
-- 26. SERVICE PARTS MAPPING TABLE (Giữ nguyên)
-- =====================================================
CREATE TABLE IF NOT EXISTS service_part_categories (
    mapping_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_category VARCHAR(50) NOT NULL,
    part_category VARCHAR(100) NOT NULL,
    priority INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_mapping (service_category, part_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_service_category ON service_part_categories(service_category);
CREATE INDEX idx_part_category ON service_part_categories(part_category);

-- =====================================================
-- END OF SCHEMA
-- =====================================================

