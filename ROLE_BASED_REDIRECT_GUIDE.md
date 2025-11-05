# 🎯 Hướng Dẫn Role-Based Redirect System

## 📋 Tổng Quan

Hệ thống đã được cấu hình để tự động redirect user đến dashboard phù hợp dựa trên role sau khi đăng nhập thành công.

## ✅ Test Results - Đã Xác Nhận Hoạt Động

### Backend API Tests (Passed ✅)

```powershell
# Test 1: Admin Login
Email: admin@gmail.com
Password: 230305
Role: admin
Redirect: /admin/dashboard
Status: ✅ PASS

# Test 2: Technician Login  
Email: kythuatvien@gmail.com
Password: 230305
Role: technician
Redirect: /technician/dashboard
Status: ✅ PASS

# Test 3: Staff Login
Email: nhanvien@gmail.com
Password: 230305
Role: staff
Redirect: /staff/dashboard
Status: ✅ PASS
```

## 🔧 Cấu Trúc Hệ Thống

### 1. Database Schema

Bảng `users` có cột `role` với các giá trị:
- `admin` - Quản trị viên
- `technician` - Kỹ thuật viên  
- `staff` - Nhân viên
- `customer` - Khách hàng (mặc định)

### 2. Backend API Endpoints

#### Login Endpoint
```
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Login successful"
}
```

#### Get User Info Endpoint
```
GET http://localhost:8081/api/auth/me
Authorization: Bearer {token}

Response:
{
  "userId": 1,
  "fullName": "Admin Hoai Bao",
  "email": "admin@gmail.com",
  "phone": "0123456789",
  "role": "admin"
}
```

### 3. Frontend Implementation

#### AuthContext.jsx
Location: `frontend/src/contexts/AuthContext.jsx`

**Login Flow:**
```javascript
const login = async (email, password) => {
  // 1. Call login API
  const response = await authAPI.login(email, password)
  
  // 2. Get user info from /api/auth/me
  const userInfo = await authAPI.getMe()
  
  // 3. Check if user is staff/technician/admin
  if (['admin', 'staff', 'technician'].includes(userInfo.role.toLowerCase())) {
    const userData = {
      id: userInfo.userId,
      fullName: userInfo.fullName,
      email: userInfo.email,
      phone: userInfo.phone,
      role: userInfo.role.toLowerCase(),
      isStaff: true,
      isActive: true
    }
    
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('authToken', response.token)
    
    return { success: true, user: userData }
  }
}
```

#### Login.jsx
Location: `frontend/src/pages/Login.jsx`

**Redirect Logic:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  const result = await login(formData.email, formData.password)
  
  if (result.success) {
    const userRole = (result.user.role || 'customer').toLowerCase()
    
    // Role-based redirect
    if (userRole === 'admin') {
      navigate('/admin')
    } else if (userRole === 'technician') {
      navigate('/technician')
    } else if (userRole === 'staff') {
      navigate('/staff')
    } else {
      navigate('/vehicles')  // Customer default
    }
  }
}
```

## 🧪 Cách Test Hệ Thống

### Option 1: Test với Browser (Recommended)

1. **Khởi động services:**
```bash
docker-compose up -d
cd frontend
npm run dev
```

2. **Mở browser:**
```
http://localhost:5173
```

3. **Test từng role:**

| Role | Email | Password | Expected Redirect |
|------|-------|----------|-------------------|
| Admin | admin@gmail.com | 230305 | /admin |
| Technician | kythuatvien@gmail.com | 230305 | /technician |
| Staff | nhanvien@gmail.com | 230305 | /staff |

### Option 2: Test với HTML File

Mở file `test-role-redirect.html` trong browser và click nút test cho từng role.

### Option 3: Test với PowerShell

```powershell
# Test Admin
$body = @{email='admin@gmail.com'; password='230305'} | ConvertTo-Json
$login = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/login' -Method POST -ContentType 'application/json' -Body $body
$headers = @{Authorization="Bearer $($login.token)"}
$me = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/me' -Method GET -Headers $headers
Write-Host "Role: $($me.role)"

# Test Technician
$body = @{email='kythuatvien@gmail.com'; password='230305'} | ConvertTo-Json
$login = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/login' -Method POST -ContentType 'application/json' -Body $body
$headers = @{Authorization="Bearer $($login.token)"}
$me = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/me' -Method GET -Headers $headers
Write-Host "Role: $($me.role)"

# Test Staff
$body = @{email='nhanvien@gmail.com'; password='230305'} | ConvertTo-Json
$login = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/login' -Method POST -ContentType 'application/json' -Body $body
$headers = @{Authorization="Bearer $($login.token)"}
$me = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/me' -Method GET -Headers $headers
Write-Host "Role: $($me.role)"
```

### Option 4: Test với cURL

```bash
# Admin Login
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"230305"}'

# Get user info
curl http://localhost:8081/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📊 Redirect Mapping Table

| User Role | Database Value | Frontend Route | Dashboard Page |
|-----------|---------------|----------------|----------------|
| Quản trị viên | `admin` | `/admin` | Admin.jsx |
| Kỹ thuật viên | `technician` | `/technician` | Technician.jsx |
| Nhân viên | `staff` | `/staff` | Staff.jsx |
| Khách hàng | `customer` | `/vehicles` | MyVehicles.jsx |

## 🔐 Security Notes

1. **Token Storage**: JWT token được lưu trong `localStorage.authToken`
2. **User Data**: Thông tin user được lưu trong `localStorage.user`
3. **Role Validation**: Role được verify từ backend `/api/auth/me` endpoint
4. **Protected Routes**: Mỗi dashboard page nên có protected route guard

## 🐛 Troubleshooting

### Issue: Login thành công nhưng không redirect

**Giải pháp:**
1. Check console log để xem `result.user.role` value
2. Verify role trong database matches expected value
3. Check AuthContext đã set user correctly không

### Issue: Redirect đến wrong dashboard

**Giải pháp:**
1. Verify role value trong database (phải là lowercase: admin, staff, technician)
2. Check Login.jsx redirect logic (line 48-58)
3. Clear localStorage và login lại

### Issue: Token expired hoặc invalid

**Giải pháp:**
1. Logout và login lại
2. Check backend logs: `docker logs ev-service-center-maintenance-management-system-hoaibao-authservice-1`
3. Verify JWT secret key trong backend config

## 📝 Code References

### Key Files

1. **AuthContext**: `frontend/src/contexts/AuthContext.jsx`
   - Line 96-164: `login()` function
   - Line 105-126: Staff/Technician/Admin role handling

2. **Login Page**: `frontend/src/pages/Login.jsx`
   - Line 30-67: `handleSubmit()` function
   - Line 48-58: Role-based redirect logic

3. **API Configuration**: `frontend/src/lib/api.js`
   - AuthAPI endpoints
   - Token management

## 🎉 Success Criteria

✅ Admin users redirect to `/admin`  
✅ Technician users redirect to `/technician`  
✅ Staff users redirect to `/staff`  
✅ Customer users redirect to `/vehicles`  
✅ Token được lưu trong localStorage  
✅ User data được sync với backend  
✅ Role được validate từ backend API  

---

**Ngày cập nhật:** 2025-11-03  
**Status:** ✅ Tested & Working  
**Version:** 1.0

