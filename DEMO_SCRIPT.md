# 🎬 DEMO SCRIPT: Tính năng Chat & View Customer

## 🎯 **Mục đích:** 
Demo tính năng Chat và Xem chi tiết khách hàng trong Admin Dashboard

**Thời lượng:** 5-7 phút

---

## 📋 **CHUẨN BỊ TRƯỚC KHI DEMO**

### ✅ Checklist:
- [ ] Backend đang chạy (port 8080)
- [ ] Frontend đang chạy (port 3000)
- [ ] Đã setup test data (chạy `setup-test-customers.js`)
- [ ] Đã clear cache browser
- [ ] Đã test 1 lần để chắc chắn mọi thứ hoạt động

### 🖥️ Setup màn hình:
- Browser full screen
- Zoom: 100%
- DevTools đóng (mở nếu cần show localStorage)

---

## 🎬 **SCRIPT DEMO**

### **[00:00 - 00:30] PHẦN 1: GIỚI THIỆU**

**Nói:**
> "Xin chào! Hôm nay tôi sẽ demo 2 tính năng mới trong hệ thống EV Service Center:
> 
> 1. **Xem chi tiết khách hàng** - Xem toàn bộ thông tin, xe, lịch hẹn, lịch sử dịch vụ
> 2. **Chat với khách hàng** - Nhắn tin trực tiếp với khách hàng
> 
> Những tính năng này giúp Admin quản lý và hỗ trợ khách hàng hiệu quả hơn."

**Hành động:**
- Hiển thị trang login
- Trỏ vào logo "EV Service Center"

---

### **[00:30 - 01:00] PHẦN 2: LOGIN & NAVIGATION**

**Nói:**
> "Đầu tiên, tôi sẽ đăng nhập với tài khoản Admin."

**Hành động:**
1. Nhập email: `admin@evservice.com`
2. Nhập password: `Admin789!`
3. Click "Đăng nhập"

**Nói:**
> "Sau khi đăng nhập, bạn thấy Admin Dashboard với banner màu tím đặc trưng.
> Ở đây có Navigation Bar với 3 vai trò: Staff, Technician, và Admin.
> Admin có thể truy cập tất cả các dashboard."

**Hành động:**
- Trỏ vào banner gradient màu tím
- Trỏ vào Navigation tabs
- Trỏ vào Quick Access buttons

---

### **[01:00 - 01:30] PHẦN 3: VÀO TRANG KHÁCH HÀNG**

**Nói:**
> "Bây giờ tôi sẽ vào tab 'Khách hàng & Xe' để quản lý thông tin khách hàng."

**Hành động:**
1. Click tab "Khách hàng & Xe"
2. Scroll để xem bảng

**Nói:**
> "Đây là bảng danh sách khách hàng với các thông tin:
> - Họ tên và email
> - Số xe đã đăng ký
> - Số lần sử dụng dịch vụ
> - Tổng chi phí
> - Và 2 nút quan trọng: **Xem** và **Chat**"

**Hành động:**
- Di chuột qua các cột
- Trỏ vào nút "Xem" và "Chat"

---

### **[01:30 - 04:00] PHẦN 4: DEMO "XEM CHI TIẾT KHÁCH HÀNG"**

**Nói:**
> "Hãy xem chi tiết khách hàng đầu tiên: Trần Vô Hoài Bảo."

**Hành động:**
1. Click nút "Xem" ở khách hàng đầu tiên
2. Chờ modal mở

**Nói:**
> "Modal 'Chi tiết khách hàng' hiển thị đầy đủ thông tin:
> 
> **1. Thông tin cá nhân:**"

**Hành động:**
- Trỏ vào phần Thông tin khách hàng (background xanh)
- Đọc: Họ tên, Email, SĐT, Địa chỉ

**Nói:**
> "**2. Danh sách xe:**
> Khách hàng này có 2 xe điện: Tesla Model 3 và VinFast VF8."

**Hành động:**
- Scroll xuống phần Danh sách xe
- Trỏ vào từng xe
- Chỉ vào biển số, năm sản xuất

**Nói:**
> "**3. Lịch hẹn gần đây:**
> Hiển thị 5 booking mới nhất với mã, dịch vụ, và trạng thái."

**Hành động:**
- Scroll xuống phần Lịch hẹn
- Trỏ vào status badges màu sắc khác nhau
- Giải thích: Xám = Chờ, Xanh = Tiếp nhận, Vàng = Đang làm, Xanh lá = Hoàn tất

**Nói:**
> "**4. Lịch sử dịch vụ:**
> Tất cả các lần bảo dưỡng, sửa chữa đã thực hiện."

**Hành động:**
- Scroll xuống phần Lịch sử dịch vụ
- Trỏ vào chi phí
- Trỏ vào trạng thái

**Nói:**
> "**5. Tóm tắt thống kê:**
> Tổng quan nhanh về khách hàng."

**Hành động:**
- Scroll xuống cuối
- Trỏ vào 3 số liệu: Số xe, Lịch hẹn, Tổng chi tiêu

**Nói:**
> "Ở footer có 2 nút: Đóng và Chat với khách hàng.
> Tôi sẽ click Chat để chuyển sang tính năng nhắn tin."

**Hành động:**
- Trỏ vào 2 nút
- Click "💬 Chat với khách hàng"

---

### **[04:00 - 06:00] PHẦN 5: DEMO "CHAT VỚI KHÁCH HÀNG"**

**Nói:**
> "Modal Chat mở ra với giao diện đẹp mắt, giống app nhắn tin."

**Hành động:**
- Trỏ vào header xanh lá
- Trỏ vào tên và email khách hàng

**Nói:**
> "Hiện tại chưa có tin nhắn nào. Tôi sẽ gửi tin nhắn đầu tiên."

**Hành động:**
1. Nhập: `"Xin chào anh Bảo! Tôi là Admin của EV Service Center."`
2. Click nút "Gửi"

**Nói:**
> "Tin nhắn xuất hiện bên phải với màu xanh lá, kèm thời gian gửi."

**Hành động:**
- Trỏ vào bubble tin nhắn
- Trỏ vào timestamp

**Nói:**
> "Tôi có thể gửi nhanh bằng phím Enter."

**Hành động:**
1. Nhập: `"Xe của anh đã được tiếp nhận và đang bảo dưỡng."`
2. Nhấn Enter (không click nút Gửi)

**Nói:**
> "Tin nhắn gửi ngay lập tức. Hãy gửi thêm vài tin nhắn nữa."

**Hành động:**
1. Nhập: `"Dự kiến hoàn thành trong 2 giờ."`
2. Enter
3. Nhập: `"Anh có câu hỏi gì không?"`
4. Enter

**Nói:**
> "Tất cả tin nhắn được lưu tự động. Nếu tôi đóng và mở lại..."

**Hành động:**
1. Click nút "×" để đóng modal
2. Chờ 2 giây
3. Click lại nút "Chat" của cùng khách hàng

**Nói:**
> "...tất cả tin nhắn vẫn còn đó! Không bị mất."

**Hành động:**
- Scroll trong chat để xem tất cả tin nhắn

---

### **[06:00 - 06:30] PHẦN 6: DEMO NHIỀU KHÁCH HÀNG**

**Nói:**
> "Mỗi khách hàng có chat riêng biệt. Để kiểm tra, tôi sẽ chat với khách hàng khác."

**Hành động:**
1. Đóng modal chat
2. Click "Chat" với khách hàng thứ 2 (Nguyễn Thị B)

**Nói:**
> "Như bạn thấy, đây là cuộc trò chuyện hoàn toàn mới, trống."

**Hành động:**
1. Nhập: `"Xin chào chị B!"`
2. Enter

**Nói:**
> "Dữ liệu không bị trộn lẫn giữa các khách hàng."

**Hành động:**
- Đóng modal

---

### **[06:30 - 07:00] PHẦN 7: KẾT LUẬN**

**Nói:**
> "Vậy là tôi đã demo xong 2 tính năng:
> 
> ✅ **Xem chi tiết khách hàng:** Hiển thị đầy đủ thông tin, xe, booking, lịch sử
> ✅ **Chat với khách hàng:** Nhắn tin trực tiếp, lưu trữ tin nhắn
> 
> **Ưu điểm:**
> - Giao diện đẹp, chuyên nghiệp
> - Dễ sử dụng, trực quan
> - Dữ liệu được lưu trữ an toàn
> - Responsive, hoạt động tốt trên mobile
> 
> **Ứng dụng thực tế:**
> - Admin có thể xem nhanh lịch sử khách hàng
> - Hỗ trợ khách hàng qua chat trực tiếp
> - Theo dõi tình trạng xe và booking
> - Tăng trải nghiệm khách hàng
> 
> Cảm ơn các bạn đã xem!"

**Hành động:**
- Quay lại tab "Khách hàng & Xe"
- Zoom out để thấy toàn bộ bảng
- Kết thúc

---

## 🎨 **LƯU Ý KHI DEMO**

### ✅ **Nên:**
- Nói rõ ràng, từ tốn
- Di chuột chậm để người xem theo dõi
- Pause sau mỗi hành động quan trọng
- Highlight điểm quan trọng bằng cách trỏ chuột
- Smile và tự tin

### ❌ **Không nên:**
- Nói quá nhanh
- Di chuột lung tung
- Skip steps
- Quên giải thích ý nghĩa của tính năng

---

## 🎥 **RECORDING SETTINGS**

### **Phần mềm gợi ý:**
- OBS Studio (free)
- Loom (easy)
- Screen Recording (built-in)

### **Settings:**
- Resolution: 1920x1080 (Full HD)
- Frame rate: 30 FPS
- Bitrate: 2500-5000 kbps
- Audio: Clear microphone

### **Editing:**
- Cắt phần đầu/cuối thừa
- Thêm text highlights nếu cần
- Thêm background music nhẹ nhàng (optional)

---

## 📝 **BACKUP PLAN**

### Nếu có lỗi trong demo:

**Lỗi 1: Modal không mở**
- F5 reload trang
- Nói: "Có vẻ cần refresh, đây là lỗi thường gặp khi develop"

**Lỗi 2: Dữ liệu trống**
- Mở Console (F12)
- Chạy `window.setupTestData()`
- F5 reload

**Lỗi 3: Tin nhắn không gửi**
- Check network tab
- Kiểm tra localStorage permission

---

## ✅ **FINAL CHECKLIST**

Trước khi bắt đầu record:

- [ ] Backend running ✅
- [ ] Frontend running ✅
- [ ] Test data loaded ✅
- [ ] Browser cache cleared ✅
- [ ] Microphone test ✅
- [ ] Screen recorder ready ✅
- [ ] Script đã đọc qua 1 lần ✅
- [ ] Đã test run flow 1 lần ✅
- [ ] Đóng tất cả tabs không cần thiết ✅
- [ ] Disable notifications ✅

---

**LET'S MAKE AN AWESOME DEMO! 🎬🚀**

