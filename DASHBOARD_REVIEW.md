# Rà soát Dashboard - Trang Staff

## 📋 Tổng quan

Bản rà soát này kiểm tra việc lấy dữ liệu và tính toán thống kê trong Dashboard của trang Staff.

---

## ✅ 1. API Calls trong loadData()

### Các API được gọi:

```javascript
const [appts, custs, vehs, techs, assigns, receipts, reports, partsData, partReqs, servicesData, serviceOrders] = await Promise.all([
  staffAPI.getAppointments(),           // ✅ Đúng - lấy từ Staff Service
  staffAPI.getCustomers(),             // ✅ Đúng
  staffAPI.getVehicles(),              // ✅ Đúng
  staffAPI.getTechnicians(),            // ✅ Đúng
  staffAPI.getAssignments(),            // ✅ Đúng (legacy)
  staffAPI.getServiceReceipts(),        // ✅ Đúng
  staffAPI.getMaintenanceReports(),     // ✅ Đúng
  staffAPI.getParts(),                  // ✅ Đúng
  staffAPI.getPartRequests(),           // ✅ Đúng
  customerAPI.getServices(),            // ✅ Đúng - lấy danh sách services
  maintenanceAPI.getServiceOrders()     // ✅ Đúng - lấy từ Maintenance Service
])
```

### ✅ Kết luận:
- **Tất cả API calls đều đúng** và lấy từ đúng service
- Có error handling cho `maintenanceAPI.getServiceOrders()` (trả về [] nếu lỗi)
- Dữ liệu được transform từ snake_case sang camelCase

---

## 📊 2. Logic tính toán dashboardStats

### 2.1. Hôm nay (todayAppointments)
```javascript
const todayAppointments = appointments.filter(a => {
  const apptDate = new Date(a.appointmentDate).toISOString().split('T')[0]
  return apptDate === today
})
```
**✅ Đúng:** Filter appointments theo ngày hôm nay

### 2.2. Đang xử lý (inProgressAppointments)
```javascript
const inProgressOrders = serviceOrders.filter(so => {
  const normalized = normalizeServiceOrderStatus(so.status)
  return normalized === 'IN_PROGRESS' || normalized === 'QUEUED'
})
inProgressAppointments: inProgressOrders.length
```
**✅ Đúng:** 
- Dùng helper function `normalizeServiceOrderStatus()` để xử lý status
- Chỉ đếm service orders với status IN_PROGRESS hoặc QUEUED
- Không có fallback logic sai

### 2.3. Chờ phê duyệt (pendingReports)
```javascript
pendingReports: maintenanceReports.filter(r => 
  r.status === 'draft' || r.status === 'submitted'
).length
```
**✅ Đúng:** Filter reports với status 'draft' hoặc 'submitted'

### 2.4. Hoàn thành hôm nay (completedToday)
```javascript
completedToday: completedOrders.filter(so => {
  if (so.completedAt) {
    const completedDate = new Date(so.completedAt).toISOString().split('T')[0]
    return completedDate === today
  }
  const apt = appointments.find(a => a.id === so.appointmentId)
  if (!apt) return false
  const apptDate = new Date(apt.appointmentDate).toISOString().split('T')[0]
  return apptDate === today
}).length
```
**✅ Đúng:** 
- Ưu tiên dùng `completedAt` từ service order
- Fallback về `appointmentDate` nếu không có `completedAt`
- Chỉ đếm service orders với status COMPLETED

### 2.5. Phiếu tiếp nhận (totalServiceReceipts)
```javascript
totalServiceReceipts: serviceReceipts.length
```
**✅ Đúng:** Đếm trực tiếp từ array

### 2.6. Phân công KTV (totalAssignments)
```javascript
const assignedOrders = serviceOrders.filter(so => 
  so.assignedTechnicianId && so.assignedTechnicianId !== null && so.assignedTechnicianId !== 0
)
totalAssignments: assignedOrders.length
```
**✅ Đúng:** 
- Chỉ đếm service orders đã được phân công
- Kiểm tra assignedTechnicianId không null và không phải 0

### 2.7. KTV đang làm việc (activeTechnicians)
```javascript
activeTechnicians: new Set(
  assignedOrders
    .filter(so => {
      const normalized = normalizeServiceOrderStatus(so.status)
      return normalized === 'IN_PROGRESS' || normalized === 'QUEUED'
    })
    .map(so => so.assignedTechnicianId)
    .filter(id => id != null && id !== 0)
).size
```
**✅ Đúng:** 
- Đếm unique technicians từ service orders đã phân công và đang xử lý
- Dùng Set để loại bỏ trùng lặp

### 2.8. Báo cáo đã duyệt (approvedReports)
```javascript
approvedReports: maintenanceReports.filter(r => r.status === 'approved').length
```
**✅ Đúng:** Filter reports với status 'approved'

---

## 🎨 3. Hiển thị trong Dashboard UI

### 3.1. Stats Overview (4 cards)
- ✅ Hôm nay: `{dashboardStats.todayAppointments}`
- ✅ Đang xử lý: `{dashboardStats.inProgressAppointments}`
- ✅ Chờ phê duyệt: `{dashboardStats.pendingReports}`
- ✅ Hoàn thành: `{dashboardStats.completedToday}`

### 3.2. Status Breakdown
- ✅ Trạng thái lịch hẹn: Hiển thị pending, confirmed, received, inProgress
- ✅ Tổng quan công việc: Hiển thị totalServiceReceipts, totalAssignments, activeTechnicians, approvedReports

---

## ⚠️ 4. Các vấn đề tiềm ẩn

### 4.1. Performance
- **Vấn đề:** Tất cả API trả về TẤT CẢ records, không filter
- **Ảnh hưởng:** Nếu có nhiều dữ liệu, frontend phải filter ở client-side
- **Giải pháp:** (Tùy chọn) Thêm filter parameters vào API để tối ưu

### 4.2. Data Consistency
- **Vấn đề:** `completedToday` có thể không chính xác nếu `completedAt` không được set
- **Giải pháp:** Đảm bảo backend luôn set `completedAt` khi service order completed

### 4.3. Error Handling
- **✅ Tốt:** Có error handling cho `maintenanceAPI.getServiceOrders()`
- **⚠️ Cần cải thiện:** Các API khác không có error handling riêng, nếu một API fail thì toàn bộ loadData() sẽ fail

---

## ✅ 5. Kết luận

### Điểm mạnh:
1. ✅ Tất cả API calls đều đúng và lấy từ đúng service
2. ✅ Logic tính toán chính xác, đã sử dụng helper functions
3. ✅ Không có fallback logic sai
4. ✅ Status mapping đã được chuẩn hóa
5. ✅ UI hiển thị đúng các giá trị từ dashboardStats

### Cần cải thiện:
1. ⚠️ Error handling: Nên xử lý lỗi từng API riêng biệt
2. ⚠️ Performance: Có thể tối ưu bằng cách filter ở backend
3. ⚠️ Data validation: Nên validate dữ liệu trước khi tính toán

---

## 🔧 Đề xuất cải thiện

### 1. Cải thiện Error Handling
```javascript
const loadData = async () => {
  setLoading(true)
  setError(null)
  try {
    const results = await Promise.allSettled([
      staffAPI.getAppointments(),
      staffAPI.getCustomers(),
      // ... other APIs
    ])
    
    // Xử lý từng kết quả, không fail toàn bộ nếu một API fail
    const appts = results[0].status === 'fulfilled' ? results[0].value : []
    const custs = results[1].status === 'fulfilled' ? results[1].value : []
    // ...
  } catch (err) {
    // Handle error
  }
}
```

### 2. Thêm Data Validation
```javascript
const dashboardStats = useMemo(() => {
  // Validate data before calculation
  if (!Array.isArray(appointments) || !Array.isArray(serviceOrders)) {
    return defaultStats
  }
  // ... rest of calculation
}, [appointments, serviceOrders, ...])
```

### 3. Thêm Loading States riêng
- Hiển thị loading state cho từng phần của dashboard
- Không block toàn bộ UI khi một API đang load

---

## 📝 Checklist

- [x] API calls đúng và đầy đủ
- [x] Logic tính toán chính xác
- [x] Status mapping đã chuẩn hóa
- [x] UI hiển thị đúng
- [ ] Error handling từng API
- [ ] Data validation
- [ ] Performance optimization

