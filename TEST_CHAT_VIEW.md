# ✅ HƯỚNG DẪN TEST TÍNH NĂNG CHAT & VIEW CUSTOMER

## 🎯 **Mục tiêu:**
Kiểm tra tính năng **Xem chi tiết khách hàng** và **Chat với khách hàng** trong trang Admin.

---

## 📋 **BƯỚC 1: Khởi động hệ thống**

### Backend (Port 8080):
```bash
cd authservice
mvn spring-boot:run
```

### Frontend (Port 3000):
```bash
cd frontend
npm run dev
```

---

## 🔐 **BƯỚC 2: Login với Admin**

1. Truy cập: `http://localhost:3000`
2. Login với tài khoản Admin:
```
Email: admin@evservice.com
Password: Admin789!
```

---

## 👥 **BƯỚC 3: Test tính năng "XEM"**

### 3.1. Vào trang Khách hàng:
1. Click vào tab **"Khách hàng & Xe"** trong Admin Dashboard
2. Bạn sẽ thấy bảng danh sách khách hàng với các cột:
   - KHÁCH HÀNG (Họ tên + Email)
   - SỐ XE
   - DỊCH VỤ (Số lượng booking)
   - CHI PHÍ
   - **HÀNH ĐỘNG** (Xem | Chat)

### 3.2. Click nút "Xem":
1. Click vào nút **"Xem"** ở bất kỳ khách hàng nào
2. **Modal "Chi tiết khách hàng"** sẽ xuất hiện với:

   ✅ **Thông tin khách hàng:**
   - Họ tên
   - Email
   - Số điện thoại (nếu có)
   - Địa chỉ (nếu có)

   ✅ **Danh sách xe:**
   - Hiển thị tất cả xe của khách hàng
   - Thông tin: Brand, Model, Biển số, Năm sản xuất
   - Trạng thái hoạt động

   ✅ **Lịch hẹn gần đây:**
   - 5 booking mới nhất
   - Mã lịch hẹn
   - Xe, dịch vụ
   - Ngày giờ
   - Trạng thái (Chờ/Tiếp nhận/Đang làm/Hoàn tất)

   ✅ **Lịch sử dịch vụ:**
   - 5 record mới nhất
   - Loại dịch vụ
   - Ngày thực hiện
   - Chi phí
   - Trạng thái

   ✅ **Tóm tắt thống kê:**
   - 📊 Tổng số xe
   - 📅 Tổng số lịch hẹn
   - 💰 Tổng chi tiêu

3. **Test các nút:**
   - Nút **"Đóng"** → Modal sẽ đóng
   - Nút **"💬 Chat với khách hàng"** → Chuyển sang modal Chat

---

## 💬 **BƯỚC 4: Test tính năng "CHAT"**

### 4.1. Mở Chat từ nút "Chat":
1. Click vào nút **"Chat"** ở bất kỳ khách hàng nào
2. **Modal Chat** sẽ xuất hiện

### 4.2. Giao diện Chat:
- 🟢 **Header xanh lá** với tên và email khách hàng
- 💬 **Vùng chat** với background xám nhạt
- ⌨️ **Input box** ở dưới cùng

### 4.3. Test gửi tin nhắn:

**Test Case 1: Gửi tin nhắn bằng nút "Gửi"**
1. Nhập tin nhắn: `"Xin chào! Tôi là Admin"`
2. Click nút **"Gửi"**
3. ✅ Tin nhắn sẽ xuất hiện bên phải (màu xanh lá)
4. ✅ Hiển thị thời gian gửi

**Test Case 2: Gửi tin nhắn bằng phím Enter**
1. Nhập tin nhắn: `"Booking của quý khách đã được xác nhận"`
2. Nhấn phím **Enter**
3. ✅ Tin nhắn sẽ gửi ngay lập tức

**Test Case 3: Gửi nhiều tin nhắn**
1. Gửi 5-10 tin nhắn liên tiếp
2. ✅ Tất cả tin nhắn hiển thị đúng thứ tự
3. ✅ Scroll tự động xuống tin nhắn mới nhất

**Test Case 4: Tin nhắn trống**
1. Không nhập gì, nhấn "Gửi"
2. ✅ Không có gì xảy ra (validation hoạt động)

### 4.4. Đóng và mở lại Chat:
1. Click nút **"×"** để đóng modal
2. Click lại nút **"Chat"** với cùng khách hàng
3. ✅ Tất cả tin nhắn trước đó vẫn còn (đã lưu vào localStorage)

---

## 🔄 **BƯỚC 5: Test luồng kết hợp**

### Scenario: Xem → Chat → Xem
1. Click **"Xem"** khách hàng A → Modal View hiển thị
2. Click **"💬 Chat với khách hàng"** → Chuyển sang Modal Chat
3. Gửi tin nhắn: `"Xe của bạn đã sẵn sàng"`
4. Đóng Chat
5. Click lại **"Xem"** khách hàng A
6. ✅ Thông tin vẫn chính xác

---

## 📊 **BƯỚC 6: Kiểm tra dữ liệu**

### Kiểm tra localStorage:
1. Mở **DevTools** → **Application** → **Local Storage**
2. Tìm key: `chat_<adminId>_<customerId>`
3. ✅ Xem tin nhắn đã lưu đúng format JSON:
```json
[
  {
    "id": 1730812345678,
    "sender": "admin",
    "senderName": "Admin Hoai Bao",
    "text": "Xin chào! Tôi là Admin",
    "timestamp": "2025-11-04T10:30:45.678Z"
  }
]
```

---

## ✅ **BƯỚC 7: Test với nhiều khách hàng**

1. Test **Xem** với 3-5 khách hàng khác nhau
2. Test **Chat** với 3-5 khách hàng khác nhau
3. ✅ Mỗi khách hàng có:
   - Thông tin riêng biệt
   - Chat history riêng biệt
   - Không bị trộn lẫn dữ liệu

---

## 🎨 **BƯỚC 8: Test Responsive Design**

### Desktop (>1024px):
- ✅ Modal View: Width 1024px
- ✅ Modal Chat: Width 672px
- ✅ Tất cả element căn chỉnh đẹp

### Tablet (768px - 1024px):
- ✅ Modal View: Full width với padding
- ✅ Modal Chat: Full width
- ✅ Grid columns tự động điều chỉnh

### Mobile (<768px):
- ✅ Modal chiếm 95% màn hình
- ✅ Scroll hoạt động tốt
- ✅ Buttons không bị che

---

## 🐛 **Checklist Lỗi thường gặp:**

### ❌ Modal không mở:
- Check: `showViewModal` và `showChatModal` state
- Check: Console log có lỗi không

### ❌ Tin nhắn không gửi:
- Check: `newMessage` state
- Check: `handleSendMessage` function
- Check: localStorage permission

### ❌ Dữ liệu không đúng:
- Check: `selectedCustomer` object
- Check: `vehicles`, `bookings`, `records` arrays
- Check: User ID matching

### ❌ Chat history không lưu:
- Check: localStorage key format
- Check: Browser localStorage quota
- Check: JSON.stringify/parse

---

## 📸 **Screenshot Checklist:**

Chụp màn hình để verify:
- [ ] Modal View với đầy đủ thông tin
- [ ] Modal Chat với tin nhắn
- [ ] Nút "Xem" và "Chat" hoạt động
- [ ] Responsive trên mobile
- [ ] localStorage có dữ liệu

---

## ✅ **Kết quả mong đợi:**

### ✨ Tính năng "XEM":
- ✅ Hiển thị đầy đủ thông tin khách hàng
- ✅ Danh sách xe, booking, record chính xác
- ✅ Thống kê số liệu đúng
- ✅ UI đẹp, responsive
- ✅ Chuyển sang Chat mượt mà

### ✨ Tính năng "CHAT":
- ✅ Gửi tin nhắn thành công
- ✅ Hiển thị tin nhắn realtime
- ✅ Lưu trữ tin nhắn vào localStorage
- ✅ Không bị mất tin nhắn khi đóng/mở lại
- ✅ UI chat đẹp, giống app nhắn tin
- ✅ Enter để gửi nhanh

---

## 🚀 **Các câu lệnh hữu ích:**

### Xóa tất cả chat history:
```javascript
// Mở Console DevTools và chạy:
Object.keys(localStorage).filter(k => k.startsWith('chat_')).forEach(k => localStorage.removeItem(k))
```

### Xem tất cả chat conversations:
```javascript
Object.keys(localStorage).filter(k => k.startsWith('chat_')).forEach(k => {
  console.log(k, JSON.parse(localStorage.getItem(k)))
})
```

---

## 📝 **Ghi chú:**

- Chat hiện tại chỉ lưu local (localStorage)
- Để chat realtime thật, cần WebSocket hoặc Firebase
- Tin nhắn từ customer cần implement ở phía Customer Dashboard
- Admin có thể gửi tin nhắn cho tất cả customer

---

**✅ HỆ THỐNG CHAT & VIEW ĐÃ SẴN SÀNG!** 🎉

