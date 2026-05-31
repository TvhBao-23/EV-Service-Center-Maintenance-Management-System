# 1. ĐẶC TẢ CHI TIẾT CHỨC NĂNG PHÂN HỆ AUTH & SECURITY

Phân hệ Auth & Security chịu trách nhiệm quản lý danh tính người dùng, cấp quyền truy cập bảo mật và xử lý chu trình khôi phục mật khẩu thông qua mã xác thực một lần (OTP).

---

## 1.1. Chức năng Đăng ký tài khoản (Register)
* **Đường dẫn API (Endpoint):** `POST /api/auth/register`
* **Người thực hiện (Actor):** Khách truy cập (Guest)
* **Luồng xử lý nghiệp vụ chi tiết:**

| Bước | Tác nhân | Hành động / Phản hồi của hệ thống |
| :--- | :--- | :--- |
| **1** | Người dùng | Nhập các thông tin đăng ký bắt buộc bao gồm: **Họ tên (fullName)**, **Email**, và **Mật khẩu (password)**. |
| **2** | Hệ thống | Kiểm tra định dạng dữ liệu (Email hợp lệ, độ dài mật khẩu). |
| **3** | Hệ thống | Truy vấn cơ sở dữ liệu để kiểm tra sự tồn tại của Email (Tránh trùng lặp tài khoản). |
| **4a** | Hệ thống | **Nếu trùng lặp:** Trả về mã lỗi `400 Bad Request` kèm thông báo *"Email đã được sử dụng"*. |
| **4b** | Hệ thống | **Nếu hợp lệ:** <br>1. Thực hiện mã hóa mật khẩu bằng thuật toán **BCrypt**.<br>2. Lưu thông tin người dùng vào bảng `users` với vai trò mặc định là `customer` và trạng thái tài khoản là *chưa kích hoạt (inactive)*.<br>3. Trả về mã trạng thái `201 Created` kèm thông tin tài khoản vừa tạo thành công. |

---

## 1.2. Chức năng Đăng nhập hệ thống (Login)
* **Đường dẫn API (Endpoint):** `POST /api/auth/login`
* **Người thực hiện (Actor):** Người dùng đã có tài khoản
* **Luồng xử lý nghiệp vụ chi tiết:**

| Bước | Tác nhân | Hành động / Phản hồi của hệ thống |
| :--- | :--- | :--- |
| **1** | Người dùng | Cung cấp thông tin xác thực bao gồm định danh tài khoản và mật khẩu. |
| **2** | Hệ thống | **Xử lý Map dữ liệu thông minh:** Sử dụng annotation `@JsonAlias` trong DTO để hỗ trợ chấp nhận linh hoạt cả hai tên trường đầu vào là `username` hoặc `email`. |
| **3** | Hệ thống | Kiểm tra thông tin tài khoản trong bảng `users` và đối soát mật khẩu bằng cách so khớp mã hash BCrypt. |
| **4a** | Hệ thống | **Nếu sai thông tin:** Trả về mã lỗi `401 Unauthorized` kèm thông báo *"Sai email hoặc mật khẩu"*. |
| **4b** | Hệ thống | **Nếu đúng thông tin:** <br>1. Sinh chuỗi mã hóa bảo mật **JWT Access Token** chứa thông tin định danh (Subject, Roles/Permissions) của người dùng.<br>2. Thiết lập thời gian hết hạn cho Token.<br>3. Trả về mã trạng thái `200 OK` kèm chuỗi Token trong Body response để Client lưu trữ. |

---

## 1.3. Yêu cầu OTP khôi phục mật khẩu (Forgot Password)
* **Đường dẫn API (Endpoint):** `POST /api/auth/forgot-password`
* **Người thực hiện (Actor):** Người dùng quên mật khẩu
* **Luồng xử lý nghiệp vụ chi tiết:**

| Bước | Tác nhân | Hành động / Phản hồi của hệ thống |
| :--- | :--- | :--- |
| **1** | Người dùng | Nhập **Email** cần khôi phục mật khẩu. |
| **2** | Hệ thống | Kiểm tra xem email đó có tồn tại hoạt động trong hệ thống hay không. Nếu không, trả về lỗi `404 Not Found`. |
| **3** | Hệ thống | **Tạo mã xác thực:** Sinh ngẫu nhiên mã **OTP gồm 6 chữ số** và tính toán thời gian hết hạn (ví dụ: có hiệu lực trong 5-10 phút). |
| **4** | Hệ thống | Lưu bản ghi chứa thông tin: *Email*, *Mã OTP*, *Thời gian hết hạn (expires_at)*, và đặt trạng thái sử dụng ban đầu là *chưa dùng (used = false)* vào bảng `password_reset_tokens`. |
| **5** | Hệ thống | **Mô phỏng gửi Email:** Để hỗ trợ phát triển nhanh và kiểm chứng độc lập, hệ thống sẽ thực hiện in trực tiếp mã OTP vừa tạo ra màn hình **Docker Console Log (Log stdout)** của container `authservice` thay vì gửi email thật. |
| **6** | Hệ thống | Trả về mã trạng thái `200 OK` thông báo *"Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn"*. |

---

## 1.4. Đặt lại mật khẩu mới bằng OTP (Reset Password)
* **Đường dẫn API (Endpoint):** `POST /api/auth/reset-password`
* **Người thực hiện (Actor):** Người dùng đã nhận được OTP
* **Luồng xử lý nghiệp vụ chi tiết (Kiểm thử hộp trắng):**

```mermaid
graph TD
    A([Bắt đầu: Nhập Email, OTP, Mật khẩu mới]) --> B{Tìm OTP khớp trong DB?}
    B -- Không tìm thấy --> C[Trả về lỗi: Mã OTP không hợp lệ]
    B -- Tìm thấy --> D{Kiểm tra used == true?}
    D -- Đã sử dụng --> E[Trả về lỗi: Mã OTP đã được sử dụng trước đó]
    D -- Chưa dùng --> F{Kiểm tra expires_at < hiện tại?}
    F -- Đã quá hạn --> G[Trả về lỗi: Mã OTP đã hết hạn sử dụng]
    F -- Còn hạn --> H[Băm mật khẩu mới bằng BCrypt]
    H --> I[Cập nhật mật khẩu mới vào bảng users]
    I --> J[Đánh dấu used = true trong bảng OTP]
    J --> K[Trả về mã 200 OK: Đặt lại mật khẩu thành công]
    C & E & G --> L([Kết thúc luồng lỗi])
    K --> M([Kết thúc thành công])
```

---

# 2. HƯỚNG DẪN LẤY VÀ SỬ DỤNG ACCESS TOKEN MẪU (AUTH GUIDE)

Tài liệu này hướng dẫn các thành viên trong dự án cách lấy mã xác thực Access Token từ phân hệ Auth & Security để gọi các API bị chặn quyền (chỉ dành cho khách hàng đã đăng nhập, nhân viên hoặc admin) ở các phân hệ khác như Ví, Quản lý Xe, Phụ tùng.

---

### Quy trình sử dụng Token trong nhóm Phát triển:

### Bước 2.1: Đăng nhập để lấy Access Token
Gửi request đăng nhập bằng tài khoản của bạn (hoặc tài khoản admin mặc định bên dưới) để lấy mã Access Token:

* **Method:** `POST`
* **URL:** `http://localhost:8090/api/auth/login`
* **Body (JSON):**
```json
{
  "username": "admin@gmail.com",
  "password": "password"
}
```

* **Dữ liệu Response trả về (Mẫu):**
```json
{
  "status": "success",
  "message": "Đăng nhập thành công",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTcyNzIwMDB9..."
}
```
👉 Hãy sao chép chuỗi mã hóa trong thuộc tính `"accessToken"`.

---

### Bước 2.2: Gán Token vào Header khi gọi các API bảo mật ở phân hệ khác
Khi gọi bất kỳ API bảo mật nào thuộc phân hệ khác (Ví dụ: xem danh sách linh kiện của phân hệ Phụ tùng, nộp báo cáo sửa chữa, quản lý xe khách hàng), các thành viên **bắt buộc** phải đính kèm chuỗi Token này vào phần **Headers** của Request trên Postman theo cấu trúc chuẩn dưới đây:

* **Key:** `Authorization`
* **Value:** `Bearer <Mã_Access_Token_Đã_Copy_Ở_Bước_2.1>`

#### 📝 Cấu hình mẫu trong HTTP Request Header:
```http
Host: localhost:8090
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTcyNzIwMDB9...
```
