# 🧪 HƯỚNG DẪN TEST HỆ THỐNG ĐĂNG NHẬP NHÂN VIÊN

## ✅ Trạng thái: SẴN SÀNG TEST

---

## 🚀 **BƯỚC 1: KHỞI ĐỘNG HỆ THỐNG**

### **Frontend:**
```bash
cd frontend
npm run dev
```
**Expected:** Frontend chạy trên `http://localhost:5173`

### **Backend (StaffService):**
```bash
# Nếu dùng Docker
docker-compose up -d staffservice

# Hoặc nếu chạy local
cd staffservice
mvn spring-boot:run
```
**Expected:** Backend chạy trên `http://localhost:8083`

---

## 🧪 **BƯỚC 2: TEST CASES**

### **✅ Test Case 1: Truy cập Staff Login từ Landing Page**

**Steps:**
1. Mở browser: `http://localhost:5173/`
2. Scroll xuống **Footer** (cuối trang)
3. Tìm nút xanh dương: **"Đăng nhập dành cho Nhân viên"**
4. Click vào nút

**Expected Results:**
- ✅ URL chuyển sang: `http://localhost:5173/staff-login`
- ✅ Trang hiển thị:
  - Badge: "🔒 Khu vực dành riêng cho nhân viên"
  - Title: "Đăng nhập Nhân viên"
  - 3 role indicators: ● Admin ● Staff ● Kỹ thuật viên
  - Form đăng nhập với background xanh dương-tím
  - Warning note: "💡 Lưu ý: Trang này chỉ dành cho nhân viên..."

**Screenshot Expected:**
```
┌─────────────────────────────────────────┐
│  🔒 Khu vực dành riêng cho nhân viên    │
│         [Gradient Blue Logo]            │
│      Đăng nhập Nhân viên                │
│   ● Admin  ● Staff  ● Kỹ thuật viên    │
│  [Email input]                          │
│  [Password input]                        │
│  [Đăng nhập hệ thống button]           │
│  ← Quay lại đăng nhập khách hàng       │
│  [Info box với lưu ý]                   │
└─────────────────────────────────────────┘
```

---

### **✅ Test Case 2: Đăng nhập Admin thành công**

**Precondition:** Backend đang chạy trên port 8083

**Steps:**
1. Vào: `http://localhost:5173/staff-login`
2. Nhập thông tin:
   ```
   Email: admin@evsc.com
   Password: 230305
   ```
3. Click **"Đăng nhập hệ thống"**

**Expected Results:**
- ✅ Button hiển thị: "Đang xác thực..." với loading spinner
- ✅ Console log hiển thị:
  ```
  Staff login attempt: admin@evsc.com
  🌐 API CALL: http://localhost:8083/api/auth/login
  🌐 API RESPONSE: status 200
  ```
- ✅ Redirect đến: `http://localhost:5173/admin`
- ✅ Hiển thị Admin Dashboard
- ✅ LocalStorage được lưu:
  ```javascript
  localStorage.getItem('authToken') // JWT token
  localStorage.getItem('user') // User data với role: ADMIN
  ```

---

### **✅ Test Case 3: Đăng nhập Staff thành công**

**Steps:**
1. Vào: `http://localhost:5173/staff-login`
2. Nhập email/password của staff (cần kiểm tra database)
3. Click đăng nhập

**Expected Results:**
- ✅ Redirect đến: `http://localhost:5173/staff`
- ✅ Hiển thị Staff Dashboard
- ✅ User data có `role: "RECEPTIONIST"` hoặc `"STAFF"`

---

### **✅ Test Case 4: Đăng nhập Technician thành công**

**Steps:**
1. Vào: `http://localhost:5173/staff-login`
2. Nhập email/password của technician
3. Click đăng nhập

**Expected Results:**
- ✅ Redirect đến: `http://localhost:5173/technician`
- ✅ Hiển thị Technician Dashboard
- ✅ User data có `role: "TECHNICIAN"`

---

### **❌ Test Case 5: Đăng nhập thất bại (sai mật khẩu)**

**Steps:**
1. Vào: `http://localhost:5173/staff-login`
2. Nhập:
   ```
   Email: admin@evsc.com
   Password: wrongpassword
   ```
3. Click đăng nhập

**Expected Results:**
- ❌ Error message hiển thị: "Đăng nhập nhân viên thất bại"
- ❌ Không redirect
- ❌ Form vẫn ở trang `/staff-login`
- ❌ Console log hiển thị error

---

### **✅ Test Case 6: Backend không khả dụng**

**Precondition:** Stop StaffService (port 8083)

**Steps:**
1. Stop backend:
   ```bash
   docker-compose stop staffservice
   ```
2. Vào: `http://localhost:5173/staff-login`
3. Nhập thông tin đăng nhập
4. Click đăng nhập

**Expected Results:**
- ❌ Error message: "Đăng nhập nhân viên thất bại"
- ❌ Console error: Network error / Failed to fetch
- ❌ Không redirect

---

### **✅ Test Case 7: Quay lại Customer Login**

**Steps:**
1. Vào: `http://localhost:5173/staff-login`
2. Click link: **"← Quay lại đăng nhập khách hàng"**

**Expected Results:**
- ✅ Redirect đến: `http://localhost:5173/login`
- ✅ Hiển thị Customer login page (màu xanh lá)
- ✅ Title: "Đăng nhập tài khoản"

---

### **✅ Test Case 8: Direct URL Access**

**Steps:**
1. Nhập trực tiếp URL: `http://localhost:5173/staff-login`
2. Press Enter

**Expected Results:**
- ✅ Trang Staff Login hiển thị ngay
- ✅ Không cần qua Landing page

---

### **✅ Test Case 9: Customer vs Staff Login khác biệt**

**Steps:**
1. Mở 2 tabs:
   - Tab 1: `http://localhost:5173/login` (Customer)
   - Tab 2: `http://localhost:5173/staff-login` (Staff)
2. So sánh

**Expected Differences:**

| Đặc điểm | Customer Login | Staff Login |
|----------|----------------|-------------|
| Background | Green gradient | Blue-Indigo-Purple |
| Logo color | Green | Blue gradient |
| Title | "Đăng nhập tài khoản" | "Đăng nhập Nhân viên" |
| Security badge | ❌ Không có | ✅ "Khu vực dành riêng..." |
| Role indicators | ❌ Không có | ✅ 3 chấm màu |
| Button text | "Đăng nhập" | "Đăng nhập hệ thống" |
| Button color | Green | Blue gradient |
| Info note | ❌ Không có | ✅ "Lưu ý: Trang này chỉ dành..." |
| Sign up link | ✅ Có | ❌ Không có |

---

## 🔍 **BƯỚC 3: DEBUG TOOLS**

### **Chrome DevTools Console:**

```javascript
// Check if user is logged in
const user = JSON.parse(localStorage.getItem('user'))
console.log('User:', user)
console.log('Role:', user?.role)
console.log('Is Staff:', user?.isStaff)

// Check token
const token = localStorage.getItem('authToken')
console.log('Token:', token)

// Check API endpoint
fetch('http://localhost:8083/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(r => r.json())
  .then(data => console.log('Profile:', data))
  .catch(err => console.error('Error:', err))
```

### **Network Tab:**

Filter: **XHR**

Expected calls:
```
POST http://localhost:8083/api/auth/login
  Request: { email, password }
  Response: { token, message }

GET http://localhost:8083/api/auth/profile
  Headers: Authorization: Bearer <token>
  Response: { staffId, fullName, email, role, ... }
```

---

## 📸 **SCREENSHOT CHECKLIST**

Chụp màn hình các trang sau để verify:

- [ ] Landing page - Footer với nút Staff Login
- [ ] Staff Login page - Full UI
- [ ] Staff Login page - Loading state
- [ ] Staff Login page - Error state
- [ ] Admin Dashboard sau khi login thành công
- [ ] Staff Dashboard sau khi login thành công
- [ ] Technician Dashboard sau khi login thành công

---

## ✅ **ACCEPTANCE CRITERIA**

Hệ thống được coi là **PASS** nếu:

1. ✅ Landing page có link Staff Login ở footer
2. ✅ Staff Login page hiển thị đúng UI (blue theme)
3. ✅ Đăng nhập Admin thành công → redirect `/admin`
4. ✅ Đăng nhập Staff thành công → redirect `/staff`
5. ✅ Đăng nhập Technician thành công → redirect `/technician`
6. ✅ Đăng nhập sai hiển thị error
7. ✅ Quay lại Customer Login hoạt động
8. ✅ Staff Login và Customer Login khác biệt rõ ràng

---

## 🐛 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: Backend không chạy**
```
Error: Failed to fetch
```
**Solution:**
```bash
docker-compose up -d staffservice
# Hoặc
cd staffservice && mvn spring-boot:run
```

### **Issue 2: CORS Error**
```
Error: CORS policy blocked
```
**Solution:**
Kiểm tra `staffservice/src/main/java/.../config/SecurityConfig.java`:
```java
@CrossOrigin(origins = "http://localhost:5173")
```

### **Issue 3: Token expired**
```
Error: 401 Unauthorized
```
**Solution:**
```javascript
// Clear old token
localStorage.removeItem('authToken')
localStorage.removeItem('user')
// Login lại
```

### **Issue 4: Không redirect sau login**
```
Login successful nhưng không chuyển trang
```
**Solution:**
Kiểm tra StaffLogin.jsx line 32-40:
```javascript
if (result.success) {
  // Đảm bảo có redirect logic
  if (result.user.role === 'ADMIN') {
    navigate('/admin')
  } else if (result.user.role === 'TECHNICIAN') {
    navigate('/technician')
  } else {
    navigate('/staff')
  }
}
```

---

## 📝 **TEST REPORT TEMPLATE**

```markdown
# Test Report - Staff Login System

**Date:** [Your Date]
**Tester:** [Your Name]
**Environment:** Development

## Test Results:

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1. Access from Landing | ✅ PASS | |
| 2. Admin Login | ✅ PASS | |
| 3. Staff Login | ✅ PASS | |
| 4. Technician Login | ✅ PASS | |
| 5. Wrong Password | ✅ PASS | |
| 6. Backend Down | ✅ PASS | |
| 7. Back to Customer | ✅ PASS | |
| 8. Direct URL | ✅ PASS | |
| 9. UI Differences | ✅ PASS | |

## Issues Found:
- None

## Recommendations:
- System is ready for production

**Overall Status:** ✅ **ALL TESTS PASSED**
```

---

**Happy Testing! 🚀**

Date: November 3, 2025  
Version: 1.0  
Status: Ready for Testing

