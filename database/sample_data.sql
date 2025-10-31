-- Sample Data cho EV Service Center
USE ev_service_center;

-- Dumping data for table ev_service_center.users: ~10 rows (approximately)
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `role`, `full_name`, `phone`, `created_at`, `updated_at`, `is_active`) VALUES
	(1, 'customer1@example.com', '$2a$10$example1', 'customer', 'Nguyễn Văn A', '0123456789', '2025-10-25 22:20:11', '2025-10-25 22:20:11', 1),
	(2, 'customer2@example.com', '$2a$10$example2', 'customer', 'Trần Thị B', '0987654321', '2025-10-25 22:20:11', '2025-10-25 22:20:11', 1),
	(3, 'customer3@example.com', '$2a$10$example3', 'customer', 'Lê Văn C', '0369852147', '2025-10-25 22:20:11', '2025-10-25 22:20:11', 1),
	(4, 'staff1@example.com', '$2a$10$example4', 'staff', 'Phạm Thị D', '0741852963', '2025-10-25 22:20:11', '2025-10-25 22:20:11', 1),
	(5, 'staff2@example.com', '$2a$10$example5', 'staff', 'Hoàng Văn E', '0258741963', '2025-10-25 22:20:11', '2025-10-25 22:20:11', 1),
	(6, 'technician1@example.com', '$2a$10$example6', 'technician', 'Vũ Thị F', '0147258369', '2025-10-25 22:20:11', '2025-10-25 22:20:11', 1),
	(7, 'technician2@example.com', '$2a$10$example7', 'technician', 'Đặng Văn G', '0527419630', '2025-10-25 22:20:11', '2025-10-25 22:20:11', 1),
	(8, 'admin@example.com', '$2a$10$example8', 'admin', 'Bùi Thị H', '0963852741', '2025-10-25 22:20:11', '2025-10-25 22:20:11', 1),
	(9, 'staff@test.com', 'staff123', 'staff', 'Nguyễn Văn Staff', '0901234567', '2025-10-27 09:37:00', '2025-10-27 09:37:00', 1),
	(10, 'technician@test.com', 'tech123', 'technician', 'Lê Văn Technician', '0912345678', '2025-10-27 09:37:00', '2025-10-27 09:37:00', 1);

-- Dumping data for table ev_service_center.customers: ~3 rows (approximately)
INSERT INTO `customers` (`customer_id`, `user_id`, `address`) VALUES
	(2, 1, '123 Đường ABC, Quận 1, TP.HCM'),
	(3, 2, '456 Đường XYZ, Quận 2, TP.HCM'),
	(4, 3, '789 Đường DEF, Quận 3, TP.HCM');

-- Dumping data for table ev_service_center.staffs: ~7 rows (approximately)
INSERT INTO `staffs` (`staff_id`, `user_id`, `position`, `hire_date`) VALUES
	(1, 4, 'receptionist', '2023-01-15'),
	(2, 5, 'receptionist', '2023-03-01'),
	(3, 6, 'technician', '2023-02-01'),
	(4, 7, 'technician', '2023-04-01'),
	(5, 8, 'admin', '2023-01-01'),
	(6, 9, 'receptionist', '2025-10-27'),
	(7, 10, 'technician', '2025-10-27');

-- Dumping data for table ev_service_center.vehicles: ~6 rows (approximately)
INSERT INTO `vehicles` (`vehicle_id`, `customer_id`, `vin`, `brand`, `model`, `year`, `battery_capacity_kwh`, `odometer_km`, `last_service_date`, `last_service_km`, `next_service_due_km`, `next_service_due_date`) VALUES
	(1, 2, 'VIN123456789', 'Tesla', 'Model Y', 2023, 75.00, 15000.00, '2024-01-15', 10000.00, 20000.00, '2024-07-15'),
	(2, 2, 'VIN987654321', 'VinFast', 'VF8', 2023, 89.00, 8000.00, '2024-02-10', 5000.00, 15000.00, '2024-08-10'),
	(3, 3, 'VIN555666777', 'BYD', 'Dolphin', 2023, 44.50, 12000.00, '2024-01-20', 8000.00, 18000.00, '2024-07-20'),
	(4, 3, 'VIN111222333', 'Tesla', 'Model 3', 2022, 75.00, 25000.00, '2024-03-05', 20000.00, 30000.00, '2024-09-05'),
	(5, 4, 'VIN444555666', 'VinFast', 'VF9', 2024, 92.00, 3000.00, NULL, 0.00, 10000.00, '2024-12-01'),
	(6, 4, 'VIN777888999', 'BYD', 'Seal', 2024, 82.50, 5000.00, '2024-04-01', 2000.00, 12000.00, '2024-10-01');

-- Dumping data for table ev_service_center.services: ~8 rows (approximately)
INSERT INTO `services` (`service_id`, `name`, `description`, `estimated_duration_minutes`, `base_price`, `type`, `is_package`, `validity_days`) VALUES
	(1, 'Bảo dưỡng định kỳ', 'Kiểm tra tổng thể xe điện định kỳ', 120, 500000.00, 'maintenance', 0, NULL),
	(2, 'Thay lọc gió cabin', 'Thay lọc gió cabin cho xe điện', 30, 150000.00, 'repair', 0, NULL),
	(3, 'Kiểm tra hệ thống sạc', 'Kiểm tra và bảo dưỡng hệ thống sạc', 90, 300000.00, 'inspection', 0, NULL),
	(4, 'Sửa chữa động cơ', 'Sửa chữa và bảo dưỡng động cơ điện', 240, 2000000.00, 'repair', 0, NULL),
	(5, 'Thay pin', 'Thay thế pin lithium-ion', 180, 5000000.00, 'repair', 0, NULL),
	(6, 'Gói bảo dưỡng 6 tháng', 'Gói bảo dưỡng toàn diện 6 tháng', 180, 1200000.00, 'package', 1, 180),
	(7, 'Kiểm tra hệ thống phanh', 'Kiểm tra và bảo dưỡng hệ thống phanh', 60, 400000.00, 'inspection', 0, NULL),
	(8, 'Thay lốp', 'Thay lốp chuyên dụng cho xe điện', 45, 2000000.00, 'repair', 0, NULL);

-- Dumping data for table ev_service_center.parts: ~8 rows (approximately)
INSERT INTO `parts` (`part_id`, `part_code`, `name`, `description`, `category`, `unit_price`, `manufacturer`) VALUES
	(1, 'FILTER001', 'Lọc gió cabin', 'Lọc gió cabin cho xe điện', 'Filter', 150000.00, 'Bosch'),
	(2, 'BRAKE002', 'Phanh đĩa', 'Phanh đĩa cho xe điện', 'Brake', 800000.00, 'Brembo'),
	(3, 'BATTERY003', 'Pin lithium', 'Pin lithium cho xe điện', 'Battery', 5000000.00, 'CATL'),
	(4, 'TIRE004', 'Lốp xe điện', 'Lốp chuyên dụng cho xe điện', 'Tire', 2000000.00, 'Michelin'),
	(5, 'CHARGER005', 'Bộ sạc', 'Bộ sạc nhanh 50kW', 'Charger', 15000000.00, 'ABB'),
	(6, 'MOTOR006', 'Động cơ điện', 'Động cơ điện cho xe điện', 'Motor', 8000000.00, 'Tesla'),
	(7, 'FILTER007', 'Lọc gió động cơ', 'Lọc gió động cơ điện', 'Filter', 200000.00, 'Mann'),
	(8, 'BRAKE008', 'Phanh tang', 'Phanh tang cho xe điện', 'Brake', 600000.00, 'Continental');

-- Dumping data for table ev_service_center.part_inventories: ~8 rows (approximately)
INSERT INTO `part_inventories` (`inventory_id`, `part_id`, `quantity_in_stock`, `min_stock_level`) VALUES
	(1, 1, 50, 10),
	(2, 2, 20, 5),
	(3, 3, 10, 3),
	(4, 4, 30, 8),
	(5, 5, 5, 2),
	(6, 6, 8, 3),
	(7, 7, 25, 6),
	(8, 8, 15, 4);

-- Dumping data for table ev_service_center.appointments: ~6 rows (approximately)
INSERT INTO `appointments` (`appointment_id`, `customer_id`, `vehicle_id`, `service_id`, `requested_date_time`, `status`, `notes`, `created_at`) VALUES
	(1, 2, 1, 1, '2025-10-26 09:00:00', 'pending', 'Khách hàng yêu cầu bảo dưỡng định kỳ', '2025-10-27 08:49:27'),
	(2, 2, 2, 6, '2025-10-27 14:00:00', 'confirmed', 'Đã xác nhận gói bảo dưỡng 6 tháng', '2025-10-27 08:49:27'),
	(3, 3, 3, 2, '2025-10-28 10:30:00', 'pending', 'Cần thay lọc gió cabin', '2025-10-27 08:49:27'),
	(4, 3, 4, 3, '2025-10-29 16:00:00', 'confirmed', 'Kiểm tra hệ thống sạc', '2025-10-27 08:49:27'),
	(5, 4, 5, 4, '2025-10-30 08:00:00', 'pending', 'Sửa chữa động cơ', '2025-10-27 08:49:27'),
	(6, 4, 6, 5, '2025-11-01 11:00:00', 'confirmed', 'Thay pin lithium', '2025-10-27 08:49:27');

-- Dumping data for table ev_service_center.service_orders: ~4 rows (approximately)
INSERT INTO `service_orders` (`order_id`, `appointment_id`, `vehicle_id`, `assigned_technician_id`, `status`, `check_in_time`, `check_out_time`, `total_amount`, `payment_status`, `created_at`, `completed_at`) VALUES
	(1, 2, 2, 3, 'in_progress', '2025-10-27 14:00:00', NULL, 1200000.00, 'unpaid', '2025-10-27 14:00:00', NULL),
	(2, 4, 4, 4, 'queued', NULL, NULL, 300000.00, 'unpaid', '2025-10-25 15:00:00', NULL),
	(3, 6, 6, 3, 'completed', '2025-11-01 11:00:00', NULL, 5000000.00, 'paid', '2025-11-01 11:00:00', NULL),
	(4, 1, 1, 4, 'in_progress', '2025-10-26 09:00:00', NULL, 500000.00, 'unpaid', '2025-10-26 09:00:00', NULL);

-- Dumping data for table ev_service_center.service_checklists: ~7 rows (approximately)
INSERT INTO `service_checklists` (`checklist_id`, `order_id`, `item_name`, `is_completed`, `notes`, `completed_by`, `completed_at`, `created_at`) VALUES
	(1, 1, 'Kiểm tra hệ thống pin', 1, 'Pin hoạt động bình thường', 3, '2025-10-27 14:30:00', NOW()),
	(2, 1, 'Kiểm tra hệ thống sạc', 0, NULL, NULL, NULL, NOW()),
	(3, 1, 'Kiểm tra lốp xe', 1, 'Lốp còn tốt, áp suất đúng', 3, '2025-10-27 14:45:00', NOW()),
	(4, 2, 'Kiểm tra hệ thống sạc', 0, NULL, NULL, NULL, NOW()),
	(5, 3, 'Tháo pin cũ', 1, 'Đã tháo pin cũ thành công', 3, '2025-11-01 11:30:00', NOW()),
	(6, 3, 'Lắp pin mới', 1, 'Đã lắp pin mới', 3, '2025-11-01 12:00:00', NOW()),
	(7, 4, 'Kiểm tra tổng thể', 0, NULL, NULL, NULL, NOW());

-- Dumping data for table ev_service_center.order_items: ~5 rows (approximately)
INSERT INTO `order_items` (`item_id`, `order_id`, `service_id`, `part_id`, `quantity`, `unit_price`, `total_price`, `type`) VALUES
	(6, 1, 6, NULL, 1, 1200000.00, 1200000.00, 'service'),
	(7, 2, 3, NULL, 1, 300000.00, 300000.00, 'service'),
	(8, 3, 5, NULL, 1, 5000000.00, 5000000.00, 'service'),
	(9, 3, NULL, 3, 1, 5000000.00, 5000000.00, 'part'),
	(10, 4, 1, NULL, 1, 500000.00, 500000.00, 'service');
