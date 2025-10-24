USE ev_service_center;
UPDATE users SET password = 'admin' WHERE email = 'admin@gmail.com';
SELECT * FROM users WHERE email = 'admin@gmail.com';
