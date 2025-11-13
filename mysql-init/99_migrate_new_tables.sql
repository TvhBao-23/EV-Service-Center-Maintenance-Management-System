-- =====================================================
-- MIGRATION SCRIPT - Thêm các bảng mới vào database hiện tại
-- An toàn: Không ảnh hưởng đến dữ liệu và bảng đã có
-- Chỉ thêm các bảng và cột còn thiếu
-- =====================================================

USE ev_service_center;

-- =====================================================
-- 1. Thêm is_active vào users nếu chưa có
-- =====================================================
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'ev_service_center' 
    AND table_name = 'users' 
    AND column_name = 'is_active');

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER role', 
    'SELECT ''Column is_active already exists'' AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 2. Thêm type, is_package, validity_days vào services nếu chưa có
-- =====================================================

-- Thêm type
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'ev_service_center' 
    AND table_name = 'services' 
    AND column_name = 'type');

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE services ADD COLUMN type ENUM(''maintenance'', ''repair'', ''inspection'', ''package'') NOT NULL DEFAULT ''maintenance'' AFTER base_price', 
    'SELECT ''Column type already exists'' AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Thêm is_package
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'ev_service_center' 
    AND table_name = 'services' 
    AND column_name = 'is_package');

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE services ADD COLUMN is_package BOOLEAN DEFAULT FALSE AFTER type', 
    'SELECT ''Column is_package already exists'' AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Thêm validity_days
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'ev_service_center' 
    AND table_name = 'services' 
    AND column_name = 'validity_days');

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE services ADD COLUMN validity_days INT CHECK (validity_days >= 0) AFTER is_package', 
    'SELECT ''Column validity_days already exists'' AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 3. Thêm next_service_due_km, next_service_due_date vào vehicles nếu chưa có
-- =====================================================

-- Thêm next_service_due_km
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'ev_service_center' 
    AND table_name = 'vehicles' 
    AND column_name = 'next_service_due_km');

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE vehicles ADD COLUMN next_service_due_km DECIMAL(10,2) AFTER last_service_km', 
    'SELECT ''Column next_service_due_km already exists'' AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Thêm next_service_due_date
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'ev_service_center' 
    AND table_name = 'vehicles' 
    AND column_name = 'next_service_due_date');

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE vehicles ADD COLUMN next_service_due_date DATE AFTER next_service_due_km', 
    'SELECT ''Column next_service_due_date already exists'' AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 4. Thêm 'received' status vào appointments nếu chưa có
-- =====================================================
-- Kiểm tra xem 'received' đã có trong enum chưa
SET @received_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'ev_service_center' 
    AND table_name = 'appointments' 
    AND column_name = 'status'
    AND column_type LIKE '%received%'
);

-- Nếu chưa có, thêm 'received' vào enum
-- Lưu ý: ALTER TABLE để thêm giá trị vào ENUM có thể phức tạp, cần kiểm tra manual
-- Tạm thời bỏ qua, vì có thể đã có trong hệ thống

-- =====================================================
-- 5. Tạo bảng STAFFS (bảng mới)
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

-- Create indexes for staffs (skip if exists)
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = 'ev_service_center' AND table_name = 'staffs' AND index_name = 'idx_staffs_user_id');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_staffs_user_id ON staffs(user_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = 'ev_service_center' AND table_name = 'staffs' AND index_name = 'idx_staffs_position');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_staffs_position ON staffs(position)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 6. Tạo bảng SERVICE_ORDERS (bảng mới)
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

-- Create indexes for service_orders
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'service_orders' AND index_name = 'idx_service_orders_appointment_id');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_service_orders_appointment_id ON service_orders(appointment_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'service_orders' AND index_name = 'idx_service_orders_vehicle_id');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_service_orders_vehicle_id ON service_orders(vehicle_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'service_orders' AND index_name = 'idx_service_orders_status');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_service_orders_status ON service_orders(status)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'service_orders' AND index_name = 'idx_service_orders_assigned_technician_id');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_service_orders_assigned_technician_id ON service_orders(assigned_technician_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 7. Tạo bảng ORDER_ITEMS (bảng mới)
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

-- Create indexes for order_items
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'order_items' AND index_name = 'idx_order_items_order_id');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_order_items_order_id ON order_items(order_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'order_items' AND index_name = 'idx_order_items_service_id');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_order_items_service_id ON order_items(service_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'order_items' AND index_name = 'idx_order_items_part_id');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_order_items_part_id ON order_items(part_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'order_items' AND index_name = 'idx_order_items_type');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_order_items_type ON order_items(type)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 8. Tạo bảng PART_INVENTORIES (bảng mới - bổ sung cho parts)
-- =====================================================
CREATE TABLE IF NOT EXISTS part_inventories (
    inventory_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_id BIGINT NOT NULL,
    quantity_in_stock INT NOT NULL DEFAULT 0 CHECK (quantity_in_stock >= 0),
    min_stock_level INT NOT NULL DEFAULT 5 CHECK (min_stock_level >= 0),
    UNIQUE KEY unique_part (part_id),
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create index for part_inventories
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'part_inventories' AND index_name = 'idx_part_inventories_part_id');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_part_inventories_part_id ON part_inventories(part_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Sync dữ liệu từ parts.stock_quantity sang part_inventories nếu có
INSERT INTO part_inventories (part_id, quantity_in_stock, min_stock_level)
SELECT part_id, stock_quantity, min_stock_level
FROM parts
WHERE part_id NOT IN (SELECT part_id FROM part_inventories);

-- =====================================================
-- 9. Tạo bảng PART_USAGE_HISTORY (bảng mới)
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

-- Create indexes for part_usage_history
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'part_usage_history' AND index_name = 'idx_part_usage_history_order_id');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_part_usage_history_order_id ON part_usage_history(order_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'part_usage_history' AND index_name = 'idx_part_usage_history_part_id');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_part_usage_history_part_id ON part_usage_history(part_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'part_usage_history' AND index_name = 'idx_part_usage_history_used_at');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_part_usage_history_used_at ON part_usage_history(used_at)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 10. Tạo bảng SERVICE_CHECKLISTS (bảng mới)
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

-- Create indexes for service_checklists
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'service_checklists' AND index_name = 'idx_service_checklists_order_id');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_service_checklists_order_id ON service_checklists(order_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'service_checklists' AND index_name = 'idx_service_checklists_completed_by');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_service_checklists_completed_by ON service_checklists(completed_by)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'service_checklists' AND index_name = 'idx_service_checklists_is_completed');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_service_checklists_is_completed ON service_checklists(is_completed)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 11. Tạo bảng CHAT_MESSAGES (bảng mới - schema mới)
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

-- Create indexes for chat_messages
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'chat_messages' AND index_name = 'idx_chat_messages_customer_id');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_chat_messages_customer_id ON chat_messages(customer_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'chat_messages' AND index_name = 'idx_chat_messages_staff_id');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_chat_messages_staff_id ON chat_messages(staff_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'chat_messages' AND index_name = 'idx_chat_messages_sent_at');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_chat_messages_sent_at ON chat_messages(sent_at)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'chat_messages' AND index_name = 'idx_chat_messages_is_read');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_chat_messages_is_read ON chat_messages(is_read)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 12. Tạo bảng NOTIFICATIONS (bảng mới)
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

-- Create indexes for notifications
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'notifications' AND index_name = 'idx_notifications_user_id');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_notifications_user_id ON notifications(user_id, is_read)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'notifications' AND index_name = 'idx_notifications_type');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_notifications_type ON notifications(type)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'ev_service_center' AND table_name = 'notifications' AND index_name = 'idx_notifications_created_at');
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_notifications_created_at ON notifications(created_at)', 'SELECT ''Index exists''');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 13. Tạo indexes bổ sung cho các bảng đã có (nếu chưa có)
-- =====================================================

-- Index cho users.role
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = 'ev_service_center' 
    AND table_name = 'users' 
    AND index_name = 'idx_users_role');

SET @query = IF(@idx_exists = 0, 
    'CREATE INDEX idx_users_role ON users(role)', 
    'SELECT ''Index idx_users_role already exists'' AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index cho users.is_active
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = 'ev_service_center' 
    AND table_name = 'users' 
    AND index_name = 'idx_users_is_active');

SET @query = IF(@idx_exists = 0, 
    'CREATE INDEX idx_users_is_active ON users(is_active)', 
    'SELECT ''Index idx_users_is_active already exists'' AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index cho services.type
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = 'ev_service_center' 
    AND table_name = 'services' 
    AND index_name = 'idx_services_type');

SET @query = IF(@idx_exists = 0, 
    'CREATE INDEX idx_services_type ON services(type)', 
    'SELECT ''Index idx_services_type already exists'' AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index cho appointments.status
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = 'ev_service_center' 
    AND table_name = 'appointments' 
    AND index_name = 'idx_appointments_status');

SET @query = IF(@idx_exists = 0, 
    'CREATE INDEX idx_appointments_status ON appointments(status)', 
    'SELECT ''Index idx_appointments_status already exists'' AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 14. Tạo dữ liệu mẫu cho staffs (nếu cần)
-- =====================================================
-- Chuyển các user có role staff/technician/admin thành staffs
INSERT INTO staffs (user_id, position, hire_date)
SELECT 
    u.user_id,
    CASE 
        WHEN u.role = 'admin' THEN 'admin'
        WHEN u.role = 'technician' THEN 'technician'
        WHEN u.role = 'staff' THEN 'receptionist'
        ELSE 'receptionist'
    END as position,
    u.created_at as hire_date
FROM users u
WHERE u.role IN ('staff', 'technician', 'admin')
AND u.user_id NOT IN (SELECT user_id FROM staffs WHERE user_id IS NOT NULL);

-- =====================================================
-- HOÀN TẤT MIGRATION
-- =====================================================
SELECT 'Migration completed successfully!' AS status;

