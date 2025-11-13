-- Subscription Tables for CustomerService
-- Service Packages and Customer Subscriptions

USE ev_service_center;

-- Service Packages table
CREATE TABLE IF NOT EXISTS service_packages (
    package_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_months INT NOT NULL,
    services_included INT NOT NULL,
    benefits TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_service_packages_active ON service_packages(active);

-- Customer Subscriptions table
CREATE TABLE IF NOT EXISTS customer_subscriptions (
    subscription_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    services_used INT NOT NULL DEFAULT 0,
    status ENUM('ACTIVE', 'EXPIRED', 'CANCELLED', 'EXHAUSTED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES service_packages(package_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_customer_subscriptions_customer_id ON customer_subscriptions(customer_id);
CREATE INDEX idx_customer_subscriptions_package_id ON customer_subscriptions(package_id);
CREATE INDEX idx_customer_subscriptions_status ON customer_subscriptions(status);
CREATE INDEX idx_customer_subscriptions_end_date ON customer_subscriptions(end_date);

-- Insert sample service packages
INSERT INTO service_packages (name, description, price, duration_months, services_included, benefits, active) VALUES
('Gói Tháng Cơ Bản', 'Gói bảo dưỡng 1 tháng, 2 lần dịch vụ', 500000, 1, 2, 'Bảo dưỡng cơ bản, Kiểm tra tổng thể', TRUE),
('Gói Quý Tiết Kiệm', 'Gói bảo dưỡng 3 tháng, 6 lần dịch vụ', 1200000, 3, 6, 'Bảo dưỡng định kỳ, Giảm giá 10%', TRUE),
('Gói Nửa Năm Chuyên Nghiệp', 'Gói bảo dưỡng 6 tháng, 12 lần dịch vụ', 2000000, 6, 12, 'Bảo dưỡng toàn diện, Giảm giá 15%, Ưu tiên đặt lịch', TRUE),
('Gói Năm Premium', 'Gói bảo dưỡng 12 tháng, 24 lần dịch vụ', 3500000, 12, 24, 'Bảo dưỡng cao cấp, Giảm giá 20%, Ưu tiên cao, Hỗ trợ 24/7', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

