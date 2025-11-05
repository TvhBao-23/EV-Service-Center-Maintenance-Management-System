# 🚀 Quick Test Guide - Role-Based Redirect

## ⚡ Fastest Way to Test

### 1️⃣ Khởi động hệ thống
```bash
# Terminal 1: Start backend services
docker-compose up -d

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 2️⃣ Mở browser
```
http://localhost:5173
```

### 3️⃣ Test Login

#### Test Admin 👨‍💼
```
Email: admin@gmail.com
Password: 230305
Expected: Redirect to /admin
```

#### Test Kỹ Thuật Viên 🔧
```
Email: kythuatvien@gmail.com
Password: 230305
Expected: Redirect to /technician
```

#### Test Nhân Viên 👤
```
Email: nhanvien@gmail.com
Password: 230305
Expected: Redirect to /staff
```

## ✅ Success Indicators

1. ✅ Login thành công (không có error message)
2. ✅ URL bar hiển thị đúng route (/admin, /technician, hoặc /staff)
3. ✅ Dashboard tương ứng được load
4. ✅ Sidebar hiển thị đúng menu cho role đó

## 🔍 Debug Commands

### Check Backend Status
```bash
docker ps
docker logs ev-service-center-maintenance-management-system-hoaibao-authservice-1 --tail 50
```

### Quick API Test
```powershell
# Test login endpoint
$body = @{email='admin@gmail.com'; password='230305'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/login' -Method POST -ContentType 'application/json' -Body $body
```

### Check Frontend Console
```
F12 → Console tab
Look for: "Login attempt:", "User info retrieved", etc.
```

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| "Connection refused" | Run `docker-compose up -d` |
| "Invalid credentials" | Check password is exactly `230305` |
| Wrong redirect | Clear localStorage and try again |
| Page blank | Check browser console for errors |

## 📖 Full Documentation
See `ROLE_BASED_REDIRECT_GUIDE.md` for complete technical details.

---
**Last Update:** 2025-11-03  
**Status:** ✅ All Tests Passing

