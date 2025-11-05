USE ev_service_center;

-- Reset admin password to 230305
-- BCrypt hash with strength 10
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCa'
WHERE email = 'admin@evsc.com';

-- Verify
SELECT email, role, password FROM users WHERE email = 'admin@evsc.com';

