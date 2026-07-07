-- Add Messages table for Chat functionality
USE ev_service_center;

-- Messages table (tin nhắn giữa staff/admin và customer)
CREATE TABLE IF NOT EXISTS messages (
    message_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    recipient_id BIGINT NOT NULL,
    subject VARCHAR(255),
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    parent_message_id BIGINT NULL,  -- For threading/replies
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_message_id) REFERENCES messages(message_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create indexes only if they don't exist
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = 'ev_service_center' AND table_name = 'messages' AND index_name = 'idx_messages_sender_id');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_messages_sender_id ON messages(sender_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = 'ev_service_center' AND table_name = 'messages' AND index_name = 'idx_messages_recipient_id');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_messages_recipient_id ON messages(recipient_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = 'ev_service_center' AND table_name = 'messages' AND index_name = 'idx_messages_is_read');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_messages_is_read ON messages(is_read)', 'SELECT ''Index exists''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = 'ev_service_center' AND table_name = 'messages' AND index_name = 'idx_messages_created_at');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_messages_created_at ON messages(created_at)', 'SELECT ''Index exists''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = 'ev_service_center' AND table_name = 'messages' AND index_name = 'idx_messages_parent_id');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_messages_parent_id ON messages(parent_message_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Chat Conversations table (cuộc hội thoại)
CREATE TABLE IF NOT EXISTS chat_conversations (
    conversation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    staff_id BIGINT NOT NULL,
    subject VARCHAR(255),
    status ENUM('active', 'closed', 'archived') NOT NULL DEFAULT 'active',
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES users(user_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create indexes only if they don't exist
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = 'ev_service_center' AND table_name = 'chat_conversations' AND index_name = 'idx_chat_conversations_customer_id');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_chat_conversations_customer_id ON chat_conversations(customer_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = 'ev_service_center' AND table_name = 'chat_conversations' AND index_name = 'idx_chat_conversations_staff_id');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_chat_conversations_staff_id ON chat_conversations(staff_id)', 'SELECT ''Index exists''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = 'ev_service_center' AND table_name = 'chat_conversations' AND index_name = 'idx_chat_conversations_status');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_chat_conversations_status ON chat_conversations(status)', 'SELECT ''Index exists''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = 'ev_service_center' AND table_name = 'chat_conversations' AND index_name = 'idx_chat_conversations_last_message_at');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_chat_conversations_last_message_at ON chat_conversations(last_message_at)', 'SELECT ''Index exists''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

