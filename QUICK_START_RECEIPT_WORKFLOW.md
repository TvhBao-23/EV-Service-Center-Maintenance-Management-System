# 🚀 Quick Start - Receipt Workflow Center

## ⚡ 5 Phút Để Bắt Đầu

---

## 1️⃣ Khởi Động Hệ Thống (1 phút)

```bash
# Đảm bảo Docker đang chạy
docker-compose ps

# Nếu chưa chạy:
docker-compose up -d

# Đợi 20 giây để services khởi động
```

---

## 2️⃣ Đăng Nhập (30 giây)

```
URL: http://localhost:3000/login

Tài khoản Staff:
Email: staff@example.com
Password: staff123
```

---

## 3️⃣ Tạo Phiếu Tiếp Nhận Đầu Tiên (2 phút)

### Bước A: Đi tới Lịch Hẹn
```
Click: Tab "📅 Lịch hẹn"
```

### Bước B: Tìm Lịch Hẹn Đã Xác Nhận
```
Tìm appointment có status: "✅ Đã xác nhận"
Click: Button "Tiếp nhận"
```

### Bước C: Điền Thông Tin
```
Số km hiện tại: 35000
Mức nhiên liệu: 75
Tình trạng xe: good
Ước tính chi phí: 5000000
Ước tính thời gian: 4
Yêu cầu khách hàng: "Kiểm tra pin và thay dầu"
Ghi chú: "Khách VIP"

Click: "Tạo phiếu"
```

---

## 4️⃣ Xem Phiếu Tiếp Nhận (1 phút)

### Chuyển Sang Tab Phiếu Tiếp Nhận
```
Click: Tab "📋 Phiếu tiếp nhận"
```

### Bạn Sẽ Thấy:

```
┌─────────────────────────────────────┐
│ 📝 Phiếu #1                         │
│ [⏳ Chờ phân công] (yellow badge)  │
│ Tạo lúc: 04/11/2025 10:30          │
├─────────────────────────────────────┤
│ 👤 Nguyễn Văn A | 📞 0912345678   │
│ 🚗 Tesla Model 3 | 🔖 29A-12345   │
├─────────────────────────────────────┤
│ 📍 35,000 km | ⛽ 75% | 🔧 good   │
│ 💰 5,000,000 VNĐ                   │
├─────────────────────────────────────┤
│ ⚠️ Yêu cầu: Kiểm tra pin và thay dầu │
│ 📌 Ghi chú: Khách VIP               │
├─────────────────────────────────────┤
│ [⚡ Phân công KTV] [📅] [🖨️]      │
└─────────────────────────────────────┘
```

---

## 5️⃣ Thử Các Tính Năng (1 phút)

### A. Tìm Kiếm
```
Gõ vào ô search: "29A"
→ Phiếu lọc theo biển số
```

### B. Xem Timeline
```
Click: Button "📅 Timeline"
→ Xem lịch sử workflow
```

### C. In Phiếu
```
Click: Button "🖨️ In phiếu"
→ Cửa sổ mới mở ra
→ Click "In phiếu" để in hoặc save PDF
```

### D. Phân Công KTV
```
Click: Button "⚡ Phân công KTV"
→ Chọn kỹ thuật viên
→ Click "Phân công"
→ Card cập nhật với progress bar!
```

---

## 🎯 Các Tính Năng Chính

### 🔍 Tìm Kiếm Thông Minh
- Gõ biển số xe
- Gõ tên khách hàng  
- Gõ số điện thoại
- Kết quả hiện ngay lập tức

### 🏷️ Lọc Theo Trạng Thái
- ⏳ Chờ phân công
- 👷 Đã phân công
- 🔧 Đang sửa
- ✅ Hoàn thành
- 💰 Chờ thanh toán

### 📅 Lọc Theo Thời Gian
- Hôm nay
- 7 ngày qua
- 30 ngày qua
- Tất cả

### 📊 Theo Dõi Tiến Độ
```
Tiến độ công việc        60%
[━━━━━━━━━━━░░░░░░]
👷 KTV Name    ⏱️ 4h
```

### 📅 Timeline Trực Quan
```
📝 → 👷 → 🔧 → ✅ → 💰
```

### 🖨️ In Phiếu Chuyên Nghiệp
- Thông tin đầy đủ
- Định dạng chuẩn
- Sẵn sàng cho khách ký
- Có thể Save PDF

---

## 💡 Mẹo Sử Dụng

### Mẹo 1: Tìm Nhanh
```
Nhớ biển số? → Gõ vào search
Cần lọc theo status? → Dùng dropdown
Cần xem hôm nay? → Chọn "Hôm nay"
```

### Mẹo 2: Xem Timeline
```
Khách hỏi "Xe tôi đang ở đâu?"
→ Click Timeline
→ Thấy ngay các bước đã làm
→ Trả lời khách trong 10 giây!
```

### Mẹo 3: In Phiếu Cho Khách
```
Khách muốn giấy tờ?
→ Click "In phiếu"
→ Save as PDF hoặc In ngay
→ Giao cho khách ký nhận
```

### Mẹo 4: Theo Dõi Quá Giờ
```
Phiếu nào có badge [⚠️ Quá giờ]
→ Ưu tiên xử lý
→ Liên hệ KTV để đẩy nhanh
```

### Mẹo 5: Dùng Counter
```
Nhìn góc trên bên phải:
"📊 Tổng: X phiếu"
→ Biết ngay có bao nhiêu công việc
```

---

## 🎨 Hiểu Màu Sắc

### Màu Badge & Border

| Màu | Trạng Thái | Ý Nghĩa |
|-----|-----------|---------|
| 🟡 Yellow | Chờ phân công | Cần phân công KTV ngay |
| 🔵 Blue | Đã phân công | KTV đã nhận việc |
| 🟣 Purple | Đang sửa | KTV đang làm việc |
| 🟢 Green | Hoàn thành | Công việc xong |
| 🟠 Orange | Chờ thanh toán | Sẵn sàng giao xe |
| 🔴 Red | Quá giờ | CẦN XỬ LÝ NGAY! |

---

## 🔄 Workflow Chuẩn

```
1. Khách đặt lịch
   ↓
2. Staff xác nhận lịch
   ↓
3. Khách đến → Staff TẠO PHIẾU TIẾP NHẬN
   ↓
4. Staff PHÂN CÔNG KTV
   ↓
5. KTV nhận việc và bắt đầu sửa
   ↓
6. KTV hoàn thành → tạo báo cáo
   ↓
7. Staff TẠO HÓA ĐƠN
   ↓
8. Khách thanh toán → Giao xe
```

---

## 🐛 Xử Lý Sự Cố Nhanh

### Không Thấy Phiếu?
```
1. Kiểm tra filter có đang chọn "Tất cả" không?
2. Xóa search box
3. Click "Làm mới"
4. Kiểm tra tab đúng chưa?
```

### Nút Không Click Được?
```
1. Refresh trang (F5)
2. Kiểm tra kết nối mạng
3. Xem console (F12) có lỗi không
4. Restart containers nếu cần
```

### In Phiếu Không Mở?
```
1. Cho phép popup từ localhost
2. Tắt popup blocker
3. Thử trình duyệt khác
```

### Lọc Không Hoạt Động?
```
1. Kiểm tra có data không?
2. Thử clear filters
3. Refresh trang
4. Kiểm tra console
```

---

## 📞 Cần Trợ Giúp?

### Quick Commands
```bash
# Xem logs
docker-compose logs frontend

# Restart frontend
docker-compose restart frontend

# Xem status
docker-compose ps
```

### Kiểm Tra Console
```
1. Bấm F12 trong browser
2. Tab "Console" - xem errors
3. Tab "Network" - xem API calls
```

---

## 📚 Tài Liệu Đầy Đủ

Muốn biết thêm chi tiết?

1. **RECEIPT_WORKFLOW_FEATURES.md**
   - Tất cả tính năng
   - Chi tiết kỹ thuật
   - Hướng dẫn đầy đủ

2. **TEST_RECEIPT_WORKFLOW.md**
   - Hướng dẫn test từng bước
   - 12 kịch bản test
   - Cách xử lý lỗi

3. **IMPLEMENTATION_SUMMARY.md**
   - Tổng quan dự án
   - Những gì đã làm
   - Technical details

---

## 🎯 Checklist Hàng Ngày

### Buổi Sáng
```
[ ] Đăng nhập hệ thống
[ ] Check phiếu "Hôm nay"
[ ] Xem phiếu "⏳ Chờ phân công"
[ ] Phân công KTV cho các phiếu mới
```

### Trong Ngày
```
[ ] Check phiếu "🔧 Đang sửa"
[ ] Xem timeline các phiếu quan trọng
[ ] Liên hệ KTV nếu có phiếu "⚠️ Quá giờ"
[ ] In phiếu cho khách khi cần
```

### Cuối Ngày
```
[ ] Check phiếu "✅ Hoàn thành"
[ ] Tạo hóa đơn cho các phiếu xong
[ ] Review phiếu "💰 Chờ thanh toán"
[ ] Chuẩn bị cho ngày mai
```

---

## 🎉 Xong!

Bây giờ bạn đã biết cách sử dụng **Receipt Workflow Center**!

### Bạn Có Thể:
✅ Tạo phiếu tiếp nhận  
✅ Tìm kiếm và lọc phiếu  
✅ Theo dõi tiến độ  
✅ Xem timeline  
✅ In phiếu cho khách  
✅ Phân công KTV  
✅ Quản lý workflow  

---

## 🚀 Tiếp Theo

1. **Thực hành**: Tạo vài phiếu để quen
2. **Khám phá**: Thử tất cả các nút
3. **Tối ưu**: Tìm workflow phù hợp nhất
4. **Feedback**: Chia sẻ ý kiến để cải thiện

---

**Chúc Bạn Làm Việc Hiệu Quả! 💪**

---

Version: 2.0.0  
Date: November 4, 2025  
Status: Production Ready 🎊

