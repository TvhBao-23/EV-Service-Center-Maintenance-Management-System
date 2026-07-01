# HƯỚNG DẪN ĐĂNG NHẬP & LẤY ACCESS TOKEN MẪU (AUTH GUIDE)
## PHÂN HỆ 01: QUẢN LÝ ĐỊNH DANH & BẢO MẬT (AUTH & SECURITY)

Tài liệu này hướng dẫn chi tiết quy trình đăng ký, đăng nhập lấy Access Token dạng JWT và cách sử dụng token để gọi các API được bảo mật trong hệ thống Quản lý bảo dưỡng trung tâm dịch vụ xe điện EV.

---

## 1. Sơ đồ luồng Xác thực (Authentication Workflow)

```mermaid
sequenceDiagram
    actor Client as Khách hàng / Kỹ thuật viên
    participant GW as API Gateway (Port 8090)
    participant Auth as AuthService (Port 8083)
    participant DB as MySQL Database

    Note over Client, DB: BƯỚC 1: ĐĂNG KÝ TÀI KHOẢN
    Client->>GW: POST /api/auth/register (Email, Password, Họ tên, SĐT)
    GW->>Auth: Chuyển tiếp request
    Auth->>DB: Kiểm tra trùng email & Lưu User
    DB-->>Auth: Đã lưu thành công
    Auth-->>Client: Phản hồi 201 Created (Đăng ký thành công)

    Note over Client, DB: BƯỚC 2: ĐĂNG NHẬP LẤY TOKEN
    Client->>GW: POST /api/auth/login (Email/Username, Password)
    GW->>Auth: Chuyển tiếp request
    Auth->>DB: Tìm kiếm User & Khớp mật mã Bcrypt
    Auth->>Auth: Ký số sinh ra JWT Token
    Auth-->>Client: Phản hồi 200 OK + JWT Access Token

    Note over Client, DB: BƯỚC 3: TRUY CẬP API ĐƯỢC BẢO MẬT
    Client->>GW: Gửi request + Header "Authorization: Bearer <Token>"
    GW->>Auth: Kiểm tra tính hợp lệ & giải mã JWT
    GW-->>Client: Cho phép truy cập dữ liệu nghiệp vụ
```

---

## 2. Hướng dẫn chi tiết thực hiện qua curl / Postman

Tất cả các API được gọi thông qua **API Gateway** ở cổng `8090`.

### Bước 2.1. Đăng ký tài khoản mới (Customer Register)
*   **API URL:** `POST http://localhost:8090/api/auth/register`
*   **Headers:** `Content-Type: application/json`
*   **Ví dụ curl:**
    ```bash
    curl -X POST http://localhost:8090/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{
        "email": "bao.hoai@example.com",
        "password": "password123",
        "fullName": "Hoài Bảo",
        "phone": "0987654321"
      }'
    ```
*   **Response nhận được (201 Created):**
    ```json
    {
      "status": "success",
      "message": "Đăng ký tài khoản thành công!"
    }
    ```

### Bước 2.2. Đăng nhập hệ thống lấy Access Token (User Login)
Hỗ trợ cả trường `email` và alias `username` để đăng nhập.
*   **API URL:** `POST http://localhost:8090/api/auth/login`
*   **Headers:** `Content-Type: application/json`
*   **Ví dụ curl:**
    ```bash
    curl -X POST http://localhost:8090/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "bao.hoai@example.com",
        "password": "password123"
      }'
    ```
    *(Hoặc sử dụng trường "username" thay cho "email"):*
    ```bash
    curl -X POST http://localhost:8090/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "username": "bao.hoai@example.com",
        "password": "password123"
      }'
    ```
*   **Response nhận được (200 OK):**
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYW8uaG9haUBleGFtcGxlLmNvbSIsImlhdCI6MTcxODU2MTkwMCwiZXhwIjoxNzE4NjQ4MzAwfQ.xxxxxxx"
    }
    ```

### Bước 2.3. Sử dụng Access Token để truy cập API bảo mật
Sau khi nhận được chuỗi `token` từ API Đăng nhập, hãy sao chép chuỗi đó và gắn vào Header của mọi request tiếp theo dưới định dạng:
`Authorization: Bearer <Access_Token>`

*   **Ví dụ API lấy thông tin cá nhân (Get Current User):**
    *   **API URL:** `GET http://localhost:8090/api/auth/me`
    *   **Ví dụ curl:**
        ```bash
        curl -X GET http://localhost:8090/api/auth/me \
          -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYW8uaG9haUBleGFtcGxlLmNvbSIsImlhdCI6MTcxODU2MTkwMCwiZXhwIjoxNzE4NjQ4MzAwfQ.xxxxxxx"
        ```
    *   **Response nhận được (200 OK):**
        ```json
        {
          "userId": 1,
          "email": "bao.hoai@example.com",
          "fullName": "Hoài Bảo",
          "phone": "0987654321",
          "role": "customer"
        }
        ```

---

## 3. Quy trình Quên mật khẩu & Đặt lại bằng mã OTP

Khi người dùng quên mật khẩu, quy trình khôi phục diễn ra gồm 2 bước:

### Bước 3.1. Gửi yêu cầu Quên mật khẩu (Forgot Password Request)
*   **API URL:** `POST http://localhost:8090/api/auth/forgot-password`
*   **Payload:**
    ```json
    {
      "email": "bao.hoai@example.com"
    }
    ```
*   **Nhận mã OTP:** 
    Hệ thống sẽ gửi mã OTP đến email của khách hàng. Trong môi trường kiểm thử Docker Local, lập trình viên có thể mở console log của container `authservice` để xem mã OTP trực tiếp:
    ```text
    OTP for bao.hoai@example.com: 482903
    ```

### Bước 3.2. Đặt lại mật khẩu mới (Reset Password with OTP)
Nhập mã OTP nhận được ở bước trên để đổi sang mật khẩu mới.
*   **API URL:** `POST http://localhost:8090/api/auth/reset-password`
*   **Payload:**
    ```json
    {
      "email": "bao.hoai@example.com",
      "otp": "482903",
      "password": "newSecurePassword123"
    }
    ```
*   **Response nhận được (200 OK):**
    ```json
    {
      "success": true,
      "message": "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới."
    }
    ```
