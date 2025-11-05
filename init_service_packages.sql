-- Create service_packages table
CREATE TABLE IF NOT EXISTS service_packages (
    package_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_months INT NOT NULL,
    services_included INT NOT NULL,
    benefits TEXT,
    active BOOLEAN DEFAULT TRUE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create customer_subscriptions table
CREATE TABLE IF NOT EXISTS customer_subscriptions (
    subscription_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    services_used INT DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (package_id) REFERENCES service_packages(package_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert sample service packages (KHONG DAU - NO DIACRITICS)
INSERT INTO service_packages (name, description, price, duration_months, services_included, benefits, active) VALUES
('Goi Co Ban', 'Goi dich vu cho nguoi dung thuong xuyen', 999000, 3, 5, 'Mien phi kiem tra dinh ky,Uu tien dat lich,Giam 10% phi dich vu', TRUE),
('Goi Tieu Chuan', 'Goi pho bien nhat cho gia dinh', 1799000, 6, 12, 'Mien phi kiem tra dinh ky,Uu tien dat lich,Giam 15% phi dich vu,Ho tro khan cap 24/7', TRUE),
('Goi Cao Cap', 'Goi VIP voi nhieu uu dai nhat', 2999000, 12, 25, 'Mien phi tat ca kiem tra dinh ky,Uu tien toi da,Giam 20% phi dich vu,Ho tro khan cap 24/7,Tang 1 lan bao duong mien phi', TRUE);

-- Add indexes
CREATE INDEX idx_customer_subscriptions_customer ON customer_subscriptions(customer_id);
CREATE INDEX idx_customer_subscriptions_status ON customer_subscriptions(status);
CREATE INDEX idx_customer_subscriptions_end_date ON customer_subscriptions(end_date);
