# Hướng Dẫn Rebuild và Test Parts CRUD

## ✅ Rebuild Đã Hoàn Thành

Docker đã được rebuild thành công với các thay đổi:

### 1. Frontend Updates
- ✅ Modal thêm phụ tùng mới
- ✅ Modal chỉnh sửa phụ tùng  
- ✅ Nút Edit và Delete cho mỗi phụ tùng
- ✅ Xác nhận trước khi xóa
- ✅ Toast notifications

### 2. API Gateway Updates
- ✅ Thêm PUT routing cho `/api/staff/**`
- ✅ Thêm DELETE routing cho `/api/staff/**`
- ✅ Debug logging

---

## 🔄 Làm Mới Trình Duyệt

**Frontend đã được rebuild nhưng trình duyệt có thể đang cache phiên bản cũ.**

### Cách Hard Refresh:

#### Windows/Linux:
- **Chrome/Edge**: `Ctrl + Shift + R` hoặc `Ctrl + F5`
- **Firefox**: `Ctrl + Shift + R`

#### macOS:
- **Chrome/Edge**: `Cmd + Shift + R`
- **Firefox**: `Cmd + Shift + R`
- **Safari**: `Cmd + Option + R`

### Hoặc Clear Cache Thủ Công:

1. Mở Developer Tools (`F12`)
2. Right-click vào nút Refresh
3. Chọn "**Empty Cache and Hard Reload**"

---

## 🧪 Test Chức Năng

Sau khi hard refresh, test các chức năng sau:

### 1. Thêm Phụ Tùng Mới
1. Click nút "**+ Thêm phụ tùng**" (màu xanh)
2. Modal sẽ hiện ra với form đầy đủ
3. Điền thông tin và click "Thêm"
4. Toast notification hiện "Thêm thành công"
5. Danh sách tự động refresh

### 2. Chỉnh Sửa Phụ Tùng
1. Click nút "**Edit**" (màu xanh nhạt) trên bất kỳ phụ tùng nào
2. Modal hiện ra với dữ liệu đã điền sẵn
3. Thay đổi thông tin và click "Cập nhật"
4. Toast notification hiện "Cập nhật thành công"
5. Dữ liệu cập nhật ngay lập tức

### 3. Xóa Phụ Tùng
1. Click nút "**Delete**" (màu đỏ) trên bất kỳ phụ tùng nào
2. Dialog xác nhận hiện ra
3. Click "Xóa" để confirm
4. Toast notification hiện "Xóa thành công"
5. Phụ tùng biến mất khỏi danh sách

---

## 🐛 Nếu Vẫn Không Hoạt Động

### Kiểm tra Browser Console:

1. Mở Developer Tools (`F12`)
2. Vào tab "**Console**"
3. Xem có lỗi màu đỏ không

### Kiểm tra Network Tab:

1. Mở Developer Tools (`F12`)
2. Vào tab "**Network**"
3. Test một chức năng (vd: thêm phụ tùng)
4. Xem request có status code nào:
   - ✅ **200**: Success
   - ✅ **201**: Created  
   - ❌ **404**: Not Found (routing issue)
   - ❌ **500**: Server Error
   - ❌ **503**: Service Unavailable

---

## 🔧 Test API Trực Tiếp

### Test qua StaffService (Port 8083) - Luôn hoạt động:
```powershell
# GET all parts
Invoke-RestMethod -Uri "http://localhost:8083/api/staff/parts" -Method Get | Select-Object -First 3

# Test CRUD với script
.\test-parts-crud-simple.ps1
```

### Test qua API Gateway (Port 8080) - Nếu có vấn đề:
```powershell
# GET all parts  
Invoke-RestMethod -Uri "http://localhost:8080/api/staff/parts" -Method Get | Select-Object -First 3

# Full CRUD test
.\test-parts-crud-with-delete.ps1
```

---

## ✅ Expected Results

Sau khi hard refresh, bạn sẽ thấy:

1. Nút "**+ Thêm phụ tùng**" hoạt động (không còn alert "sẽ được bổ sung")
2. Mỗi phụ tùng có 2 nút:
   - **Edit** (màu xanh nhạt với icon bút)
   - **Delete** (màu đỏ với icon thùng rác)
3. Tất cả modal và dialog hoạt động mượt mà
4. Toast notifications hiện khi thực hiện actions

---

## 📊 Verification

### Services đang chạy:
```
✅ MySQL (port 3306)
✅ AuthService (port 8081)  
✅ CustomerService (port 8082)
✅ StaffService (port 8083)
✅ PaymentService (port 8084)
✅ API Gateway (port 8080)
✅ Frontend (port 3000)
```

### Files đã thay đổi:
```
✅ frontend/src/pages/Staff.jsx (updated)
✅ frontend/src/pages/Staff-PartModals.jsx (new file)  
✅ evservicecenter/.../GatewayController.java (updated)
```

---

## 🚀 Nếu Mọi Thứ OK

Chúc mừng! Hệ thống Parts CRUD đã hoàn tất và sẵn sàng sử dụng!

Các tính năng bổ sung có thể implement:
- Bulk delete (xóa nhiều cùng lúc)
- Export/Import Excel
- Advanced filtering  
- Stock alerts
- Usage history

---

**Created:** November 5, 2025  
**Status:** ✅ Ready for Testing

