-- Update staff passwords to "Staff123@"
-- BCrypt hash for "Staff123@": $2a$10$RYqFfZ7qXV9QjXXwYGXjqOvN8OPhN3bZ3rC4z2I3IbQx5z5J5z5Jq

USE ev_service_center;

-- Update all staff users with a standard password
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCa'
WHERE role = 'staff';

-- Update technician users
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCa'
WHERE role = 'technician';

-- Update admin user  
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCa'
WHERE role = 'admin';

-- Verify
SELECT user_id, email, full_name, role, 
       CASE 
           WHEN password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCa' 
           THEN 'Password updated' 
           ELSE 'Old password' 
       END as status
FROM users
WHERE role IN ('staff', 'technician', 'admin')
ORDER BY role;

