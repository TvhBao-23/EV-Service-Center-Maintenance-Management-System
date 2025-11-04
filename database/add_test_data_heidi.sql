-- =====================================================
-- Test Data for HeidiSQL (XAMPP MySQL - Port 3306)
-- =====================================================
-- Chạy file này trong HeidiSQL sau khi đã chạy schema.sql
-- Database: ev_service_center

USE ev_service_center;

-- =====================================================
-- 1. AUTHENTICATION: Staff & Technician Accounts
-- =====================================================

-- Staff Account (user_id = 1)
-- Email: staff@evservice.com | Password: password123
INSERT INTO users (user_id, email, password_hash, role, full_name, phone, is_active)
VALUES (
    1,
    'staff@evservice.com',
    '$2a$10$yDJaTHs3y4sGOx5zuPYrte6wZbVlr0aOXlsM8NA6vD/Ehlffhr2Eu',
    'staff',
    'Nguyễn Văn Staff',
    '0901234567',
    TRUE
)
ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    full_name = VALUES(full_name),
    phone = VALUES(phone),
    is_active = VALUES(is_active);

INSERT INTO staffs (user_id, position, hire_date)
VALUES (1, 'receptionist', CURDATE())
ON DUPLICATE KEY UPDATE
    position = VALUES(position),
    hire_date = VALUES(hire_date);

-- Technician Account (user_id = 2)
-- Email: technician@evservice.com | Password: password123
INSERT INTO users (user_id, email, password_hash, role, full_name, phone, is_active)
VALUES (
    2,
    'technician@evservice.com',
    '$2a$10$ZFv.wus37Gu2fiR8XR6DTufGTN8utaf2SmjgIcWvpHCyQIxcdoRxW',
    'technician',
    'Trần Văn Technician',
    '0907654321',
    TRUE
)
ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    full_name = VALUES(full_name),
    phone = VALUES(phone),
    is_active = VALUES(is_active);

INSERT INTO staffs (user_id, position, hire_date)
VALUES (2, 'technician', CURDATE())
ON DUPLICATE KEY UPDATE
    position = VALUES(position),
    hire_date = VALUES(hire_date);

-- =====================================================
-- 2. CUSTOMERS & VEHICLES
-- =====================================================

-- Customers
INSERT INTO users (user_id, email, password_hash, role, full_name, phone, is_active)
VALUES 
    (3, 'customer@test.com', '$2a$10$yDJaTHs3y4sGOx5zuPYrte6wZbVlr0aOXlsM8NA6vD/Ehlffhr2Eu', 'customer', 'Nguyễn Văn Khách', '0987654321', TRUE),
    (4, 'customer2@test.com', '$2a$10$yDJaTHs3y4sGOx5zuPYrte6wZbVlr0aOXlsM8NA6vD/Ehlffhr2Eu', 'customer', 'Trần Thị Khách 2', '0987654322', TRUE),
    (5, 'customer3@test.com', '$2a$10$yDJaTHs3y4sGOx5zuPYrte6wZbVlr0aOXlsM8NA6vD/Ehlffhr2Eu', 'customer', 'Lê Văn Khách 3', '0987654323', TRUE),
    (6, 'customer4@test.com', '$2a$10$yDJaTHs3y4sGOx5zuPYrte6wZbVlr0aOXlsM8NA6vD/Ehlffhr2Eu', 'customer', 'Phạm Thị Khách 4', '0987654324', TRUE)
ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    full_name = VALUES(full_name),
    phone = VALUES(phone),
    is_active = VALUES(is_active);

INSERT INTO customers (user_id, address)
VALUES 
    (3, '123 Đường Test, Phường Test, Quận Test, TP.HCM'),
    (4, '456 Đường Test 2, Phường Test, Quận Test, TP.HCM'),
    (5, '789 Đường Test 3, Phường Test, Quận Test, TP.HCM'),
    (6, '321 Đường Test 4, Phường Test, Quận Test, TP.HCM')
ON DUPLICATE KEY UPDATE address = VALUES(address);

-- Vehicles
INSERT INTO vehicles (vehicle_id, customer_id, vin, brand, model, year, battery_capacity_kwh, odometer_km)
VALUES 
    (1, (SELECT customer_id FROM customers WHERE user_id = 3), 'VIN12345678901234', 'Tesla', 'Model 3', 2023, 75.0, 15000),
    (2, (SELECT customer_id FROM customers WHERE user_id = 4), 'VIN22345678901234', 'VinFast', 'VF e34', 2022, 42.0, 25000),
    (3, (SELECT customer_id FROM customers WHERE user_id = 5), 'VIN32345678901234', 'Porsche', 'Taycan', 2023, 93.4, 5000),
    (4, (SELECT customer_id FROM customers WHERE user_id = 6), 'VIN42345678901234', 'BMW', 'iX3', 2023, 74.0, 8000),
    (5, (SELECT customer_id FROM customers WHERE user_id = 3), 'VIN52345678901234', 'BYD', 'Atto 3', 2023, 60.48, 12000),
    (6, (SELECT customer_id FROM customers WHERE user_id = 4), 'VIN62345678901234', 'Kia', 'EV6', 2022, 77.4, 18000)
ON DUPLICATE KEY UPDATE
    brand = VALUES(brand),
    model = VALUES(model);

-- =====================================================
-- 3. SERVICES
-- =====================================================

INSERT INTO services (service_id, name, description, estimated_duration_minutes, base_price, type, is_package)
VALUES 
    (1, 'Bảo dưỡng định kỳ', 'Kiểm tra tổng quát xe điện', 60, 500000, 'maintenance', FALSE),
    (2, 'Thay pin', 'Thay thế pin xe điện', 120, 15000000, 'repair', FALSE),
    (3, 'Kiểm tra an toàn', 'Kiểm tra hệ thống an toàn', 45, 300000, 'inspection', FALSE),
    (4, 'Gói bảo dưỡng cơ bản', 'Gói bảo dưỡng cơ bản 6 tháng', 90, 2000000, 'package', TRUE),
    (5, 'Thay lốp', 'Thay thế lốp xe điện', 30, 800000, 'repair', FALSE),
    (6, 'Kiểm tra hệ thống sạc', 'Kiểm tra và bảo dưỡng hệ thống sạc', 45, 400000, 'maintenance', FALSE),
    (7, 'Vệ sinh và làm sạch', 'Vệ sinh toàn bộ xe', 60, 300000, 'maintenance', FALSE),
    (8, 'Gói bảo dưỡng nâng cao', 'Gói bảo dưỡng nâng cao 12 tháng', 120, 5000000, 'package', TRUE)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    base_price = VALUES(base_price);

-- =====================================================
-- 4. PARTS
-- =====================================================

INSERT INTO parts (part_id, part_code, name, description, category, unit_price, manufacturer)
VALUES 
    (1, 'P001', 'Bộ phanh trước', 'Phanh đĩa cho xe điện', 'Brake', 2500000, 'Brembo'),
    (2, 'P002', 'Lốp xe', 'Lốp chuyên dụng xe điện', 'Tire', 3000000, 'Michelin'),
    (3, 'P003', 'Bộ đèn LED', 'Đèn LED chiếu sáng', 'Lighting', 1500000, 'Osram'),
    (4, 'P004', 'Bộ lọc không khí', 'Lọc không khí cho xe điện', 'Filter', 500000, 'Bosch'),
    (5, 'P005', 'Dầu phanh', 'Dầu phanh chuyên dụng', 'Fluid', 200000, 'Castrol'),
    (6, 'P006', 'Má phanh sau', 'Má phanh sau cho xe điện', 'Brake', 1500000, 'Brembo'),
    (7, 'P007', 'Cảm biến áp suất lốp', 'Cảm biến TPMS', 'Sensor', 800000, 'Continental'),
    (8, 'P008', 'Kính chắn gió', 'Kính chắn gió chống nắng', 'Body', 5000000, 'AGC')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    unit_price = VALUES(unit_price);

-- =====================================================
-- 5. APPOINTMENTS
-- =====================================================

INSERT INTO appointments (appointment_id, customer_id, vehicle_id, service_id, requested_date_time, status, notes)
VALUES 
    -- Pending appointments
    (1, (SELECT customer_id FROM customers WHERE user_id = 3), 1, 1, DATE_ADD(NOW(), INTERVAL 2 DAY), 'pending', 'Khách hàng yêu cầu kiểm tra sớm'),
    (2, (SELECT customer_id FROM customers WHERE user_id = 4), 2, 5, DATE_ADD(NOW(), INTERVAL 1 DAY), 'pending', 'Cần thay lốp gấp'),
    (3, (SELECT customer_id FROM customers WHERE user_id = 5), 3, 6, DATE_ADD(NOW(), INTERVAL 3 DAY), 'pending', 'Kiểm tra hệ thống sạc'),
    (4, (SELECT customer_id FROM customers WHERE user_id = 6), 4, 7, DATE_ADD(NOW(), INTERVAL 5 DAY), 'pending', 'Vệ sinh xe'),
    
    -- Confirmed appointments
    (5, (SELECT customer_id FROM customers WHERE user_id = 3), 5, 1, DATE_ADD(NOW(), INTERVAL 2 DAY), 'confirmed', 'Bảo dưỡng định kỳ'),
    (6, (SELECT customer_id FROM customers WHERE user_id = 4), 6, 3, DATE_ADD(NOW(), INTERVAL 4 DAY), 'confirmed', 'Kiểm tra an toàn'),
    (7, (SELECT customer_id FROM customers WHERE user_id = 5), 3, 8, DATE_ADD(NOW(), INTERVAL 6 DAY), 'confirmed', 'Gói bảo dưỡng nâng cao'),
    
    -- Additional appointments for orders without appointment_id
    (8, (SELECT customer_id FROM vehicles WHERE vehicle_id = 2), 2, 5, DATE_SUB(NOW(), INTERVAL 4 DAY), 'confirmed', 'Thay lốp'),
    (9, (SELECT customer_id FROM vehicles WHERE vehicle_id = 3), 3, 6, DATE_SUB(NOW(), INTERVAL 5 DAY), 'confirmed', 'Kiểm tra hệ thống sạc'),
    (10, (SELECT customer_id FROM vehicles WHERE vehicle_id = 4), 4, 7, DATE_SUB(NOW(), INTERVAL 6 DAY), 'confirmed', 'Vệ sinh xe'),
    (11, (SELECT customer_id FROM vehicles WHERE vehicle_id = 1), 1, 1, DATE_SUB(NOW(), INTERVAL 7 DAY), 'completed', 'Bảo dưỡng định kỳ'),
    (12, (SELECT customer_id FROM vehicles WHERE vehicle_id = 2), 2, 2, DATE_SUB(NOW(), INTERVAL 8 DAY), 'completed', 'Thay pin')
ON DUPLICATE KEY UPDATE
    requested_date_time = VALUES(requested_date_time),
    status = VALUES(status),
    notes = VALUES(notes);

-- =====================================================
-- 6. SERVICE ORDERS
-- =====================================================

INSERT INTO service_orders (order_id, appointment_id, vehicle_id, assigned_technician_id, status, 
                           total_amount, payment_status, check_in_time, created_at)
VALUES 
    -- Order 1: In Progress with technician
    (1, 1, 1, (SELECT staff_id FROM staffs WHERE user_id = 2), 'in_progress', 2000000, 'unpaid', NOW(), DATE_SUB(NOW(), INTERVAL 1 DAY)),
    
    -- Orders 2, 3: Queued (no technician)
    (2, 5, 5, NULL, 'queued', 500000, 'unpaid', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
    (3, 6, 6, NULL, 'queued', 300000, 'unpaid', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
    
    -- Orders 4, 5, 6: In Progress (with and without technician)
    (4, 8, 2, (SELECT staff_id FROM staffs WHERE user_id = 2), 'in_progress', 800000, 'unpaid', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 1 DAY)),
    (5, 9, 3, (SELECT staff_id FROM staffs WHERE user_id = 2), 'in_progress', 400000, 'unpaid', DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 2 DAY)),
    (6, 10, 4, NULL, 'in_progress', 300000, 'unpaid', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
    
    -- Orders 7, 8: Completed
    (7, 11, 1, (SELECT staff_id FROM staffs WHERE user_id = 2), 'completed', 7500000, 'paid', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
    (8, 12, 2, (SELECT staff_id FROM staffs WHERE user_id = 2), 'completed', 3500000, 'paid', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY))
ON DUPLICATE KEY UPDATE
    status = VALUES(status),
    total_amount = VALUES(total_amount),
    assigned_technician_id = VALUES(assigned_technician_id);

-- =====================================================
-- 7. ORDER ITEMS
-- =====================================================

INSERT INTO order_items (item_id, order_id, service_id, part_id, quantity, unit_price, total_price, type)
VALUES 
    -- Order 1 items
    (1, 1, 1, NULL, 1, 500000, 500000, 'service'),
    (2, 1, NULL, 1, 2, 2500000, 5000000, 'part'),
    
    -- Order 2 items
    (3, 2, 1, NULL, 1, 500000, 500000, 'service'),
    
    -- Order 3 items
    (4, 3, 3, NULL, 1, 300000, 300000, 'service'),
    
    -- Order 4 items
    (5, 4, 5, NULL, 1, 800000, 800000, 'service'),
    
    -- Order 5 items
    (6, 5, 6, NULL, 1, 400000, 400000, 'service'),
    
    -- Order 6 items
    (7, 6, 7, NULL, 1, 300000, 300000, 'service'),
    
    -- Order 7 items (completed)
    (8, 7, 1, NULL, 1, 500000, 500000, 'service'),
    (9, 7, NULL, 2, 2, 3000000, 6000000, 'part'),
    (10, 7, NULL, 3, 1, 1500000, 1500000, 'part'),
    
    -- Order 8 items (completed)
    (11, 8, 2, NULL, 1, 15000000, 15000000, 'service'),
    (12, 8, NULL, 4, 2, 500000, 1000000, 'part'),
    (13, 8, NULL, 5, 1, 200000, 200000, 'part')
ON DUPLICATE KEY UPDATE
    quantity = VALUES(quantity),
    unit_price = VALUES(unit_price),
    total_price = VALUES(total_price);

-- =====================================================
-- 8. SERVICE CHECKLISTS
-- =====================================================

INSERT INTO service_checklists (checklist_id, order_id, item_name, is_completed, notes)
VALUES 
    -- Checklists for order 1
    (1, 1, 'Kiểm tra hệ thống điện', FALSE, NULL),
    (2, 1, 'Kiểm tra phanh', FALSE, NULL),
    (3, 1, 'Kiểm tra lốp xe', TRUE, NULL),
    (4, 1, 'Kiểm tra pin', FALSE, NULL),
    
    -- Checklists for order 2
    (5, 2, 'Kiểm tra hệ thống điện', FALSE, NULL),
    (6, 2, 'Kiểm tra phanh', FALSE, NULL),
    
    -- Checklists for order 4 (in progress)
    (7, 4, 'Kiểm tra lốp xe', TRUE, 'Lốp cần thay ngay'),
    (8, 4, 'Kiểm tra áp suất lốp', TRUE, 'Áp suất đạt chuẩn'),
    (9, 4, 'Kiểm tra mòn lốp', FALSE, NULL),
    
    -- Checklists for order 5 (in progress)
    (10, 5, 'Kiểm tra hệ thống sạc', FALSE, NULL),
    (11, 5, 'Kiểm tra pin', TRUE, 'Pin hoạt động tốt'),
    (12, 5, 'Kiểm tra dây cáp sạc', FALSE, NULL),
    
    -- Checklists for order 7 (completed)
    (13, 7, 'Kiểm tra hệ thống điện', TRUE, 'Hoàn thành'),
    (14, 7, 'Kiểm tra phanh', TRUE, 'Hoàn thành'),
    (15, 7, 'Kiểm tra lốp xe', TRUE, 'Hoàn thành'),
    (16, 7, 'Thay lốp', TRUE, 'Đã thay lốp mới'),
    
    -- Checklists for order 8 (completed)
    (17, 8, 'Kiểm tra pin', TRUE, 'Hoàn thành'),
    (18, 8, 'Thay pin', TRUE, 'Đã thay pin mới'),
    (19, 8, 'Kiểm tra hệ thống điện', TRUE, 'Hoàn thành')
ON DUPLICATE KEY UPDATE
    item_name = VALUES(item_name),
    is_completed = VALUES(is_completed),
    notes = VALUES(notes);

-- =====================================================
-- SUMMARY REPORT
-- =====================================================

SELECT '=== DATA SUMMARY ===' as Report;
SELECT 'Users' as TableName, COUNT(*) as RecordCount FROM users
UNION ALL SELECT 'Customers', COUNT(*) FROM customers
UNION ALL SELECT 'Vehicles', COUNT(*) FROM vehicles
UNION ALL SELECT 'Services', COUNT(*) FROM services
UNION ALL SELECT 'Parts', COUNT(*) FROM parts
UNION ALL SELECT 'Appointments', COUNT(*) FROM appointments
UNION ALL SELECT 'Service Orders', COUNT(*) FROM service_orders
UNION ALL SELECT 'Order Items', COUNT(*) FROM order_items
UNION ALL SELECT 'Service Checklists', COUNT(*) FROM service_checklists;

SELECT '=== STATUS SUMMARY ===' as Report;
SELECT 'Appointments - Pending' as Status, COUNT(*) as Count FROM appointments WHERE status = 'pending'
UNION ALL SELECT 'Appointments - Confirmed', COUNT(*) FROM appointments WHERE status = 'confirmed'
UNION ALL SELECT 'Service Orders - Queued', COUNT(*) FROM service_orders WHERE status = 'queued'
UNION ALL SELECT 'Service Orders - In Progress', COUNT(*) FROM service_orders WHERE status = 'in_progress'
UNION ALL SELECT 'Service Orders - Completed', COUNT(*) FROM service_orders WHERE status = 'completed';

