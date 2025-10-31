-- Sample Data cho EV Service Center
USE ev_service_center;

-- 1. Thêm users
INSERT INTO users (email, password_hash, role, full_name, phone, is_active) VALUES
('customer1@example.com', '$2a$10$example1', 'customer', 'Nguyễn Văn A', '0123456789', TRUE),
('customer2@example.com', '$2a$10$example2', 'customer', 'Trần Thị B', '0987654321', TRUE),
('staff1@example.com', '$2a$10$example3', 'staff', 'Lê Văn C', '0369852147', TRUE),
('technician1@example.com', '$2a$10$example4', 'technician', 'Phạm Thị D', '0741852963', TRUE),
('admin1@example.com', '$2a$10$example5', 'admin', 'Hoàng Văn E', '0258741963', TRUE);

-- 2. Thêm customers
INSERT INTO customers (user_id, address) VALUES
(1, '123 Đường ABC, Quận 1, TP.HCM'),
(2, '456 Đường XYZ, Quận 2, TP.HCM');

-- 3. Thêm staffs
INSERT INTO staffs (user_id, position, hire_date) VALUES
(3, 'receptionist', '2023-01-15'),
(4, 'technician', '2023-02-01'),
(5, 'admin', '2023-01-01');

-- 4. Thêm vehicles
INSERT INTO vehicles (customer_id, vin, brand, model, year, battery_capacity_kwh, odometer_km, last_service_date, last_service_km, next_service_due_km, next_service_due_date) VALUES
(1, 'VIN123456789', 'Tesla', 'Model Y', 2023, 75.00, 15000.00, '2024-01-15', 10000.00, 20000.00, '2024-07-15'),
(1, 'VIN987654321', 'VinFast', 'VF8', 2023, 89.00, 8000.00, '2024-02-10', 5000.00, 15000.00, '2024-08-10'),
(2, 'VIN555666777', 'BYD', 'Dolphin', 2023, 44.50, 12000.00, '2024-01-20', 8000.00, 18000.00, '2024-07-20');

-- 5. Thêm services
INSERT INTO services (name, description, estimated_duration_minutes, base_price, type, is_package, validity_days) VALUES
('Bảo dưỡng định kỳ', 'Kiểm tra tổng thể xe điện định kỳ', 120, 500000.00, 'MAINTENANCE', FALSE, NULL),
('Thay lọc gió cabin', 'Thay lọc gió cabin cho xe điện', 30, 150000.00, 'REPAIR', FALSE, NULL),
('Kiểm tra hệ thống sạc', 'Kiểm tra và bảo dưỡng hệ thống sạc', 90, 300000.00, 'INSPECTION', FALSE, NULL),
('Gói bảo dưỡng 6 tháng', 'Gói bảo dưỡng toàn diện 6 tháng', 180, 1200000.00, 'PACKAGE', TRUE, 180);

-- 6. Thêm parts
INSERT INTO parts (part_code, name, description, category, unit_price, manufacturer, stock_quantity, min_stock_level, is_active) VALUES
('FILTER001', 'Lọc gió cabin', 'Lọc gió cabin cho xe điện', 'Filter', 150000.00, 'Bosch', 50, 10, TRUE),
('BRAKE002', 'Phanh đĩa', 'Phanh đĩa cho xe điện', 'Brake', 800000.00, 'Brembo', 20, 5, TRUE),
('BATTERY003', 'Pin lithium', 'Pin lithium cho xe điện', 'Battery', 5000000.00, 'CATL', 10, 3, TRUE),
('TIRE004', 'Lốp xe điện', 'Lốp chuyên dụng cho xe điện', 'Tire', 2000000.00, 'Michelin', 30, 8, TRUE);

-- 7. Thêm appointments
INSERT INTO appointments (customer_id, vehicle_id, service_id, requested_date_time, status, notes) VALUES
(1, 1, 1, '2025-10-26 09:00:00', 'PENDING', 'Khách hàng yêu cầu bảo dưỡng định kỳ'),
(1, 2, 4, '2025-10-27 14:00:00', 'CONFIRMED', 'Đã xác nhận gói bảo dưỡng 6 tháng'),
(2, 3, 2, '2025-10-28 10:30:00', 'PENDING', 'Cần thay lọc gió cabin'),
(1, 1, 3, '2025-10-29 16:00:00', 'CONFIRMED', 'Kiểm tra hệ thống sạc');

-- 8. Thêm service_orders
INSERT INTO service_orders (appointment_id, vehicle_id, assigned_technician_id, status, check_in_time, total_amount, payment_status, created_at) VALUES
(2, 2, 4, 'IN_PROGRESS', '2025-10-27 14:00:00', 1200000.00, 'PENDING', '2025-10-27 14:00:00'),
(4, 1, 4, 'QUEUED', NULL, 300000.00, 'PENDING', '2025-10-25 15:00:00');

-- 9. Thêm order_items
INSERT INTO order_items (order_id, service_id, part_id, quantity, unit_price, total_price, type) VALUES
(1, 4, NULL, 1, 1200000.00, 1200000.00, 'SERVICE'),
(2, 3, NULL, 1, 300000.00, 300000.00, 'SERVICE'),
(2, NULL, 1, 1, 150000.00, 150000.00, 'PART');

-- 10. Thêm service_checklists
INSERT INTO service_checklists (order_id, item_name, is_completed, notes, completed_by, completed_at) VALUES
(1, 'Kiểm tra hệ thống pin', TRUE, 'Pin hoạt động bình thường', 4, '2025-10-27 14:30:00'),
(1, 'Kiểm tra hệ thống sạc', FALSE, NULL, NULL, NULL),
(1, 'Kiểm tra lốp xe', TRUE, 'Lốp còn tốt, áp suất đúng', 4, '2025-10-27 14:45:00'),
(2, 'Kiểm tra hệ thống sạc', FALSE, NULL, NULL, NULL),
(2, 'Thay lọc gió cabin', FALSE, NULL, NULL, NULL);

-- 11. Thêm part_inventories
INSERT INTO part_inventories (part_id, quantity_in_stock, min_stock_level) VALUES
(1, 50, 10),
(2, 20, 5),
(3, 10, 3),
(4, 30, 8);

-- 12. Thêm notifications
INSERT INTO notifications (user_id, title, message, type, related_id, is_read) VALUES
(1, 'Lịch hẹn đã được xác nhận', 'Lịch hẹn bảo dưỡng ngày 27/10/2025 đã được xác nhận', 'appointment_status', 2, FALSE),
(1, 'Nhắc nhở bảo dưỡng', 'Xe của bạn sắp đến hạn bảo dưỡng định kỳ', 'maintenance_reminder', 1, FALSE),
(2, 'Lịch hẹn chờ xác nhận', 'Lịch hẹn thay lọc gió cabin đang chờ xác nhận', 'appointment_status', 3, FALSE);

-- 13. Thêm chat_messages
INSERT INTO chat_messages (customer_id, staff_id, content, sent_at, is_read, sender_role) VALUES
(1, 3, 'Xin chào, tôi muốn đặt lịch bảo dưỡng xe', '2025-10-25 09:00:00', TRUE, 'customer'),
(1, 3, 'Chào bạn, chúng tôi có thể hỗ trợ bạn đặt lịch. Bạn muốn đặt lịch vào thời gian nào?', '2025-10-25 09:05:00', TRUE, 'staff'),
(2, 3, 'Xe tôi có tiếng kêu lạ khi phanh, có cần kiểm tra không?', '2025-10-25 10:30:00', FALSE, 'customer');

-- 14. Thêm payments
INSERT INTO payments (order_id, amount, payment_method, transaction_id, status, paid_at) VALUES
(1, 1200000.00, 'bank_transfer', 'TXN001', 'success', '2025-10-27 14:30:00'),
(2, 0.00, 'cash', NULL, 'pending', NULL);
