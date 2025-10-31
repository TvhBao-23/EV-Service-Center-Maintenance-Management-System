-- Sample Data cho EV Service Center
USE ev_service_center;

-- 1. Thêm users
INSERT INTO users (email, password_hash, role, full_name, phone, is_active) VALUES
('customer1@example.com', '$2a$10$example1', 'customer', 'Nguyễn Văn A', '0123456789', TRUE),
('customer2@example.com', '$2a$10$example2', 'customer', 'Trần Thị B', '0987654321', TRUE),
('customer3@example.com', '$2a$10$example3', 'customer', 'Lê Văn C', '0369852147', TRUE),
('staff1@example.com', '$2a$10$example4', 'staff', 'Phạm Thị D', '0741852963', TRUE),
('staff2@example.com', '$2a$10$example5', 'staff', 'Hoàng Văn E', '0258741963', TRUE),
('technician1@example.com', '$2a$10$example6', 'technician', 'Vũ Thị F', '0147258369', TRUE),
('technician2@example.com', '$2a$10$example7', 'technician', 'Đặng Văn G', '0527419630', TRUE),
('admin@example.com', '$2a$10$example8', 'admin', 'Bùi Thị H', '0963852741', TRUE);

-- 2. Thêm customers
INSERT INTO customers (user_id, address) VALUES
(1, '123 Đường ABC, Quận 1, TP.HCM'),
(2, '456 Đường XYZ, Quận 2, TP.HCM'),
(3, '789 Đường DEF, Quận 3, TP.HCM');

-- 3. Thêm staffs
INSERT INTO staffs (user_id, position, hire_date) VALUES
(4, 'receptionist', '2023-01-15'),
(5, 'receptionist', '2023-03-01'),
(6, 'technician', '2023-02-01'),
(7, 'technician', '2023-04-01'),
(8, 'admin', '2023-01-01');

-- 4. Thêm vehicles
INSERT INTO vehicles (customer_id, vin, brand, model, year, battery_capacity_kwh, odometer_km, last_service_date, last_service_km, next_service_due_km, next_service_due_date) VALUES
(1, 'VIN123456789', 'Tesla', 'Model Y', 2023, 75.00, 15000.00, '2024-01-15', 10000.00, 20000.00, '2024-07-15'),
(1, 'VIN987654321', 'VinFast', 'VF8', 2023, 89.00, 8000.00, '2024-02-10', 5000.00, 15000.00, '2024-08-10'),
(2, 'VIN555666777', 'BYD', 'Dolphin', 2023, 44.50, 12000.00, '2024-01-20', 8000.00, 18000.00, '2024-07-20'),
(2, 'VIN111222333', 'Tesla', 'Model 3', 2022, 75.00, 25000.00, '2024-03-05', 20000.00, 30000.00, '2024-09-05'),
(3, 'VIN444555666', 'VinFast', 'VF9', 2024, 92.00, 3000.00, NULL, 0.00, 10000.00, '2024-12-01'),
(3, 'VIN777888999', 'BYD', 'Seal', 2024, 82.50, 5000.00, '2024-04-01', 2000.00, 12000.00, '2024-10-01');

-- 5. Thêm services
INSERT INTO services (name, description, estimated_duration_minutes, base_price, type, is_package, validity_days) VALUES
('Bảo dưỡng định kỳ', 'Kiểm tra tổng thể xe điện định kỳ', 120, 500000.00, 'maintenance', FALSE, NULL),
('Thay lọc gió cabin', 'Thay lọc gió cabin cho xe điện', 30, 150000.00, 'repair', FALSE, NULL),
('Kiểm tra hệ thống sạc', 'Kiểm tra và bảo dưỡng hệ thống sạc', 90, 300000.00, 'inspection', FALSE, NULL),
('Sửa chữa động cơ', 'Sửa chữa và bảo dưỡng động cơ điện', 240, 2000000.00, 'repair', FALSE, NULL),
('Thay pin', 'Thay thế pin lithium-ion', 180, 5000000.00, 'repair', FALSE, NULL),
('Gói bảo dưỡng 6 tháng', 'Gói bảo dưỡng toàn diện 6 tháng', 180, 1200000.00, 'package', TRUE, 180),
('Kiểm tra hệ thống phanh', 'Kiểm tra và bảo dưỡng hệ thống phanh', 60, 400000.00, 'inspection', FALSE, NULL),
('Thay lốp', 'Thay lốp chuyên dụng cho xe điện', 45, 2000000.00, 'repair', FALSE, NULL);

-- 6. Thêm parts
INSERT INTO parts (part_code, name, description, category, unit_price, manufacturer) VALUES
('FILTER001', 'Lọc gió cabin', 'Lọc gió cabin cho xe điện', 'Filter', 150000.00, 'Bosch'),
('BRAKE002', 'Phanh đĩa', 'Phanh đĩa cho xe điện', 'Brake', 800000.00, 'Brembo'),
('BATTERY003', 'Pin lithium', 'Pin lithium cho xe điện', 'Battery', 5000000.00, 'CATL'),
('TIRE004', 'Lốp xe điện', 'Lốp chuyên dụng cho xe điện', 'Tire', 2000000.00, 'Michelin'),
('CHARGER005', 'Bộ sạc', 'Bộ sạc nhanh 50kW', 'Charger', 15000000.00, 'ABB'),
('MOTOR006', 'Động cơ điện', 'Động cơ điện cho xe điện', 'Motor', 8000000.00, 'Tesla'),
('FILTER007', 'Lọc gió động cơ', 'Lọc gió động cơ điện', 'Filter', 200000.00, 'Mann'),
('BRAKE008', 'Phanh tang', 'Phanh tang cho xe điện', 'Brake', 600000.00, 'Continental');

-- 7. Thêm appointments
INSERT INTO appointments (customer_id, vehicle_id, service_id, requested_date_time, status, notes) VALUES
(1, 1, 1, '2025-10-26 09:00:00', 'pending', 'Khách hàng yêu cầu bảo dưỡng định kỳ'),
(1, 2, 6, '2025-10-27 14:00:00', 'confirmed', 'Đã xác nhận gói bảo dưỡng 6 tháng'),
(2, 3, 2, '2025-10-28 10:30:00', 'pending', 'Cần thay lọc gió cabin'),
(2, 4, 3, '2025-10-29 16:00:00', 'confirmed', 'Kiểm tra hệ thống sạc'),
(3, 5, 4, '2025-10-30 08:00:00', 'pending', 'Sửa chữa động cơ'),
(3, 6, 5, '2025-11-01 11:00:00', 'confirmed', 'Thay pin lithium'),
(1, 1, 7, '2025-11-02 13:30:00', 'pending', 'Kiểm tra hệ thống phanh'),
(2, 3, 8, '2025-11-03 15:00:00', 'confirmed', 'Thay lốp xe điện');

-- 8. Thêm service_orders
INSERT INTO service_orders (appointment_id, vehicle_id, assigned_technician_id, status, check_in_time, total_amount, payment_status, created_at) VALUES
(2, 2, 1, 'in_progress', '2025-10-27 14:00:00', 1200000.00, 'unpaid', '2025-10-27 14:00:00'),
(4, 4, 2, 'queued', NULL, 300000.00, 'unpaid', '2025-10-25 15:00:00'),
(6, 6, 1, 'completed', '2025-11-01 11:00:00', 5000000.00, 'paid', '2025-11-01 11:00:00'),
(8, 3, 2, 'in_progress', '2025-11-03 15:00:00', 2000000.00, 'unpaid', '2025-11-03 15:00:00');

-- 9. Thêm order_items
INSERT INTO order_items (order_id, service_id, part_id, quantity, unit_price, total_price, type) VALUES
(1, 6, NULL, 1, 1200000.00, 1200000.00, 'service'),
(2, 3, NULL, 1, 300000.00, 300000.00, 'service'),
(3, 5, NULL, 1, 5000000.00, 5000000.00, 'service'),
(3, NULL, 3, 1, 5000000.00, 5000000.00, 'part'),
(4, 8, NULL, 1, 2000000.00, 2000000.00, 'service'),
(4, NULL, 4, 4, 2000000.00, 8000000.00, 'part');

-- 10. Thêm part_inventories
INSERT INTO part_inventories (part_id, quantity_in_stock, min_stock_level) VALUES
(1, 50, 10),
(2, 20, 5),
(3, 10, 3),
(4, 30, 8),
(5, 5, 2),
(6, 8, 3),
(7, 25, 6),
(8, 15, 4);

-- 11. Thêm part_usage_history
INSERT INTO part_usage_history (order_id, part_id, quantity_used, used_at, vehicle_model) VALUES
(3, 3, 1, '2025-11-01 12:00:00', 'BYD Seal'),
(4, 4, 4, '2025-11-03 16:00:00', 'BYD Dolphin');

-- 12. Thêm service_checklists
INSERT INTO service_checklists (order_id, item_name, is_completed, notes, completed_by, completed_at) VALUES
(1, 'Kiểm tra hệ thống pin', TRUE, 'Pin hoạt động bình thường', 1, '2025-10-27 14:30:00'),
(1, 'Kiểm tra hệ thống sạc', FALSE, NULL, NULL, NULL),
(1, 'Kiểm tra lốp xe', TRUE, 'Lốp còn tốt, áp suất đúng', 1, '2025-10-27 14:45:00'),
(1, 'Thay lọc gió cabin', TRUE, 'Đã thay lọc gió mới', 1, '2025-10-27 15:00:00'),
(2, 'Kiểm tra hệ thống sạc', FALSE, NULL, NULL, NULL),
(3, 'Tháo pin cũ', TRUE, 'Đã tháo pin cũ thành công', 1, '2025-11-01 11:30:00'),
(3, 'Lắp pin mới', TRUE, 'Đã lắp pin mới', 1, '2025-11-01 12:00:00'),
(3, 'Kiểm tra hệ thống', TRUE, 'Hệ thống hoạt động bình thường', 1, '2025-11-01 12:30:00'),
(4, 'Tháo lốp cũ', TRUE, 'Đã tháo 4 lốp cũ', 2, '2025-11-03 15:30:00'),
(4, 'Lắp lốp mới', FALSE, NULL, NULL, NULL);

-- 13. Thêm payments
INSERT INTO payments (order_id, amount, payment_method, transaction_id, status, paid_at) VALUES
(1, 1200000.00, 'bank_transfer', 'TXN001', 'success', '2025-10-27 14:30:00'),
(2, 0.00, 'cash', NULL, 'pending', NULL),
(3, 5000000.00, 'bank_transfer', 'TXN002', 'success', '2025-11-01 12:00:00'),
(4, 0.00, 'cash', NULL, 'pending', NULL);

-- 14. Thêm chat_messages
INSERT INTO chat_messages (customer_id, staff_id, content, sent_at, is_read, sender_role) VALUES
(1, 1, 'Xin chào, tôi muốn đặt lịch bảo dưỡng xe', '2025-10-25 09:00:00', TRUE, 'customer'),
(1, 1, 'Chào bạn, chúng tôi có thể hỗ trợ bạn đặt lịch. Bạn muốn đặt lịch vào thời gian nào?', '2025-10-25 09:05:00', TRUE, 'staff'),
(2, 1, 'Xe tôi có tiếng kêu lạ khi phanh, có cần kiểm tra không?', '2025-10-25 10:30:00', FALSE, 'customer'),
(3, 2, 'Pin xe tôi sạc chậm, có vấn đề gì không?', '2025-10-26 14:00:00', TRUE, 'customer'),
(3, 2, 'Có thể do hệ thống sạc có vấn đề. Bạn nên mang xe đến kiểm tra', '2025-10-26 14:10:00', TRUE, 'staff');

-- 15. Thêm notifications
INSERT INTO notifications (user_id, title, message, type, related_id, is_read) VALUES
(1, 'Lịch hẹn đã được xác nhận', 'Lịch hẹn bảo dưỡng ngày 27/10/2025 đã được xác nhận', 'appointment_status', 2, FALSE),
(1, 'Nhắc nhở bảo dưỡng', 'Xe của bạn sắp đến hạn bảo dưỡng định kỳ', 'maintenance_reminder', 1, FALSE),
(2, 'Lịch hẹn chờ xác nhận', 'Lịch hẹn thay lọc gió cabin đang chờ xác nhận', 'appointment_status', 3, FALSE),
(3, 'Thanh toán thành công', 'Thanh toán cho đơn hàng #3 đã thành công', 'payment_due', 3, TRUE),
(1, 'Cảnh báo tồn kho thấp', 'Lọc gió cabin sắp hết hàng', 'low_stock', 1, FALSE),
(2, 'Lịch hẹn hoàn thành', 'Lịch hẹn kiểm tra hệ thống sạc đã hoàn thành', 'appointment_status', 4, TRUE);
