# ✅ HƯỚNG DẪN TEST TÍNH NĂNG QUÊN MẬT KHẨU

## 🔧 Hệ thống đang chạy

Tất cả services đang hoạt động bình thường:
- ✅ Frontend: http://localhost:3000
- ✅ AuthService: http://localhost:8081
- ✅ MySQL: localhost:3306

---

## 📝 CÁCH TEST

### **Bước 1: Truy cập trang Forgot Password**

Mở trình duyệt và truy cập:
```
http://localhost:3000/forgot-password
```

HOẶC từ trang login, click vào link "Quên mật khẩu?"

---

### **Bước 2: Nhập Email**

1. Nhập email đã đăng ký (ví dụ: `tranvhoaibao@gmail.com`)
2. Click nút **"Gửi mã xác nhận"**

---

### **Bước 3: Lấy mã OTP từ Console**

Vì chưa cấu hình email SMTP, mã OTP sẽ được hiển thị trong log của authservice.

**Mở PowerShell mới và chạy:**
```powershell
docker-compose logs -f authservice
```

**Tìm đoạn log này:**
```
========================================
PASSWORD RESET OTP
Email: tranvhoaibao@gmail.com
OTP Code: 123456
User: Trần Văn Hoài Bảo
========================================
```

**Copy mã OTP 6 số** (ví dụ: `123456`)

---

### **Bước 4: Nhập mã OTP**

1. Quay lại trình duyệt
2. Nhập mã OTP 6 số vừa copy
3. Click **"Xác thực mã OTP"**

---

### **Bước 5: Đặt mật khẩu mới**

1. Nhập mật khẩu mới (ít nhất 6 ký tự)
2. Nhập lại mật khẩu để xác nhận
3. Click **"Đặt lại mật khẩu"**

✅ **Thành công!** Bạn sẽ được chuyển về trang login sau 2 giây

---

## 🎯 TEST EMAIL CÓ SẴN

Bạn có thể test với các email sau (nếu đã có trong database):

1. **tranvhoaibao@gmail.com** - Người dùng test
2. **admin@evsc.com** - Admin account

---

## 🔍 KIỂM TRA DATABASE

Để xem token đã được tạo trong database:

```powershell
docker exec -i ev-service-center-maintenance-management-system-hoaibao-mysql-1 mysql -uroot -ppassword ev_service_center -e "SELECT * FROM password_reset_tokens ORDER BY created_at DESC LIMIT 5;"
```

Để xem rate limiting attempts:

```powershell
docker exec -i ev-service-center-maintenance-management-system-hoaibao-mysql-1 mysql -uroot -ppassword ev_service_center -e "SELECT * FROM password_reset_attempts ORDER BY created_at DESC LIMIT 5;"
```

---

## ⚠️ LƯU Ý

### **Rate Limiting:**
- Tối đa **5 lần thử** trong 1 giờ
- Nếu vượt quá → **block 60 phút**

### **Token Expiry:**
- Mã OTP có hiệu lực **15 phút**
- Sau 15 phút phải yêu cầu mã mới

### **One-time Use:**
- Mỗi token chỉ dùng được **1 lần**
- Sau khi reset password thành công, token sẽ bị đánh dấu là `used`

---

## 🐛 TROUBLESHOOTING

### **Lỗi: "Table doesn't exist"**
Database chưa có bảng password_reset. Chạy:
```powershell
Get-Content mysql-init/04_password_reset.sql | docker exec -i ev-service-center-maintenance-management-system-hoaibao-mysql-1 mysql -uroot -ppassword ev_service_center
docker-compose restart authservice
```

### **Lỗi: "Email không tồn tại"**
Email chưa được đăng ký. Tạo user mới hoặc dùng email có sẵn.

### **Không thấy OTP trong log**
Chạy lệnh sau để xem log real-time:
```powershell
docker-compose logs -f authservice
```

---

## 📧 CẤU HÌNH EMAIL (PRODUCTION)

Để email thực sự gửi đi, thêm vào file `authservice/src/main/resources/application-docker.properties`:

```properties
# Gmail SMTP
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

**Lấy App Password từ Gmail:**
1. Vào Google Account Settings
2. Security → 2-Step Verification
3. App passwords → Tạo mới
4. Copy password và paste vào config

---

## ✨ TÍNH NĂNG ĐÃ HOÀN THÀNH

✅ **Backend:**
- ✅ Database schema (password_reset_tokens, password_reset_attempts)
- ✅ Email Service with JavaMail
- ✅ Rate Limiting (5 attempts/hour)
- ✅ Password Reset Service
- ✅ 3 API endpoints (/request, /verify, /reset)

✅ **Frontend:**
- ✅ Beautiful UI với Tailwind CSS
- ✅ 3-step wizard (Email → OTP → New Password)
- ✅ Progress indicator
- ✅ Error & Success alerts
- ✅ Loading states
- ✅ Responsive design

---

## 🎉 CHÚC MỪNG!

Bạn đã hoàn thành tính năng Quên Mật Khẩu!

**Nếu gặp vấn đề gì, hãy kiểm tra:**
1. Docker containers đang chạy (`docker-compose ps`)
2. Authservice logs (`docker-compose logs authservice`)
3. Frontend console (F12 trong trình duyệt)

