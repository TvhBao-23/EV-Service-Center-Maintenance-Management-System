USE ev_service_center;

-- === Users ===
INSERT INTO users (email, password_hash, role, full_name, phone)
VALUES
    ('admin@example.com', '123456', 'admin', 'Admin EV', '0901111111'),
    ('tech@example.com', '123456', 'technician', 'KTV Nam', '0902222222');

-- === Parts ===
INSERT INTO parts (part_code, name, description, category, unit_price, manufacturer)
VALUES
    ('BAT001', 'Ắc quy VinFast VF5', 'Ắc quy chuẩn cho xe VF5', 'Ắc quy', 15000000, 'VinFast'),
    ('MOT002', 'Động cơ EV Motor', 'Motor 120kW', 'Động cơ', 55000000, 'Bosch'),
    ('BRA003', 'Phanh điện tái sinh', 'Hệ thống phanh regen', 'Phanh', 7000000, 'Continental');

-- === Inventory ===
INSERT INTO part_inventories (part_id, quantity_in_stock, min_stock_level)
VALUES
    (1, 20, 5),
    (2, 10, 3),
    (3, 8, 2);

-- === Technician tạo yêu cầu xuất kho ===
INSERT INTO part_requests (order_id, created_by_staff_id, status, reason)
VALUES (NULL, 2, 'PENDING', 'Thay motor xe VF5 lỗi');

-- === Chi tiết yêu cầu ===
INSERT INTO part_request_items (request_id, part_id, quantity_requested)
VALUES (1, 2, 1);

-- === Giao dịch nhập kho mẫu ===
INSERT INTO part_transactions (part_id, type, quantity, performed_by)
VALUES
    (1, 'IMPORT', 20, 'admin'),
    (2, 'IMPORT', 10, 'admin'),
    (3, 'IMPORT', 8, 'admin');
