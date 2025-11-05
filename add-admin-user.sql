-- Add admin@evsc.com user
USE ev_service_center;

INSERT INTO users (email, password, full_name, phone, role) 
VALUES (
  'admin@evsc.com', 
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCa', 
  'Admin Hoai Bao', 
  '0772051289', 
  'admin'
) ON DUPLICATE KEY UPDATE 
  full_name = VALUES(full_name),
  phone = VALUES(phone);

-- Verify
SELECT user_id, email, full_name, phone, role 
FROM users 
WHERE email = 'admin@evsc.com';

