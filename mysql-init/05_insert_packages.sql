USE ev_service_center;

-- Delete existing data
DELETE FROM service_packages;

-- Insert sample service packages with UTF-8 encoding
INSERT INTO service_packages (name, description, price, duration_months, services_included, benefits, active) VALUES
('Gói Tháng Cơ Bản', 'Gói bảo dưỡng 1 tháng, 2 lần dịch vụ', 500000, 1, 2, 'Bảo dưỡng cơ bản, Kiểm tra tổng thể', TRUE),
('Gói Quý Tiết Kiệm', 'Gói bảo dưỡng 3 tháng, 6 lần dịch vụ', 1200000, 3, 6, 'Bảo dưỡng định kỳ, Giảm giá 10%', TRUE),
('Gói Nửa Năm Chuyên Nghiệp', 'Gói bảo dưỡng 6 tháng, 12 lần dịch vụ', 2000000, 6, 12, 'Bảo dưỡng toàn diện, Giảm giá 15%, Ưu tiên đặt lịch', TRUE),
('Gói Năm Premium', 'Gói bảo dưỡng 12 tháng, 24 lần dịch vụ', 3500000, 12, 24, 'Bảo dưỡng cao cấp, Giảm giá 20%, Ưu tiên cao, Hỗ trợ 24/7', TRUE);

