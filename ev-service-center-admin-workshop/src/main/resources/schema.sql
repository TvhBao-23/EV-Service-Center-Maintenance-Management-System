CREATE DATABASE IF NOT EXISTS ev_service_center;
USE ev_service_center;

-- =============================================
-- AUTH SERVICE TABLES (Quản lý người dùng)
-- =============================================

-- 1. users: Lưu trữ thông tin cơ bản và xác thực
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE COMMENT 'Email đăng nhập, duy nhất',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Mật khẩu đã được hash',
    role ENUM('customer', 'staff', 'technician', 'admin') NOT NULL COMMENT 'Vai trò người dùng',
    full_name VARCHAR(100) NOT NULL COMMENT 'Họ và tên',
    phone VARCHAR(20) COMMENT 'Số điện thoại',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật cuối',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Trạng thái hoạt động'
) ENGINE=InnoDB COMMENT='Bảng chứa thông tin người dùng và xác thực';

-- =============================================
-- CUSTOMER SERVICE TABLES (Quản lý khách hàng, xe, lịch hẹn)
-- =============================================

-- 2. customers: Thông tin chi tiết của khách hàng
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE COMMENT 'Liên kết tới bảng users',
    address TEXT COMMENT 'Địa chỉ khách hàng',
    -- Có thể thêm các trường khác như ngày sinh, ghi chú,...
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật cuối',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE COMMENT 'Nếu user bị xóa, customer liên quan cũng bị xóa'
) ENGINE=InnoDB COMMENT='Bảng chứa thông tin chi tiết khách hàng';

-- 4. vehicles: Thông tin xe của khách hàng
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL COMMENT 'Liên kết tới bảng customers',
    vin VARCHAR(17) NOT NULL UNIQUE COMMENT 'Số VIN, duy nhất',
    brand VARCHAR(50) NOT NULL COMMENT 'Hãng xe',
    model VARCHAR(50) NOT NULL COMMENT 'Mẫu xe',
    year INT COMMENT 'Năm sản xuất', -- Có thể thêm CHECK (year BETWEEN ...)
    battery_capacity_kwh DECIMAL(5,2) COMMENT 'Dung lượng pin (kWh)',
    odometer_km DECIMAL(10,2) DEFAULT 0 COMMENT 'Số km đã đi',
    last_service_date DATE COMMENT 'Ngày bảo dưỡng cuối',
    last_service_km DECIMAL(10,2) DEFAULT 0 COMMENT 'Số km lúc bảo dưỡng cuối',
    next_service_due_km DECIMAL(10,2) COMMENT 'Số km dự kiến bảo dưỡng tiếp theo',
    next_service_due_date DATE COMMENT 'Ngày dự kiến bảo dưỡng tiếp theo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật cuối',
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE COMMENT 'Nếu customer bị xóa, xe liên quan cũng bị xóa'
) ENGINE=InnoDB COMMENT='Bảng chứa thông tin xe của khách hàng';

-- 5. services: Danh mục các dịch vụ
CREATE TABLE IF NOT EXISTS services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Tên dịch vụ/gói dịch vụ',
    description TEXT COMMENT 'Mô tả chi tiết',
    estimated_duration_minutes INT COMMENT 'Thời gian dự kiến (phút)',
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'Giá cơ bản',
    type ENUM('maintenance', 'repair', 'inspection', 'package') NOT NULL COMMENT 'Loại hình dịch vụ',
    is_package BOOLEAN DEFAULT FALSE COMMENT 'Là gói dịch vụ hay dịch vụ lẻ',
    validity_days INT COMMENT 'Số ngày hiệu lực (nếu là gói)', -- Có thể thêm CHECK (validity_days >= 0)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật cuối'
) ENGINE=InnoDB COMMENT='Bảng danh mục các dịch vụ và gói bảo dưỡng';

-- 7. appointments: Lịch hẹn do khách hàng tạo
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL COMMENT 'Khách hàng đặt lịch',
    vehicle_id INT NOT NULL COMMENT 'Xe cần dịch vụ',
    service_id INT COMMENT 'Dịch vụ yêu cầu (có thể null nếu chưa chọn)',
    requested_date_time DATETIME NOT NULL COMMENT 'Thời gian mong muốn của khách hàng',
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending' COMMENT 'Trạng thái lịch hẹn',
    notes TEXT COMMENT 'Ghi chú của khách hàng',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật cuối',
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    -- Xem xét lại ON DELETE cho service_id: SET NULL an toàn hơn CASCADE
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE SET NULL
    -- Có thể thêm center_id nếu khách hàng chọn trung tâm khi đặt lịch
    -- FOREIGN KEY (center_id) REFERENCES service_centers(center_id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Bảng chứa thông tin lịch hẹn khách hàng đặt';


-- =============================================
-- WORKSHOP / STAFF SERVICE TABLES (Quản lý nhân viên, quy trình dịch vụ)
-- =============================================

-- 3. staffs: Thông tin chi tiết của nhân viên/kỹ thuật viên
CREATE TABLE IF NOT EXISTS staffs (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE COMMENT 'Liên kết tới bảng users',
    position ENUM('receptionist', 'technician', 'manager', 'admin') NOT NULL COMMENT 'Chức vụ',
    hire_date DATE COMMENT 'Ngày vào làm',
    -- Có thể thêm các trường khác như chuyên môn, chứng chỉ,...
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật cuối',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE COMMENT 'Nếu user bị xóa, staff liên quan cũng bị xóa'
) ENGINE=InnoDB COMMENT='Bảng chứa thông tin chi tiết nhân viên và kỹ thuật viên';

-- 8. service_orders: Phiếu dịch vụ thực tế tại xưởng
CREATE TABLE IF NOT EXISTS service_orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT UNIQUE COMMENT 'Liên kết tới lịch hẹn (nếu có), có thể null',
    vehicle_id INT NOT NULL COMMENT 'Xe đang được làm dịch vụ',
    assigned_technician_id INT COMMENT 'Kỹ thuật viên được phân công',
    status ENUM('queued', 'in_progress', 'completed', 'delayed') NOT NULL DEFAULT 'queued' COMMENT 'Trạng thái thực hiện dịch vụ',
    check_in_time DATETIME COMMENT 'Thời gian xe vào xưởng',
    check_out_time DATETIME COMMENT 'Thời gian xe ra xưởng',
    total_amount DECIMAL(12,2) DEFAULT 0 COMMENT 'Tổng chi phí cuối cùng (tính từ order_items)',
    payment_status ENUM('unpaid', 'paid', 'partially_paid') DEFAULT 'unpaid' COMMENT 'Trạng thái thanh toán',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo phiếu',
    completed_at DATETIME COMMENT 'Thời gian hoàn thành dịch vụ',
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE, -- Giữ lại cascade vì service order phụ thuộc vehicle
    FOREIGN KEY (assigned_technician_id) REFERENCES staffs(staff_id) ON DELETE SET NULL COMMENT 'Nếu KTV nghỉ việc, không xóa service order'
    -- Có thể thêm liên kết tới customer_id để truy vấn nhanh hơn, nhưng cần đồng bộ với vehicle.customer_id
    -- customer_id INT,
    -- FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Bảng quản lý quy trình dịch vụ thực tế tại xưởng';


-- =============================================
-- CÁC BẢNG LIÊN QUAN KHÁC (Có thể thuộc các Service riêng)
-- =============================================
/*
-- 6. parts: Danh mục phụ tùng (Thuộc InventoryService?)
-- 9. order_items: Chi tiết dịch vụ/phụ tùng trong một service_order (Thuộc WorkshopService?)
-- 10. part_inventories: Tồn kho phụ tùng (Thuộc InventoryService?)
-- 11. part_usage_history: Lịch sử dùng phụ tùng (Thuộc WorkshopService/InventoryService?)
-- 12. service_checklists: Checklist công việc cho KTV (Thuộc WorkshopService?)
-- 13. payments: Giao dịch thanh toán (Thuộc PaymentService?)
-- 14. chat_messages: Tin nhắn (Thuộc CommunicationService?)
-- 15. notifications: Thông báo (Thuộc NotificationService?)
-- service_centers: Danh sách trung tâm (Thuộc CustomerService/CatalogService?)
*/

-- =============================================
-- INDEXES (Tối ưu truy vấn)
-- =============================================
-- Indexes cho users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Indexes cho customers
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- Indexes cho vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);

-- Indexes cho staffs
CREATE INDEX IF NOT EXISTS idx_staffs_user_id ON staffs(user_id);
CREATE INDEX IF NOT EXISTS idx_staffs_position ON staffs(position);

-- Indexes cho appointments
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_vehicle ON appointments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(requested_date_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Indexes cho service_orders
CREATE INDEX IF NOT EXISTS idx_service_orders_vehicle ON service_orders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_technician ON service_orders(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_orders_payment_status ON service_orders(payment_status);