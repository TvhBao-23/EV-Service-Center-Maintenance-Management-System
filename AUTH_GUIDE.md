# HƯỚNG DẪN LẤY ACCESS TOKEN (JWT) - MICROSERVICE AUTH

Hệ thống sử dụng cơ chế bảo mật **Bearer Token (JWT)** qua API Gateway chạy ở cổng `8090`. Để thực hiện các API nghiệp vụ tiếp theo (Xem thông tin, sửa xe, xuất kho...), các thành viên cần lấy token theo quy trình sau:

### 1. Gọi API Đăng Ký Tài Khoản (Nếu chưa có)
* **Endpoint:** `POST http://localhost:8090/api/auth/register`
* **Body (JSON):**
```json
{
    "username": "baotvh_test",
    "password": "SecurePassword123!",
    "email": "baotvh3481@ut.edu.vn",
    "fullName": "Nguyễn Hoài Bảo"
}
```
* **Kết quả trả về:** Hệ thống báo đăng ký thành công (Không tự cấp token để đảm bảo bảo mật).

### 2. Gọi API Đăng Nhập để lấy Token (Login)
* **Endpoint:** `POST http://localhost:8090/api/auth/login`
* **Body (JSON):**
```json
{
    "username": "baotvh_test",
    "password": "SecurePassword123!"
}
```
* **Kết quả thành công (200 OK):** Hệ thống sẽ nhả ra chuỗi Token:
```json
{
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Cách sử dụng Token cho các API khác
Tất cả các API nghiệp vụ sau này của Thành viên 2, 3, 4, 5 khi gọi qua Gateway đều phải đính kèm Token này vào phần **Header**:
* **Key:** `Authorization`
* **Value:** `Bearer <Mã_Token_Lấy_Từ_Bước_2>`
