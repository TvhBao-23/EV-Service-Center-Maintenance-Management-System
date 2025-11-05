Hệ Thống Quản Lý Bảo Trì Trung Tâm Dịch Vụ EV

Tổng quan
- Kiến trúc microservices: Auth (8081), Customer (8082), Staff (8083), Payment (8084)
- API Gateway đơn giản: 8080 (dự phòng/đang tối giản)
- Frontend Vite: 3000
- MySQL 8, tự động khởi tạo CSDL từ thư mục `mysql-init/`

Yêu cầu
- Docker Desktop (Compose v2)

Khởi chạy nhanh
1) Bật toàn bộ dịch vụ:
```bash
docker compose down -v
docker compose up -d --build
```
2) Truy cập:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- AuthService: http://localhost:8081
- CustomerService: http://localhost:8082
- StaffService: http://localhost:8083
- PaymentService: http://localhost:8084

Tài khoản mẫu (được seed)
- Admin: admin@example.com / Admin@123
- Nhân viên: staff1@example.com / Staff@123
- Khách hàng: customer1@example.com / Customer@123

Ghi chú
- MySQL dùng tài khoản root/password, DB `ev_service_center`.
- Frontend gọi trực tiếp các service qua các cổng 8081–8084 (không cần gateway).
- Cấu hình Spring và MySQL đã tối ưu UTF-8.

Lệnh hữu ích
```bash
docker compose ps
docker compose logs -f --tail=100
docker compose down -v
```

Cấu trúc thư mục chính
- `frontend/`: Ứng dụng React Vite
- `authservice/`, `customerservice/`, `staffservice/`, `paymentservice/`: Spring Boot services
- `evservicecenter/`: API gateway (đơn giản)
- `mysql-init/`: Script khởi tạo CSDL và dữ liệu mẫu
- `docker-compose.yml`: Orchestrate toàn hệ thống

Bảo trì
- Nếu MySQL đã chạy trước đó và cần seed lại dữ liệu: `docker compose down -v` rồi khởi động lại.
- Nếu đổi cổng hoặc mật khẩu DB, cập nhật trong `application.properties` của từng service và `docker-compose.yml`.

Giấy phép
- Dùng cho mục đích học tập/demo.


