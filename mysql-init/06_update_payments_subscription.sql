-- Patch: Ensure payments table works for subscription payments (Admin > Thanh toán)
-- This script is idempotent; you can run it multiple times safely.

USE ev_service_center;

-- Add subscription_id column if missing
SET @subscription_col_count :=
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'payments'
       AND column_name = 'subscription_id');

SET @subscription_sql := IF(
    @subscription_col_count = 0,
    'ALTER TABLE payments ADD COLUMN subscription_id BIGINT NULL',
    'SELECT \"subscription column already present\"'
);

PREPARE stmt FROM @subscription_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Allow appointment_id to be NULL (subscription-only payments have no appointment)
SET @appointment_not_nullable :=
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'payments'
       AND column_name = 'appointment_id'
       AND is_nullable = 'NO');

SET @appointment_sql := IF(
    @appointment_not_nullable > 0,
    'ALTER TABLE payments MODIFY COLUMN appointment_id BIGINT NULL',
    'SELECT \"appointment column already nullable\"'
);

PREPARE stmt FROM @appointment_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


