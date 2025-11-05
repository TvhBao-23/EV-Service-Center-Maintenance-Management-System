-- Service Parts Mapping System
-- Maps services to relevant part categories for smart filtering

USE ev_service_center;

-- Add category field to services table if not exists
-- Check if column exists first, then add
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_schema = 'ev_service_center' 
    AND table_name = 'services' 
    AND column_name = 'category');

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE services ADD COLUMN category VARCHAR(50) DEFAULT ''maintenance''', 
    'SELECT ''Column already exists'' AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing services with proper categories and real service names
-- Cannot use TRUNCATE due to foreign key constraints
DELETE FROM services;

INSERT INTO services (service_id, name, description, estimated_duration_minutes, base_price, category) VALUES
(1, 'Bảo dưỡng định kỳ', 'Kiểm tra tổng thể hệ thống điện, pin và các bộ phận chính', 120, 500000, 'maintenance'),
(2, 'Thay pin lithium-ion', 'Thay thế pin lithium-ion cao cấp cho xe điện', 480, 15000000, 'battery'),
(3, 'Sửa chữa hệ thống sạc', 'Kiểm tra và sửa chữa hệ thống sạc nhanh DC', 180, 2500000, 'charging'),
(4, 'Thay motor điện', 'Thay thế motor điện cao cấp cho xe điện', 360, 8000000, 'motor'),
(5, 'Kiểm tra BMS', 'Kiểm tra và cập nhật hệ thống quản lý pin (Battery Management System)', 90, 1200000, 'electronic'),
(6, 'Thay inverter', 'Thay thế bộ chuyển đổi điện DC/AC cao cấp', 240, 3500000, 'electronic'),
(7, 'Bảo dưỡng hệ thống làm mát', 'Kiểm tra và bảo dưỡng hệ thống làm mát pin và motor', 150, 800000, 'cooling'),
(8, 'Cập nhật phần mềm', 'Cập nhật phần mềm hệ thống và tối ưu hiệu suất', 60, 300000, 'electronic');

-- Create mapping table between service categories and part categories
CREATE TABLE IF NOT EXISTS service_part_categories (
    mapping_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_category VARCHAR(50) NOT NULL COMMENT 'Service category từ services.category',
    part_category VARCHAR(100) NOT NULL COMMENT 'Part category từ parts.category',
    priority INT DEFAULT 1 COMMENT 'Độ ưu tiên hiển thị (1=cao nhất)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_mapping (service_category, part_category)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert mappings cho từng loại dịch vụ
-- Bảo dưỡng định kỳ: Cần tất cả các loại phụ tùng thường xuyên
INSERT INTO service_part_categories (service_category, part_category, priority) VALUES
('maintenance', 'filter', 1),
('maintenance', 'accessory', 2),
('maintenance', 'fluid', 3),
('maintenance', 'brake', 4),
('maintenance', 'tire', 5),
('maintenance', 'electronic', 6);

-- Thay pin lithium-ion: Chỉ cần các loại pin
INSERT INTO service_part_categories (service_category, part_category, priority) VALUES
('battery', 'battery', 1);

-- Sửa chữa hệ thống sạc: Chỉ cần parts liên quan đến charging
INSERT INTO service_part_categories (service_category, part_category, priority) VALUES
('charging', 'charging', 1),
('charging', 'electronic', 2);

-- Thay motor điện: Chỉ cần motor và inverter
INSERT INTO service_part_categories (service_category, part_category, priority) VALUES
('motor', 'motor', 1),
('motor', 'electronic', 2);

-- Kiểm tra BMS & Thay inverter: Electronic parts
INSERT INTO service_part_categories (service_category, part_category, priority) VALUES
('electronic', 'electronic', 1),
('electronic', 'battery', 2);

-- Bảo dưỡng hệ thống làm mát: Cooling parts
INSERT INTO service_part_categories (service_category, part_category, priority) VALUES
('cooling', 'cooling', 1),
('cooling', 'fluid', 2);

-- Create index for faster lookups
CREATE INDEX idx_service_category ON service_part_categories(service_category);
CREATE INDEX idx_part_category ON service_part_categories(part_category);

-- Verification query
SELECT 
    s.name AS service_name,
    s.category AS service_category,
    GROUP_CONCAT(DISTINCT spc.part_category ORDER BY spc.priority) AS relevant_part_categories
FROM services s
LEFT JOIN service_part_categories spc ON s.category = spc.service_category
GROUP BY s.service_id, s.name, s.category
ORDER BY s.service_id;

