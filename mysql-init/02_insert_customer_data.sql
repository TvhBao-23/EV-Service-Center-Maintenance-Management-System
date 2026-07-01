-- Insert Sample Customer Data
-- File này chạy sau init.sql để thêm dữ liệu khách hàng mẫu
-- Thiết kế hoàn toàn động, hỗ trợ chạy lại nhiều lần (idempotent)

USE ev_service_center;

-- Dọn dẹp dữ liệu cũ để tránh trùng lặp hoặc lỗi khóa ngoại
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM part_requests WHERE customer_id IN (SELECT customer_id FROM customers WHERE user_id IN (SELECT user_id FROM users WHERE role = 'customer'));
DELETE FROM payments WHERE customer_id IN (SELECT customer_id FROM customers WHERE user_id IN (SELECT user_id FROM users WHERE role = 'customer'));
DELETE FROM appointments WHERE customer_id IN (SELECT customer_id FROM customers WHERE user_id IN (SELECT user_id FROM users WHERE role = 'customer'));
DELETE FROM vehicles WHERE customer_id IN (SELECT customer_id FROM customers WHERE user_id IN (SELECT user_id FROM users WHERE role = 'customer'));
DELETE FROM customers WHERE user_id IN (SELECT user_id FROM users WHERE role = 'customer');
DELETE FROM users WHERE role = 'customer';
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert sample customer users (password: 230305 - BCrypt encoded)
INSERT INTO users (email, password, full_name, phone, role) VALUES
('customer1@gmail.com', '$2b$10$pYvi5iguAjkpj7MXXnnSEeacT1Pi4LV/Sl.zAM9aXLidzHjkZUBBq', 'Nguyễn Văn An', '0901234567', 'customer'),
('customer2@gmail.com', '$2b$10$pYvi5iguAjkpj7MXXnnSEeacT1Pi4LV/Sl.zAM9aXLidzHjkZUBBq', 'Trần Thị Bình', '0902345678', 'customer'),
('customer3@gmail.com', '$2b$10$pYvi5iguAjkpj7MXXnnSEeacT1Pi4LV/Sl.zAM9aXLidzHjkZUBBq', 'Lê Hoàng Cường', '0903456789', 'customer'),
('customer4@gmail.com', '$2b$10$pYvi5iguAjkpj7MXXnnSEeacT1Pi4LV/Sl.zAM9aXLidzHjkZUBBq', 'Phạm Thị Dung', '0904567890', 'customer'),
('customer5@gmail.com', '$2b$10$pYvi5iguAjkpj7MXXnnSEeacT1Pi4LV/Sl.zAM9aXLidzHjkZUBBq', 'Hoàng Văn Em', '0905678901', 'customer');

-- 2. Insert customer profiles dynamically
INSERT INTO customers (user_id, address) VALUES
((SELECT user_id FROM users WHERE email = 'customer1@gmail.com'), '123 Lê Lợi, Quận 1, TP.HCM'),
((SELECT user_id FROM users WHERE email = 'customer2@gmail.com'), '456 Trần Hưng Đạo, Quận 5, TP.HCM'),
((SELECT user_id FROM users WHERE email = 'customer3@gmail.com'), '789 Nguyễn Trãi, Quận 1, TP.HCM'),
((SELECT user_id FROM users WHERE email = 'customer4@gmail.com'), '321 Võ Văn Tần, Quận 3, TP.HCM'),
((SELECT user_id FROM users WHERE email = 'customer5@gmail.com'), '654 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM');

-- 3. Insert sample vehicles dynamically using customer_id
INSERT INTO vehicles (customer_id, vin, brand, model, year, battery_capacity_kwh, odometer_km, last_service_date, last_service_km) VALUES
((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer1@gmail.com')), 'VF8ABC1234567890A', 'VinFast', 'VF8', 2023, 87.70, 5000, '2024-10-15', 3000),
((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer1@gmail.com')), 'TESLA3XYZ9876543B', 'Tesla', 'Model 3', 2022, 75.00, 12000, '2024-09-20', 10000),
((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer2@gmail.com')), 'NISSAN123456789LC', 'Nissan', 'Leaf', 2021, 62.00, 25000, '2024-08-10', 23000),
((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer3@gmail.com')), 'VF9DEF4567890123D', 'VinFast', 'VF9', 2024, 123.00, 2000, '2024-11-01', 1500),
((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer4@gmail.com')), 'HYUND567890123I5E', 'Hyundai', 'Ioniq 5', 2023, 72.60, 8000, '2024-10-05', 7000),
((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer5@gmail.com')), 'TESLAYMNO1234567F', 'Tesla', 'Model Y', 2023, 75.00, 6000, '2024-10-20', 5000);

-- 4. Insert sample appointments dynamically
INSERT INTO appointments (customer_id, vehicle_id, service_id, center_id, requested_date_time, status, notes) VALUES
-- Pending appointments
((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer1@gmail.com')), 
 (SELECT vehicle_id FROM vehicles WHERE vin = 'VF8ABC1234567890A'), 2, 1, '2025-11-10 09:00:00', 'pending', 'Xe có tiếng kêu lạ ở bánh trước'),

((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer2@gmail.com')), 
 (SELECT vehicle_id FROM vehicles WHERE vin = 'NISSAN123456789LC'), 1, 2, '2025-11-12 14:00:00', 'pending', 'Bảo dưỡng định kỳ'),

((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer3@gmail.com')), 
 (SELECT vehicle_id FROM vehicles WHERE vin = 'VF9DEF4567890123D'), 3, 1, '2025-11-15 10:00:00', 'pending', 'Kiểm tra toàn bộ hệ thống'),

-- Confirmed appointments
((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer4@gmail.com')), 
 (SELECT vehicle_id FROM vehicles WHERE vin = 'HYUND567890123I5E'), 2, 3, '2025-11-08 08:30:00', 'confirmed', 'Cần thay má phanh'),

((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer5@gmail.com')), 
 (SELECT vehicle_id FROM vehicles WHERE vin = 'TESLAYMNO1234567F'), 1, 1, '2025-11-09 15:00:00', 'confirmed', 'Kiểm tra pin'),

-- Completed appointments
((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer1@gmail.com')), 
 (SELECT vehicle_id FROM vehicles WHERE vin = 'TESLA3XYZ9876543B'), 1, 1, '2024-10-15 09:00:00', 'completed', 'Bảo dưỡng định kỳ hoàn tất'),

((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer2@gmail.com')), 
 (SELECT vehicle_id FROM vehicles WHERE vin = 'NISSAN123456789LC'), 2, 2, '2024-09-20 14:00:00', 'completed', 'Thay má phanh và kiểm tra tổng thể'),

((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer3@gmail.com')), 
 (SELECT vehicle_id FROM vehicles WHERE vin = 'VF9DEF4567890123D'), 1, 1, '2024-11-01 10:00:00', 'completed', 'Xe mới - kiểm tra đầu tiên'),

-- Cancelled appointments
((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer4@gmail.com')), 
 (SELECT vehicle_id FROM vehicles WHERE vin = 'HYUND567890123I5E'), 1, 2, '2024-10-25 11:00:00', 'cancelled', 'Khách hủy do bận việc đột xuất');

-- 5. Insert sample payments for completed appointments dynamically
INSERT INTO payments (appointment_id, customer_id, amount, payment_method, status, transaction_id, payment_date, verified, notes) VALUES
((SELECT appointment_id FROM appointments WHERE customer_id = (SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer1@gmail.com')) AND requested_date_time = '2024-10-15 09:00:00'), 
 (SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer1@gmail.com')), 
 100000.00, 'card', 'completed', 'PAY001-20241015-001', '2024-10-15 11:30:00', TRUE, 'Thanh toán bằng thẻ visa'),

((SELECT appointment_id FROM appointments WHERE customer_id = (SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer2@gmail.com')) AND requested_date_time = '2024-09-20 14:00:00'), 
 (SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer2@gmail.com')), 
 500000.00, 'bank_transfer', 'completed', 'PAY002-20240920-002', '2024-09-20 16:45:00', TRUE, 'Chuyển khoản ngân hàng'),

((SELECT appointment_id FROM appointments WHERE customer_id = (SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer3@gmail.com')) AND requested_date_time = '2024-11-01 10:00:00'), 
 (SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer3@gmail.com')), 
 100000.00, 'e_wallet', 'completed', 'PAY003-20241101-003', '2024-11-01 12:20:00', TRUE, 'Thanh toán qua MoMo');

-- 6. Insert sample part requests dynamically using part_code to avoid hardcoded part_id issues
INSERT INTO part_requests (customer_id, part_id, vehicle_id, quantity, request_type, status, notes, delivery_method, delivery_address) VALUES
((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer1@gmail.com')), 
 (SELECT part_id FROM parts WHERE part_code = 'BRK-PAD-002'), 
 (SELECT vehicle_id FROM vehicles WHERE vin = 'VF8ABC1234567890A'), 
 1, 'purchase', 'pending', 'Cần thay má phanh trước', 'delivery', '123 Lê Lợi, Quận 1, TP.HCM'),

((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer2@gmail.com')), 
 (SELECT part_id FROM parts WHERE part_code = 'WIPER-001'), 
 (SELECT vehicle_id FROM vehicles WHERE vin = 'NISSAN123456789LC'), 
 1, 'quote', 'pending', 'Xin báo giá lọc gió cabin', 'pickup', NULL),

((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer3@gmail.com')), 
 (SELECT part_id FROM parts WHERE part_code = 'TIRE-002'), 
 (SELECT vehicle_id FROM vehicles WHERE vin = 'VF9DEF4567890123D'), 
 4, 'purchase', 'approved', 'Cần 4 lốp mới', 'delivery', '789 Nguyễn Trãi, Quận 1, TP.HCM'),

((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer1@gmail.com')), 
 (SELECT part_id FROM parts WHERE part_code = 'WIPER-001'), 
 (SELECT vehicle_id FROM vehicles WHERE vin = 'VF8ABC1234567890A'), 
 2, 'purchase', 'fulfilled', 'Lọc gió cabin đã nhận', 'pickup', NULL),

((SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer4@gmail.com')), 
 (SELECT part_id FROM parts WHERE part_code = 'FLUID-001'), 
 (SELECT vehicle_id FROM vehicles WHERE vin = 'HYUND567890123I5E'), 
 2, 'purchase', 'fulfilled', 'Cần gạt nước đã lắp', 'pickup', NULL);

-- 7. Update approved part requests with staff info dynamically
UPDATE part_requests 
SET approved_by = (SELECT user_id FROM users WHERE email = 'nhanvien@gmail.com'), approved_at = NOW(), approved_price = 1200000.00, estimated_delivery_date = '2025-11-10'
WHERE customer_id = (SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer3@gmail.com')) AND part_id = (SELECT part_id FROM parts WHERE part_code = 'TIRE-002');

UPDATE part_requests 
SET approved_by = (SELECT user_id FROM users WHERE email = 'nhanvien@gmail.com'), approved_at = '2024-10-14 10:00:00', approved_price = 800000.00
WHERE customer_id = (SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer1@gmail.com')) AND part_id = (SELECT part_id FROM parts WHERE part_code = 'WIPER-001');

UPDATE part_requests 
SET approved_by = (SELECT user_id FROM users WHERE email = 'nhanvien@gmail.com'), approved_at = '2024-10-18 14:30:00', approved_price = 450000.00
WHERE customer_id = (SELECT customer_id FROM customers WHERE user_id = (SELECT user_id FROM users WHERE email = 'customer4@gmail.com')) AND part_id = (SELECT part_id FROM parts WHERE part_code = 'FLUID-001');

SELECT 'Sample customer data inserted successfully!' as message;
