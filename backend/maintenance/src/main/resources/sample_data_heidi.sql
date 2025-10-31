-- Sample Data cho EV Service Center - Tương thích với schema hiện tại
USE ev_service_center;

-- Xóa dữ liệu cũ nếu có (thứ tự ngược với foreign keys)
DELETE FROM order_items;
DELETE FROM service_checklists;
DELETE FROM service_orders;
DELETE FROM appointments;
DELETE FROM vehicles;

-- Thêm vehicles
INSERT INTO vehicles (vehicle_id, customer_id, vin, brand, model, year, battery_capacity_kwh, odometer_km, last_service_date, last_service_km, next_service_due_km, next_service_due_date) VALUES
(1, 2, 'VIN123456789', 'Tesla', 'Model Y', 2023, 75.00, 15000.00, '2024-01-15', 10000.00, 20000.00, '2024-07-15'),
(2, 2, 'VIN987654321', 'VinFast', 'VF8', 2023, 89.00, 8000.00, '2024-02-10', 5000.00, 15000.00, '2024-08-10'),
(3, 3, 'VIN555666777', 'BYD', 'Dolphin', 2023, 44.50, 12000.00, '2024-01-20', 8000.00, 18000.00, '2024-07-20'),
(4, 3, 'VIN111222333', 'Tesla', 'Model 3', 2022, 75.00, 25000.00, '2024-03-05', 20000.00, 30000.00, '2024-09-05'),
(5, 4, 'VIN444555666', 'VinFast', 'VF9', 2024, 92.00, 3000.00, NULL, 0.00, 10000.00, '2024-12-01'),
(6, 4, 'VIN777888999', 'BYD', 'Seal', 2024, 82.50, 5000.00, '2024-04-01', 2000.00, 12000.00, '2024-10-01');

-- Set vehicle IDs
SET @vehicle1 = 1;
SET @vehicle2 = 2;
SET @vehicle3 = 3;
SET @vehicle4 = 4;
SET @vehicle5 = 5;
SET @vehicle6 = 6;

-- Xóa services cũ
DELETE FROM services WHERE service_id BETWEEN 1 AND 8;

-- Thêm services
INSERT INTO services (service_id, name, description, estimated_duration_minutes, base_price, type, is_package, validity_days) VALUES
(1, 'Bảo dưỡng định kỳ', 'Kiểm tra tổng thể xe điện định kỳ', 120, 500000.00, 'maintenance', FALSE, NULL),
(2, 'Thay lọc gió cabin', 'Thay lọc gió cabin cho xe điện', 30, 150000.00, 'repair', FALSE, NULL),
(3, 'Kiểm tra hệ thống sạc', 'Kiểm tra và bảo dưỡng hệ thống sạc', 90, 300000.00, 'inspection', FALSE, NULL),
(4, 'Sửa chữa động cơ', 'Sửa chữa và bảo dưỡng động cơ điện', 240, 2000000.00, 'repair', FALSE, NULL),
(5, 'Thay pin', 'Thay thế pin lithium-ion', 180, 5000000.00, 'repair', FALSE, NULL),
(6, 'Gói bảo dưỡng 6 tháng', 'Gói bảo dưỡng toàn diện 6 tháng', 180, 1200000.00, 'package', TRUE, 180),
(7, 'Kiểm tra hệ thống phanh', 'Kiểm tra và bảo dưỡng hệ thống phanh', 60, 400000.00, 'inspection', FALSE, NULL),
(8, 'Thay lốp', 'Thay lốp chuyên dụng cho xe điện', 45, 2000000.00, 'repair', FALSE, NULL);

-- Set service IDs
SET @service1 = 1;
SET @service2 = 2;
SET @service3 = 3;
SET @service4 = 4;
SET @service5 = 5;
SET @service6 = 6;
SET @service7 = 7;
SET @service8 = 8;

-- Xóa parts cũ
DELETE FROM parts WHERE part_id BETWEEN 1 AND 8;

-- Thêm parts
INSERT INTO parts (part_id, part_code, name, description, category, unit_price, manufacturer) VALUES
(1, 'FILTER001', 'Lọc gió cabin', 'Lọc gió cabin cho xe điện', 'Filter', 150000.00, 'Bosch'),
(2, 'BRAKE002', 'Phanh đĩa', 'Phanh đĩa cho xe điện', 'Brake', 800000.00, 'Brembo'),
(3, 'BATTERY003', 'Pin lithium', 'Pin lithium cho xe điện', 'Battery', 5000000.00, 'CATL'),
(4, 'TIRE004', 'Lốp xe điện', 'Lốp chuyên dụng cho xe điện', 'Tire', 2000000.00, 'Michelin'),
(5, 'CHARGER005', 'Bộ sạc', 'Bộ sạc nhanh 50kW', 'Charger', 15000000.00, 'ABB'),
(6, 'MOTOR006', 'Động cơ điện', 'Động cơ điện cho xe điện', 'Motor', 8000000.00, 'Tesla'),
(7, 'FILTER007', 'Lọc gió động cơ', 'Lọc gió động cơ điện', 'Filter', 200000.00, 'Mann'),
(8, 'BRAKE008', 'Phanh tang', 'Phanh tang cho xe điện', 'Brake', 600000.00, 'Continental');

-- Set part IDs
SET @part1 = 1;
SET @part2 = 2;
SET @part3 = 3;
SET @part4 = 4;
SET @part5 = 5;
SET @part6 = 6;
SET @part7 = 7;
SET @part8 = 8;

-- Xóa appointments cũ
DELETE FROM appointments WHERE appointment_id BETWEEN 1 AND 6;

-- Thêm appointments
INSERT INTO appointments (appointment_id, customer_id, vehicle_id, service_id, requested_date_time, status, notes) VALUES
(1, 2, @vehicle1, @service1, '2025-10-26 09:00:00', 'pending', 'Khách hàng yêu cầu bảo dưỡng định kỳ'),
(2, 2, @vehicle2, @service6, '2025-10-27 14:00:00', 'confirmed', 'Đã xác nhận gói bảo dưỡng 6 tháng'),
(3, 3, @vehicle3, @service2, '2025-10-28 10:30:00', 'pending', 'Cần thay lọc gió cabin'),
(4, 3, @vehicle4, @service3, '2025-10-29 16:00:00', 'confirmed', 'Kiểm tra hệ thống sạc'),
(5, 4, @vehicle5, @service4, '2025-10-30 08:00:00', 'pending', 'Sửa chữa động cơ'),
(6, 4, @vehicle6, @service5, '2025-11-01 11:00:00', 'confirmed', 'Thay pin lithium');

-- Set appointment IDs
SET @appointment1 = 1;
SET @appointment2 = 2;
SET @appointment3 = 3;
SET @appointment4 = 4;
SET @appointment5 = 5;
SET @appointment6 = 6;

-- Xóa dữ liệu cũ (đã xóa ở đầu script, không cần xóa lại)

-- Thêm service_orders
INSERT INTO service_orders (appointment_id, vehicle_id, assigned_technician_id, status, check_in_time, total_amount, payment_status, created_at) VALUES
(@appointment2, @vehicle2, 3, 'in_progress', '2025-10-27 14:00:00', 1200000.00, 'unpaid', '2025-10-27 14:00:00'),
(@appointment4, @vehicle4, 4, 'queued', NULL, 300000.00, 'unpaid', '2025-10-25 15:00:00'),
(@appointment6, @vehicle6, 3, 'completed', '2025-11-01 11:00:00', 5000000.00, 'paid', '2025-11-01 11:00:00'),
(@appointment1, @vehicle1, 4, 'in_progress', '2025-10-26 09:00:00', 500000.00, 'unpaid', '2025-10-26 09:00:00');

-- Set order IDs (lấy từ auto increment)
SET @order1 = 1;
SET @order2 = 2;
SET @order3 = 3;
SET @order4 = 4;

-- Thêm order_items
INSERT INTO order_items (order_id, service_id, part_id, quantity, unit_price, total_price, type) VALUES
(@order1, @service6, NULL, 1, 1200000.00, 1200000.00, 'service'),
(@order2, @service3, NULL, 1, 300000.00, 300000.00, 'service'),
(@order3, @service5, NULL, 1, 5000000.00, 5000000.00, 'service'),
(@order3, NULL, @part3, 1, 5000000.00, 5000000.00, 'part'),
(@order4, @service1, NULL, 1, 500000.00, 500000.00, 'service');

-- Thêm service_checklists
INSERT INTO service_checklists (order_id, item_name, is_completed, notes, completed_by, completed_at) VALUES
(@order1, 'Kiểm tra hệ thống pin', TRUE, 'Pin hoạt động bình thường', 3, '2025-10-27 14:30:00'),
(@order1, 'Kiểm tra hệ thống sạc', FALSE, NULL, NULL, NULL),
(@order1, 'Kiểm tra lốp xe', TRUE, 'Lốp còn tốt, áp suất đúng', 3, '2025-10-27 14:45:00'),
(@order2, 'Kiểm tra hệ thống sạc', FALSE, NULL, NULL, NULL),
(@order3, 'Tháo pin cũ', TRUE, 'Đã tháo pin cũ thành công', 3, '2025-11-01 11:30:00'),
(@order3, 'Lắp pin mới', TRUE, 'Đã lắp pin mới', 3, '2025-11-01 12:00:00'),
(@order4, 'Kiểm tra tổng thể', FALSE, NULL, NULL, NULL);

-- Xóa part_inventories cũ
DELETE FROM part_inventories WHERE part_id BETWEEN 1 AND 8;

-- Thêm part_inventories
INSERT INTO part_inventories (part_id, quantity_in_stock, min_stock_level) VALUES
(@part1, 50, 10),
(@part2, 20, 5),
(@part3, 10, 3),
(@part4, 30, 8),
(@part5, 5, 2),
(@part6, 8, 3),
(@part7, 25, 6),
(@part8, 15, 4);

SELECT 'Sample data imported successfully!' as message;
