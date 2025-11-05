# 🚀 QUICK REFERENCE: Chat & View Features

## ⚡ **CHẠY HỆ THỐNG NHANH**

```bash
# Terminal 1 - Backend
cd authservice && mvn spring-boot:run

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

**URL:** `http://localhost:3000`  
**Login Admin:** `admin@evservice.com` / `Admin789!`

---

## 📍 **VỊ TRÍ TÍNH NĂNG**

```
Admin Dashboard → Tab "Khách hàng & Xe" → Table → [Xem] [Chat]
```

---

## 🎯 **TÍNH NĂNG "XEM"**

### Click nút "Xem" để thấy:
- ℹ️ Thông tin khách hàng
- 🚗 Danh sách xe (Brand, Model, Biển số)
- 📅 Lịch hẹn gần đây (5 mới nhất)
- 📜 Lịch sử dịch vụ (5 mới nhất)
- 📊 Tổng quan (Số xe, Booking, Chi tiêu)

### Buttons:
- **[Đóng]** → Đóng modal
- **[💬 Chat]** → Chuyển sang Chat

---

## 💬 **TÍNH NĂNG "CHAT"**

### Click nút "Chat" để:
- Mở modal chat
- Gửi tin nhắn cho khách hàng
- Xem lịch sử chat

### Cách gửi tin nhắn:
1. Nhập text vào input box
2. Click **[Gửi]** HOẶC nhấn **Enter**

### Tin nhắn được lưu:
- ✅ Tự động lưu vào localStorage
- ✅ Không mất khi đóng/mở lại
- ✅ Mỗi customer có chat riêng

---

## 🗄️ **DỮ LIỆU**

### LocalStorage Keys:
```
chat_<adminId>_<customerId>
```

### Xóa tất cả chat (Console):
```javascript
Object.keys(localStorage).filter(k => k.startsWith('chat_')).forEach(k => localStorage.removeItem(k))
```

### Setup test data (Console):
1. Copy `setup-test-customers.js`
2. Paste vào Console
3. Enter
4. F5 reload

---

## 🐛 **TROUBLESHOOTING**

| Vấn đề | Giải pháp |
|--------|-----------|
| Modal không mở | F5 reload trang |
| Không có dữ liệu | Chạy `setup-test-customers.js` |
| Tin nhắn không gửi | Check localStorage permission |
| Chat bị mất | Kiểm tra localStorage key |

---

## 🎨 **KEYBOARD SHORTCUTS**

| Phím | Chức năng |
|------|-----------|
| **Enter** | Gửi tin nhắn (khi đang trong chat input) |
| **Esc** | Đóng modal (soon) |
| **F5** | Reload trang |
| **F12** | Mở DevTools |

---

## 📁 **FILES QUAN TRỌNG**

| File | Mô tả |
|------|-------|
| `frontend/src/pages/Admin.jsx` | Source code chính |
| `TEST_CHAT_VIEW.md` | Hướng dẫn test chi tiết |
| `setup-test-customers.js` | Script tạo test data |
| `CHAT_VIEW_FEATURE_COMPLETE.md` | Documentation đầy đủ |
| `DEMO_SCRIPT.md` | Script để demo |

---

## ✅ **CHECKLIST NHANH**

### Trước khi demo/test:
- [ ] Backend running (port 8080)
- [ ] Frontend running (port 3000)
- [ ] Test data loaded
- [ ] Login thành công
- [ ] Vào đúng tab "Khách hàng & Xe"

### Test "Xem":
- [ ] Click nút "Xem"
- [ ] Modal hiển thị đúng
- [ ] Tất cả sections có dữ liệu
- [ ] Nút đóng hoạt động

### Test "Chat":
- [ ] Click nút "Chat"
- [ ] Modal chat hiển thị
- [ ] Gửi tin nhắn thành công
- [ ] Tin nhắn hiển thị đúng
- [ ] Đóng và mở lại vẫn còn tin nhắn

---

## 🎯 **STATUS BADGES**

### Booking Status:
| Màu | Status | Text |
|-----|--------|------|
| 🔲 Xám | `pending` | Chờ tiếp nhận |
| 🔵 Xanh dương | `received` | Đã tiếp nhận |
| 🟡 Vàng | `in_maintenance` | Đang bảo dưỡng |
| 🟢 Xanh lá | `done` | Hoàn tất |

---

## 💡 **TIPS & TRICKS**

### Làm việc hiệu quả:
1. **View trước, Chat sau** - Xem thông tin trước khi chat
2. **Dùng Enter** - Gửi tin nhắn nhanh hơn
3. **Check localStorage** - Debug bằng DevTools
4. **Reload khi cần** - F5 để refresh data

### Best practices:
- ✅ Luôn có data test trước khi demo
- ✅ Test trên nhiều khách hàng
- ✅ Clear cache định kỳ
- ✅ Backup localStorage trước khi test

---

## 📞 **SUPPORT**

### Nếu cần hỗ trợ:
1. Đọc `TEST_CHAT_VIEW.md`
2. Đọc `CHAT_VIEW_FEATURE_COMPLETE.md`
3. Check Console log (F12)
4. Check Network tab
5. Check localStorage

---

## 🎨 **COLOR SCHEME**

| Element | Color |
|---------|-------|
| View Modal Header | White |
| Chat Modal Header | Green Gradient |
| Admin Message | Green (#16a34a) |
| Customer Message | White with border |
| Status Pending | Gray |
| Status Received | Blue |
| Status In Progress | Yellow |
| Status Done | Green |

---

## 📊 **THỐNG KÊ NHANH**

```
Total Lines Added: ~350
Modals: 2
Handlers: 3
State Variables: 6
Features: 8
```

---

## 🚀 **QUICK COMMANDS**

### Frontend commands:
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend commands:
```bash
mvn spring-boot:run     # Run Spring Boot
mvn clean install       # Build project
```

---

**📌 SAVE THIS FOR QUICK ACCESS! 📌**

