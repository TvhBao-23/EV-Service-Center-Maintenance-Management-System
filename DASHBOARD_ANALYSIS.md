# Phân tích Dashboard - Trang Staff

## 📊 Tổng quan

Dashboard hiển thị 4 thống kê chính và 2 breakdown sections. Dưới đây là phân tích chi tiết về logic tính toán và so sánh với dữ liệu từ database.

---

## 🔍 Phân tích từng thống kê

### 1. **Hôm nay** (todayAppointments)

**Logic hiện tại:**

```javascript
const todayAppointments = appointments.filter((a) => {
  const apptDate = new Date(a.appointmentDate).toISOString().split("T")[0];
  return apptDate === today;
});
```

**API Endpoint:**

- `GET /api/staff/appointments` → `findAllByOrderByAppointmentDateDesc()`
- Trả về TẤT CẢ appointments, không filter theo ngày

**✅ Đúng:** Logic filter ở frontend là hợp lý vì:

- API trả về tất cả appointments
- Frontend filter theo `appointmentDate` so với ngày hôm nay
- Không có vấn đề về timezone vì dùng `toISOString().split('T')[0]`

**⚠️ Lưu ý:** Nếu có nhiều appointments, nên filter ở backend để tối ưu performance.

---

### 2. **Đang xử lý** (inProgressAppointments)

**Logic hiện tại:**

```javascript
const inProgressOrders = serviceOrders.filter(
  (so) => so.status === "in_progress" || so.status === "queued"
);
inProgressAppointments: inProgressOrders.length ||
  appointments.filter((a) => a.status === "received").length;
```

**API Endpoints:**

- `GET /api/service-orders` → `getAllServiceOrders()` → `findAll()`
- Trả về TẤT CẢ service orders

**❌ VẤN ĐỀ:**

1. **Fallback logic không chính xác:** Dùng `||` sẽ luôn trả về giá trị truthy đầu tiên. Nếu `inProgressOrders.length = 0`, nó sẽ fallback về `appointments.filter(a => a.status === 'received').length`, điều này không đúng vì:

   - `received` appointments chưa chắc đang được xử lý
   - Nên dùng service orders làm nguồn chính

2. **Status mapping:**
   - Service Order status: `QUEUED`, `IN_PROGRESS`, `COMPLETED`, `DELAYED` (enum)
   - Frontend đang so sánh string: `'in_progress'` vs `'queued'`
   - Cần kiểm tra xem backend trả về enum hay string

**🔧 Cần sửa:**

- Bỏ fallback logic
- Đảm bảo status mapping đúng (uppercase/lowercase)
- Chỉ đếm service orders với status `IN_PROGRESS` hoặc `QUEUED`

---

### 3. **Chờ phê duyệt** (pendingReports)

**Logic hiện tại:**

```javascript
pendingReports: maintenanceReports.filter(
  (r) => r.status === "draft" || r.status === "submitted"
).length;
```

**API Endpoint:**

- `GET /api/staff/maintenance-reports` → `findAllByOrderByCreatedAtDesc()`
- Trả về TẤT CẢ maintenance reports

**✅ Đúng:**

- Logic filter hợp lý
- Status trong database: `draft`, `submitted`, `approved`, `rejected` (string)
- Frontend filter đúng

---

### 4. **Hoàn thành** (completedToday)

**Logic hiện tại:**

```javascript
completedToday: appointments.filter((a) => {
  const apptDate = new Date(a.appointmentDate).toISOString().split("T")[0];
  return apptDate === today && a.status === "completed";
}).length +
  completedOrders.filter((so) => {
    const apt = appointments.find((a) => a.id === so.appointmentId);
    if (!apt) return false;
    const apptDate = new Date(apt.appointmentDate).toISOString().split("T")[0];
    return apptDate === today;
  }).length;
```

**❌ VẤN ĐỀ:**

1. **Double counting:** Có thể đếm trùng nếu:

   - Appointment có status `completed` VÀ có service order `completed`
   - Cả hai đều được đếm

2. **Logic phức tạp:** Nên chỉ đếm service orders completed hôm nay, vì:
   - Service order là nguồn chính xác hơn
   - Appointment status `completed` có thể không đồng bộ với service order

**🔧 Cần sửa:**

- Chỉ đếm service orders với status `COMPLETED` và `completedAt` hôm nay
- Hoặc đếm appointments `completed` hôm nay, nhưng không cộng với service orders

---

## 📋 Breakdown Sections

### A. Trạng thái lịch hẹn

**Logic:**

- `pendingAppointments`: `appointments.filter(a => a.status === 'pending')`
- `confirmedAppointments`: `appointments.filter(a => a.status === 'confirmed')`
- `receivedAppointments`: `appointments.filter(a => a.status === 'received')`
- `inProgressAppointments`: (đã phân tích ở trên)

**✅ Đúng:** Logic filter đơn giản và chính xác

---

### B. Tổng quan công việc

#### 1. **Phiếu tiếp nhận** (totalServiceReceipts)

```javascript
totalServiceReceipts: serviceReceipts.length;
```

**✅ Đúng:** Đếm trực tiếp từ array

#### 2. **Phân công KTV** (totalAssignments)

```javascript
totalAssignments: assignedOrders.length || assignments.length;
```

**❌ VẤN ĐỀ:**

- Fallback logic tương tự như `inProgressAppointments`
- Nên chỉ dùng service orders đã phân công làm nguồn chính
- `assignments` là legacy data, không nên dùng làm fallback

**🔧 Cần sửa:**

- Chỉ đếm service orders có `assignedTechnicianId != null`

#### 3. **KTV đang làm việc** (activeTechnicians)

```javascript
activeTechnicians: new Set(
  assignedOrders
    .filter((so) => so.status === "in_progress" || so.status === "queued")
    .map((so) => so.assignedTechnicianId)
    .filter((id) => id != null)
).size ||
  new Set(
    assignments
      .filter((a) => a.status === "in_progress")
      .map((a) => a.technicianId)
  ).size;
```

**❌ VẤN ĐỀ:**

- Fallback logic tương tự
- Status mapping có thể sai (uppercase/lowercase)

**🔧 Cần sửa:**

- Bỏ fallback
- Đảm bảo status mapping đúng

#### 4. **Báo cáo đã duyệt** (approvedReports)

```javascript
approvedReports: maintenanceReports.filter((r) => r.status === "approved")
  .length;
```

**✅ Đúng:** Logic filter chính xác

---

## 🐛 Các vấn đề tổng hợp

### 1. **Status Mapping**

- Service Order status là ENUM: `QUEUED`, `IN_PROGRESS`, `COMPLETED`, `DELAYED`
- Frontend đang so sánh string lowercase: `'in_progress'`, `'queued'`
- **Cần kiểm tra:** Backend trả về enum hay string? Nếu là enum, cần convert

### 2. **Fallback Logic**

- Nhiều chỗ dùng `||` fallback không chính xác
- Nên bỏ fallback và chỉ dùng nguồn dữ liệu chính xác

### 3. **Double Counting**

- `completedToday` có thể đếm trùng
- Cần quyết định nguồn dữ liệu chính (appointments hay service orders)

### 4. **Performance**

- Tất cả API trả về TẤT CẢ records, không filter
- Frontend phải filter ở client-side
- Nên thêm filter parameters vào API để tối ưu

---

## ✅ Khuyến nghị sửa chữa

1. ✅ **Sửa status mapping:** Đảm bảo so sánh đúng format (uppercase/lowercase) - ĐÃ SỬA
2. ✅ **Bỏ fallback logic:** Chỉ dùng nguồn dữ liệu chính xác - ĐÃ SỬA
3. ✅ **Sửa `completedToday`:** Chỉ đếm service orders completed hôm nay - ĐÃ SỬA
4. ⏳ **Tối ưu API:** Thêm filter parameters để giảm data transfer - CHƯA SỬA
5. ⏳ **Thêm logging:** Log các giá trị tính toán để debug dễ hơn - CHƯA SỬA

## 🔧 Các thay đổi đã thực hiện

### 1. Sửa Status Mapping

- **Trước:** So sánh với `'in_progress'`, `'queued'` (lowercase)
- **Sau:** Convert sang uppercase và so sánh với `'IN_PROGRESS'`, `'QUEUED'`
- **Lý do:** Jackson serialize enum thành enum name (UPPERCASE), không phải database value

### 2. Bỏ Fallback Logic

- **Trước:** `inProgressAppointments: inProgressOrders.length || appointments.filter(...)`
- **Sau:** `inProgressAppointments: inProgressOrders.length`
- **Lý do:** Chỉ dùng service orders làm nguồn chính xác

### 3. Sửa completedToday

- **Trước:** Đếm appointments completed + service orders completed (có thể trùng)
- **Sau:** Chỉ đếm service orders completed, ưu tiên `completedAt`, fallback về `appointmentDate`
- **Lý do:** Tránh double counting, dùng service order làm nguồn chính

### 4. Sửa totalAssignments

- **Trước:** `assignedOrders.length || assignments.length`
- **Sau:** `assignedOrders.length`
- **Lý do:** Chỉ dùng service orders, bỏ legacy assignments

### 5. Sửa activeTechnicians

- **Trước:** Có fallback về legacy assignments
- **Sau:** Chỉ đếm từ service orders với status IN_PROGRESS hoặc QUEUED
- **Lý do:** Đảm bảo tính chính xác và nhất quán

---

## 📝 Checklist kiểm tra

- [ ] Service Order status format (enum vs string)
- [ ] Appointment status values trong database
- [ ] Maintenance Report status values
- [ ] Timezone handling cho date comparison
- [ ] API response format (snake_case vs camelCase)
- [ ] Data consistency giữa appointments và service orders
