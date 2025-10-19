# EV Service Center - Maintenance Management System

Hệ thống quản lý bảo trì trung tâm dịch vụ xe điện với kiến trúc microservices.

## Kiến trúc hệ thống

- **Frontend**: React + Vite + Tailwind CSS (Port 3000)
- **Auth Service**: Spring Boot + JWT (Port 8081)
- **API Gateway**: Spring Boot (Port 8080) - *đang phát triển*
- **Database**: MySQL 8.0 (Port 3306)

## Cách chạy

### 1. Yêu cầu hệ thống
- Docker Desktop
- Git

### 2. Khởi động toàn bộ hệ thống
```bash
# Clone repository
git clone <your-repo-url>
cd EV-Service-Center-Maintenance-Management-System-HoaiBao

# Khởi động tất cả services
docker compose up --build
```

### 3. Truy cập ứng dụng
- **Frontend**: http://localhost:3000
- **Auth API**: http://localhost:8081/api/auth/
- **Health Check**: http://localhost:8081/health

### 4. Test đăng ký/đăng nhập

#### Đăng ký tài khoản mới
- Truy cập http://localhost:3000/register
- Điền thông tin và chọn role (customer/staff/technician)
- Sau khi đăng ký thành công, chuyển về trang login

#### Đăng nhập
- Truy cập http://localhost:3000/login
- Nhập email và mật khẩu đã đăng ký
- Hệ thống sẽ redirect theo role:
  - `admin` → /admin
  - `technician` → /technician  
  - `staff` → /staff
  - `customer` → /vehicles

### 5. API Endpoints

#### Auth Service (Port 8081)
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /health` - Kiểm tra trạng thái service

#### Request/Response Examples

**Register:**
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "phone": "0123456789",
  "role": "customer"
}

Response: {"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "user@example.com", 
  "password": "password123"
}

Response: {"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

### 6. Database

#### Truy cập MySQL
```bash
# Vào container MySQL
docker compose exec -it mysql bash

# Mở MySQL client
mysql -uroot -p
# (Nhấn Enter vì password trống)

# Chọn database
USE ev_service_center;

# Xem bảng users
SELECT user_id, email, full_name, role, created_at FROM users;
```

#### Schema chính
- `users` - Thông tin người dùng và xác thực
- `customers` - Thông tin khách hàng
- `staffs` - Thông tin nhân viên
- `vehicles` - Thông tin xe
- `appointments` - Lịch hẹn
- `service_orders` - Đơn dịch vụ
- Và nhiều bảng khác...

### 7. Troubleshooting

#### Lỗi kết nối database
```bash
# Kiểm tra MySQL đã sẵn sàng
docker compose logs mysql

# Restart auth service sau khi MySQL ready
docker compose restart authservice
```

#### Lỗi build
```bash
# Xóa cache và build lại
docker compose down
docker compose build --no-cache
docker compose up
```

#### Kiểm tra ports
```bash
# Kiểm tra ports đang sử dụng
docker compose ps

# Test kết nối
curl http://localhost:8081/health
curl http://localhost:3000
```

### 8. Development

#### Chạy riêng từng service
```bash
# Chỉ chạy database
docker compose up mysql

# Chạy auth service
docker compose up authservice

# Chạy frontend (cần Node.js)
cd frontend
npm install
npm run dev
```

#### Environment Variables
- `VITE_AUTH_API_URL` - URL của auth service (default: http://localhost:8081)
- `REACT_APP_API_URL` - URL của API gateway (default: http://localhost:8080)

### 9. Cấu trúc thư mục
```
├── frontend/                 # React frontend
├── authservice/             # Auth microservice
├── evservicecenter/         # Main API gateway
├── mysql-init/              # Database initialization scripts
├── docker-compose.yml       # Docker orchestration
└── README.md               # This file
```

## Tính năng hiện tại

✅ **Hoàn thành:**
- Đăng ký/đăng nhập với JWT
- Phân quyền theo role (admin, staff, technician, customer)
- Database schema đầy đủ
- Docker containerization
- Frontend tích hợp auth service

🚧 **Đang phát triển:**
- API Gateway routing
- Quản lý xe (vehicles)
- Đặt lịch hẹn (appointments)
- Quản lý đơn dịch vụ
- Chat system
- Notifications

## Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## License

MIT License