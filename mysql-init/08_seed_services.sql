USE ev_service_center;

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

INSERT INTO services (name, description, estimated_duration_minutes, base_price, category)
SELECT 'Bao duong dinh ky', 'Kiem tra tong the he thong dien, pin va cac bo phan chinh', 120, 500000, 'maintenance'
WHERE NOT EXISTS (
    SELECT 1 FROM services WHERE name = 'Bao duong dinh ky'
);

INSERT INTO services (name, description, estimated_duration_minutes, base_price, category)
SELECT 'Thay pin lithium-ion', 'Thay the pin lithium-ion cho xe dien', 480, 15000000, 'battery'
WHERE NOT EXISTS (
    SELECT 1 FROM services WHERE name = 'Thay pin lithium-ion'
);

INSERT INTO services (name, description, estimated_duration_minutes, base_price, category)
SELECT 'Sua chua he thong sac', 'Kiem tra va sua chua he thong sac nhanh DC', 180, 2500000, 'charging'
WHERE NOT EXISTS (
    SELECT 1 FROM services WHERE name = 'Sua chua he thong sac'
);

INSERT INTO services (name, description, estimated_duration_minutes, base_price, category)
SELECT 'Thay motor dien', 'Thay the motor dien cho xe dien', 360, 8000000, 'motor'
WHERE NOT EXISTS (
    SELECT 1 FROM services WHERE name = 'Thay motor dien'
);

INSERT INTO services (name, description, estimated_duration_minutes, base_price, category)
SELECT 'Kiem tra BMS', 'Kiem tra va cap nhat he thong quan ly pin', 90, 1200000, 'electronic'
WHERE NOT EXISTS (
    SELECT 1 FROM services WHERE name = 'Kiem tra BMS'
);

INSERT INTO services (name, description, estimated_duration_minutes, base_price, category)
SELECT 'Bao duong he thong lam mat', 'Kiem tra va bao duong he thong lam mat pin va motor', 150, 800000, 'cooling'
WHERE NOT EXISTS (
    SELECT 1 FROM services WHERE name = 'Bao duong he thong lam mat'
);
