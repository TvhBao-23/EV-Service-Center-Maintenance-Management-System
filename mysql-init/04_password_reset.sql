-- Password Reset Tokens Table
-- For forgot password functionality

USE ev_service_center;

-- Password Reset Tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    ip_address VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create indexes only if they don't exist
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = 'ev_service_center' AND table_name = 'password_reset_tokens' AND index_name = 'idx_password_reset_tokens_email');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_password_reset_tokens_email ON password_reset_tokens(email)', 'SELECT ''Index exists''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = 'ev_service_center' AND table_name = 'password_reset_tokens' AND index_name = 'idx_password_reset_tokens_token');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token)', 'SELECT ''Index exists''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = 'ev_service_center' AND table_name = 'password_reset_tokens' AND index_name = 'idx_password_reset_tokens_expires_at');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at)', 'SELECT ''Index exists''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = 'ev_service_center' AND table_name = 'password_reset_tokens' AND index_name = 'idx_password_reset_tokens_user_id');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Rate limiting table for password reset requests
CREATE TABLE IF NOT EXISTS password_reset_attempts (
    attempt_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    attempt_count INT DEFAULT 1,
    last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blocked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create indexes only if they don't exist
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = 'ev_service_center' AND table_name = 'password_reset_attempts' AND index_name = 'idx_password_reset_attempts_email');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_password_reset_attempts_email ON password_reset_attempts(email)', 'SELECT ''Index exists''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = 'ev_service_center' AND table_name = 'password_reset_attempts' AND index_name = 'idx_password_reset_attempts_ip');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_password_reset_attempts_ip ON password_reset_attempts(ip_address)', 'SELECT ''Index exists''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = 'ev_service_center' AND table_name = 'password_reset_attempts' AND index_name = 'idx_password_reset_attempts_blocked_until');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_password_reset_attempts_blocked_until ON password_reset_attempts(blocked_until)', 'SELECT ''Index exists''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

