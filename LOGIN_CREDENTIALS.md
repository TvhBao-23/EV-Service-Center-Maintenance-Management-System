# 🔐 LOGIN CREDENTIALS - EV SERVICE CENTER

## ✅ Tài khoản có sẵn trong Database

### 👨‍💼 Admin Account
- **Email:** `admin@evsc.com`
- **Password:** `230305`
- **Role:** Admin
- **Full Name:** Admin Hoai Bao
- **Phone:** 0772051289

### 👥 Staff Accounts

#### Staff 1
- **Email:** `staff1@gmail.com`
- **Password:** `230305`
- **Role:** Staff
- **Full Name:** Nguyen Van Staff
- **Phone:** 0772051290

#### Staff 2
- **Email:** `staff2@gmail.com`
- **Password:** `230305`
- **Role:** Staff
- **Full Name:** Tran Thi Receptionist
- **Phone:** 0772051291

### 🔧 Technician Accounts

#### Tech 1
- **Email:** `tech1@evsc.com`
- **Password:** `230305`
- **Full Name:** Le Van Tech
- **Phone:** 0772051292

#### Tech 2
- **Email:** `tech2@evsc.com`
- **Password:** `230305`
- **Full Name:** Pham Van Mechanic
- **Phone:** 0772051293

#### Tech 3
- **Email:** `tech3@evsc.com`
- **Password:** `230305`
- **Full Name:** Hoang Van Expert
- **Phone:** 0772051294

---

## 🚨 QUAN TRỌNG

**TẤT CẢ tài khoản đều dùng password:** `230305`

**BCrypt Hash:** `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCa`

---

## ❌ Tài khoản KHÔNG tồn tại

- ❌ `staff@evservice.com` - KHÔNG có trong database
- ❌ Password `staff123` - KHÔNG đúng

---

## 🎯 Để Login vào Staff Dashboard

1. Truy cập: http://localhost:3000
2. Chọn tab "Nhân viên" (👤)
3. Nhập:
   - Email: `staff1@gmail.com`
   - Password: `230305`
4. Click "Đăng nhập hệ thống"

---

## 🔍 Xác minh trong Database

```sql
-- Xem tất cả users
SELECT user_id, email, full_name, phone, role 
FROM users 
WHERE role IN ('admin', 'staff', 'technician')
ORDER BY role, user_id;
```

```bash
# Chạy trong Docker
docker exec -i ev-service-center-maintenance-management-system-hoaibao-mysql-1 \
  mysql -u root -ppassword ev_service_center \
  -e "SELECT user_id, email, full_name, role FROM users WHERE role IN ('staff', 'admin');"
```

---

**Created:** November 3, 2025  
**Status:** ✅ VERIFIED IN DATABASE

