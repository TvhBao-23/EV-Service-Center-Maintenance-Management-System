-- Add more battery services to match available parts
-- This script is idempotent; you can run it multiple times safely.

USE ev_service_center;

-- Set charset to UTF-8
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Check if services already exist before inserting
-- Service: Thay pin Lithium-Ion 60kWh
SET @service_exists_60 := (
    SELECT COUNT(*) FROM services 
    WHERE name = 'Thay pin Lithium-Ion 60kWh' 
    AND category = 'battery'
);

SET @sql_60 := IF(
    @service_exists_60 = 0,
    'INSERT INTO services (name, description, estimated_duration_minutes, base_price, category) VALUES 
    (''Thay pin Lithium-Ion 60kWh'', ''Thay thế pin Lithium-Ion dung lượng 60kWh cho xe điện'', 480, 15000000, ''battery'')',
    'SELECT ''Service Thay pin Lithium-Ion 60kWh already exists'' AS message'
);

PREPARE stmt FROM @sql_60;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Service: Thay pin Lithium-Ion 75kWh
SET @service_exists_75 := (
    SELECT COUNT(*) FROM services 
    WHERE name = 'Thay pin Lithium-Ion 75kWh' 
    AND category = 'battery'
);

SET @sql_75 := IF(
    @service_exists_75 = 0,
    'INSERT INTO services (name, description, estimated_duration_minutes, base_price, category) VALUES 
    (''Thay pin Lithium-Ion 75kWh'', ''Thay thế pin Lithium-Ion dung lượng 75kWh cho xe điện'', 480, 18000000, ''battery'')',
    'SELECT ''Service Thay pin Lithium-Ion 75kWh already exists'' AS message'
);

PREPARE stmt FROM @sql_75;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Service: Thay cell pin
SET @service_exists_cell := (
    SELECT COUNT(*) FROM services 
    WHERE name = 'Thay cell pin' 
    AND category = 'battery'
);

SET @sql_cell := IF(
    @service_exists_cell = 0,
    'INSERT INTO services (name, description, estimated_duration_minutes, base_price, category) VALUES 
    (''Thay cell pin'', ''Thay thế cell pin riêng lẻ cho pin xe điện'', 240, 500000, ''battery'')',
    'SELECT ''Service Thay cell pin already exists'' AS message'
);

PREPARE stmt FROM @sql_cell;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Service: Thay hệ thống quản lý pin BMS
SET @service_exists_bms := (
    SELECT COUNT(*) FROM services 
    WHERE name = 'Thay hệ thống quản lý pin BMS' 
    AND category = 'battery'
);

SET @sql_bms := IF(
    @service_exists_bms = 0,
    'INSERT INTO services (name, description, estimated_duration_minutes, base_price, category) VALUES 
    (''Thay hệ thống quản lý pin BMS'', ''Thay thế hệ thống quản lý pin BMS (Battery Management System)'', 180, 8000000, ''battery'')',
    'SELECT ''Service Thay hệ thống quản lý pin BMS already exists'' AS message'
);

PREPARE stmt FROM @sql_bms;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Service: Thay cảm biến nhiệt độ pin
SET @service_exists_sensor := (
    SELECT COUNT(*) FROM services 
    WHERE name = 'Thay cảm biến nhiệt độ pin' 
    AND category = 'battery'
);

SET @sql_sensor := IF(
    @service_exists_sensor = 0,
    'INSERT INTO services (name, description, estimated_duration_minutes, base_price, category) VALUES 
    (''Thay cảm biến nhiệt độ pin'', ''Thay thế cảm biến nhiệt độ pin cho hệ thống quản lý pin'', 90, 500000, ''battery'')',
    'SELECT ''Service Thay cảm biến nhiệt độ pin already exists'' AS message'
);

PREPARE stmt FROM @sql_sensor;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✅ Battery services added successfully' AS message;
