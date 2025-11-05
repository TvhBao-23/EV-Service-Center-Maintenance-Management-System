-- EV Service Center Database Schema
-- Created for AuthService and CustomerService

-- Set charset to UTF-8
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS ev_service_center CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ev_service_center;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'staff', 'technician', 'admin') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    customer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Service Centers table
CREATE TABLE IF NOT EXISTS service_centers (
    center_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Services table
CREATE TABLE IF NOT EXISTS services (
    service_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_duration_minutes INT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Vehicles table
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    center_id BIGINT NOT NULL,
    requested_date_time DATETIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE,
    FOREIGN KEY (center_id) REFERENCES service_centers(center_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_vehicles_customer_id ON vehicles(customer_id);
CREATE INDEX idx_vehicles_vin ON vehicles(vin);
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_vehicle_id ON appointments(vehicle_id);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);
CREATE INDEX idx_appointments_center_id ON appointments(center_id);
CREATE INDEX idx_appointments_requested_date_time ON appointments(requested_date_time);

-- Insert seed data for service centers
INSERT INTO service_centers (name, address, phone) VALUES
('Trung tâm dịch vụ xe điện Hoài Bảo - Quận 1', '123 Nguyễn Huệ, Quận 1, TP.HCM', '0772051289'),
('Trung tâm dịch vụ xe điện Hoài Bảo - Quận 7', '456 Nguyễn Thị Thập, Quận 7, TP.HCM', '0772051290'),
('Trung tâm dịch vụ xe điện Hoài Bảo - Quận 12', '789 Đường Tân Thới Hiệp, Quận 12, TP.HCM', '0772051291');

-- Insert seed data for services with new pricing packages
INSERT INTO services (name, description, estimated_duration_minutes, base_price) VALUES
('Gói Bảo dưỡng Cơ bản', 'Kiểm tra tổng thể và bảo dưỡng cơ bản', 60, 100000),
('Gói Bảo dưỡng Tiêu chuẩn', 'Bảo dưỡng định kỳ và kiểm tra chi tiết', 120, 500000),
('Gói Bảo dưỡng Cao cấp', 'Bảo dưỡng toàn diện với thay thế linh kiện', 180, 1000000),
('Gói Bảo dưỡng Premium', 'Bảo dưỡng toàn diện + nâng cấp hệ thống', 240, 5000000);

-- Payments table
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
);

CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);

-- =====================================================
-- STAFF MANAGEMENT TABLES
-- =====================================================

-- Assignments table (phân công kỹ thuật viên)
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
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_assignments_appointment_id ON assignments(appointment_id);
CREATE INDEX idx_assignments_technician_id ON assignments(technician_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_assigned_at ON assignments(assigned_at);

-- Service Receipts table (phiếu tiếp nhận dịch vụ)
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
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_service_receipts_appointment_id ON service_receipts(appointment_id);
CREATE INDEX idx_service_receipts_vehicle_id ON service_receipts(vehicle_id);
CREATE INDEX idx_service_receipts_receipt_number ON service_receipts(receipt_number);

-- Checklists table (checklist kiểm tra EV)
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
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_checklists_assignment_id ON checklists(assignment_id);
CREATE INDEX idx_checklists_vehicle_id ON checklists(vehicle_id);
CREATE INDEX idx_checklists_technician_id ON checklists(technician_id);

-- Maintenance Reports table (báo cáo bảo dưỡng)
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
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_maintenance_reports_assignment_id ON maintenance_reports(assignment_id);
CREATE INDEX idx_maintenance_reports_vehicle_id ON maintenance_reports(vehicle_id);
CREATE INDEX idx_maintenance_reports_technician_id ON maintenance_reports(technician_id);
CREATE INDEX idx_maintenance_reports_status ON maintenance_reports(status);

-- Parts table (phụ tùng)
CREATE TABLE IF NOT EXISTS parts (
    part_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- battery, motor, brake, tire, electronic, etc.
    manufacturer VARCHAR(100),
    compatible_models TEXT, -- JSON array of compatible vehicle models
    unit_price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock_level INT NOT NULL DEFAULT 5,
    location VARCHAR(100), -- Vị trí trong kho
    warranty_months INT DEFAULT 12,
    image_url VARCHAR(500),
    status ENUM('available', 'low_stock', 'out_of_stock', 'discontinued') NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_parts_part_code ON parts(part_code);
CREATE INDEX idx_parts_category ON parts(category);
CREATE INDEX idx_parts_status ON parts(status);

-- Part Requests table (yêu cầu phụ tùng từ khách hàng)
CREATE TABLE IF NOT EXISTS part_requests (
    request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    part_id BIGINT NOT NULL,
    vehicle_id BIGINT, -- Optional: nếu yêu cầu cho xe cụ thể
    quantity INT NOT NULL DEFAULT 1,
    request_type ENUM('purchase', 'quote', 'warranty') NOT NULL DEFAULT 'purchase',
    status ENUM('pending', 'approved', 'rejected', 'fulfilled', 'cancelled') NOT NULL DEFAULT 'pending',
    requested_price DECIMAL(10,2), -- Giá khách hàng mong muốn (cho quote)
    approved_price DECIMAL(10,2), -- Giá được phê duyệt
    approved_by BIGINT, -- Staff ID
    approved_at TIMESTAMP NULL,
    notes TEXT, -- Ghi chú từ khách hàng
    staff_notes TEXT, -- Ghi chú từ staff
    delivery_method ENUM('pickup', 'delivery') DEFAULT 'pickup',
    delivery_address TEXT,
    estimated_delivery_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_part_requests_customer_id ON part_requests(customer_id);
CREATE INDEX idx_part_requests_part_id ON part_requests(part_id);
CREATE INDEX idx_part_requests_status ON part_requests(status);
CREATE INDEX idx_part_requests_created_at ON part_requests(created_at);

-- Part Inventory Logs table (lịch sử nhập xuất kho)
CREATE TABLE IF NOT EXISTS part_inventory_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_id BIGINT NOT NULL,
    type ENUM('in', 'out', 'adjustment', 'damaged', 'returned') NOT NULL,
    quantity INT NOT NULL,
    reference_type VARCHAR(50), -- 'part_request', 'maintenance_report', 'manual'
    reference_id BIGINT, -- ID của part_request hoặc maintenance_report
    performed_by BIGINT NOT NULL, -- Staff ID
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(user_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_part_inventory_logs_part_id ON part_inventory_logs(part_id);
CREATE INDEX idx_part_inventory_logs_type ON part_inventory_logs(type);
CREATE INDEX idx_part_inventory_logs_created_at ON part_inventory_logs(created_at);

-- Insert sample parts data
INSERT INTO parts (part_code, name, description, category, manufacturer, compatible_models, unit_price, stock_quantity, min_stock_level, location, warranty_months, status) VALUES
-- Battery components
('BAT-LI-001', 'Pin Lithium-Ion 60kWh', 'Pin lithium-ion dung lượng 60kWh cho xe điện', 'battery', 'LG Chem', '["Tesla Model 3", "Nissan Leaf", "VinFast VF8"]', 15000000.00, 5, 2, 'Kho A-01', 24, 'available'),
('BAT-LI-002', 'Pin Lithium-Ion 75kWh', 'Pin lithium-ion dung lượng 75kWh cao cấp', 'battery', 'CATL', '["Tesla Model Y", "VinFast VF9", "Hyundai Ioniq 5"]', 18000000.00, 3, 2, 'Kho A-02', 24, 'low_stock'),
('BAT-CELL-001', 'Cell Pin Thay Thế', 'Cell pin lithium-ion thay thế cho module hỏng', 'battery', 'Samsung SDI', '["All EV Models"]', 500000.00, 50, 10, 'Kho A-03', 12, 'available'),
('BMS-001', 'Hệ Thống Quản Lý Pin BMS', 'Battery Management System điều khiển pin', 'electronic', 'Bosch', '["All EV Models"]', 8000000.00, 8, 3, 'Kho B-01', 18, 'available'),

-- Motor components
('MOT-AC-001', 'Động Cơ Điện AC 150kW', 'Động cơ điện AC công suất 150kW', 'motor', 'Siemens', '["Tesla Model 3", "VinFast VF8"]', 25000000.00, 2, 1, 'Kho C-01', 36, 'low_stock'),
('MOT-DC-001', 'Động Cơ Điện DC 100kW', 'Động cơ điện DC công suất 100kW', 'motor', 'Nissan', '["Nissan Leaf"]', 20000000.00, 4, 2, 'Kho C-02', 36, 'available'),
('INV-001', 'Bộ Nghịch Lưu Công Suất', 'Inverter chuyển đổi DC-AC cho động cơ', 'electronic', 'ABB', '["All EV Models"]', 12000000.00, 6, 2, 'Kho B-02', 24, 'available'),

-- Brake components
('BRK-PAD-001', 'Má Phanh Ceramic Trước', 'Má phanh ceramic cho bánh trước', 'brake', 'Brembo', '["All EV Models"]', 1200000.00, 40, 15, 'Kho D-01', 12, 'available'),
('BRK-PAD-002', 'Má Phanh Ceramic Sau', 'Má phanh ceramic cho bánh sau', 'brake', 'Brembo', '["All EV Models"]', 1000000.00, 35, 15, 'Kho D-02', 12, 'available'),
('BRK-DISC-001', 'Đĩa Phanh Thông Gió Trước', 'Đĩa phanh thông gió 350mm cho bánh trước', 'brake', 'StopTech', '["Tesla Model 3", "VinFast VF8", "Hyundai Ioniq 5"]', 2500000.00, 20, 8, 'Kho D-03', 18, 'available'),
('BRK-DISC-002', 'Đĩa Phanh Sau', 'Đĩa phanh 320mm cho bánh sau', 'brake', 'StopTech', '["All EV Models"]', 2000000.00, 18, 8, 'Kho D-04', 18, 'available'),

-- Tire components
('TIRE-001', 'Lốp Michelin EV 235/45R18', 'Lốp chuyên dụng cho xe điện 235/45R18', 'tire', 'Michelin', '["Tesla Model 3", "VinFast VF8"]', 3500000.00, 32, 12, 'Kho E-01', 24, 'available'),
('TIRE-002', 'Lốp Bridgestone Turanza EV 245/50R19', 'Lốp cao cấp cho xe điện SUV', 'tire', 'Bridgestone', '["Tesla Model Y", "VinFast VF9"]', 4200000.00, 24, 12, 'Kho E-02', 24, 'available'),

-- Charging components
('CHG-PORT-001', 'Cổng Sạc Type 2', 'Cổng sạc chuẩn Type 2 (IEC 62196)', 'charging', 'Phoenix Contact', '["All EV Models"]', 5000000.00, 10, 3, 'Kho F-01', 12, 'available'),
('CHG-CABLE-001', 'Dây Sạc Type 2 - 5m', 'Dây sạc chuẩn Type 2 dài 5m', 'charging', 'Mennekes', '["All EV Models"]', 2000000.00, 15, 5, 'Kho F-02', 12, 'available'),
('CHG-ONBOARD-001', 'Bộ Sạc Onboard 11kW', 'Bộ sạc tích hợp trên xe 11kW', 'charging', 'Delta Electronics', '["All EV Models"]', 15000000.00, 5, 2, 'Kho F-03', 24, 'available'),

-- Electronic components
('ECU-001', 'Bộ Điều Khiển Trung Tâm ECU', 'Electronic Control Unit chính', 'electronic', 'Continental', '["Tesla Model 3", "VinFast VF8"]', 10000000.00, 4, 2, 'Kho B-03', 24, 'available'),
('DISPLAY-001', 'Màn Hình Cảm Ứng 15.4 inch', 'Màn hình trung tâm cảm ứng', 'electronic', 'LG Display', '["Tesla Model 3", "VinFast VF8"]', 8000000.00, 6, 2, 'Kho B-04', 18, 'available'),
('SENSOR-001', 'Cảm Biến Nhiệt Độ Pin', 'Cảm biến đo nhiệt độ module pin', 'electronic', 'Sensata', '["All EV Models"]', 500000.00, 60, 20, 'Kho B-05', 12, 'available'),

-- Cooling system
('COOL-PUMP-001', 'Bơm Tuần Hoàn Nước Làm Mát', 'Bơm điện tuần hoàn dung dịch làm mát', 'cooling', 'Bosch', '["All EV Models"]', 3000000.00, 12, 5, 'Kho G-01', 18, 'available'),
('COOL-RAD-001', 'Két Làm Mát Pin', 'Radiator làm mát hệ thống pin', 'cooling', 'Denso', '["Tesla Model 3", "VinFast VF8"]', 4500000.00, 8, 3, 'Kho G-02', 18, 'available'),

-- Miscellaneous
('FILTER-001', 'Lọc Gió Cabin HEPA', 'Lọc không khí cabin chuẩn HEPA', 'filter', '3M', '["All EV Models"]', 800000.00, 50, 20, 'Kho H-01', 6, 'available'),
('WIPER-001', 'Cần Gạt Nước 26 inch', 'Cần gạt nước kính trước', 'accessory', 'Bosch', '["All EV Models"]', 450000.00, 40, 15, 'Kho H-02', 6, 'available'),
('FLUID-001', 'Dung Dịch Làm Mát EV 5L', 'Dung dịch làm mát chuyên dụng cho xe điện', 'fluid', 'Motul', '["All EV Models"]', 600000.00, 80, 30, 'Kho H-03', 0, 'available');

-- =====================================================
-- INSERT STAFF USERS
-- =====================================================
-- Password for all: 230305
-- Hashed with BCrypt: $2b$10$pYvi5iguAjkpj7MXXnnSEeacT1Pi4LV/Sl.zAM9aXLidzHjkZUBBq

-- Insert Admin User (password: 230305)
INSERT INTO users (email, password, full_name, phone, role) VALUES
('admin@gmail.com', '$2b$10$pYvi5iguAjkpj7MXXnnSEeacT1Pi4LV/Sl.zAM9aXLidzHjkZUBBq', 'Admin Hoai Bao', '0772051289', 'admin');

-- Insert Receptionist/Staff Users (password: 230305)
INSERT INTO users (email, password, full_name, phone, role) VALUES 
('nhanvien@gmail.com', '$2b$10$pYvi5iguAjkpj7MXXnnSEeacT1Pi4LV/Sl.zAM9aXLidzHjkZUBBq', 'Nguyen Van Staff', '0772051290', 'staff');

-- Insert Technician Users (password: 230305)
INSERT INTO users (email, password, full_name, phone, role) VALUES 
('kythuatvien@gmail.com', '$2b$10$pYvi5iguAjkpj7MXXnnSEeacT1Pi4LV/Sl.zAM9aXLidzHjkZUBBq', 'Le Van Tech', '0772051292', 'technician');
