# Maintenance Service API Documentation

**Base URL:** `http://localhost:8080/api`

## 🎯 Overview

Maintenance Service quản lý toàn bộ quy trình bảo dưỡng xe điện, từ tiếp nhận yêu cầu dịch vụ đến hoàn thành bảo dưỡng.

---

## 1. 🔐 Authentication APIs

### Login

- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "staff@evservice.com",
    "password": "password123"
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Đăng nhập thành công.",
    "user": {
      "id": 1,
      "email": "staff@evservice.com",
      "fullName": "Nguyễn Văn Staff",
      "role": "staff"
    }
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "Email hoặc mật khẩu không đúng."
  }
  ```

---

## 2. 📅 Appointment APIs

| Method | Endpoint                                  | Mô tả                        |
| ------ | ----------------------------------------- | ---------------------------- |
| GET    | `/api/appointments`                       | Lấy tất cả lịch hẹn          |
| GET    | `/api/appointments/{id}`                  | Lấy lịch hẹn theo ID         |
| GET    | `/api/appointments/customer/{customerId}` | Lấy lịch hẹn của khách hàng  |
| GET    | `/api/appointments/status/{status}`       | Lấy lịch hẹn theo trạng thái |
| POST   | `/api/appointments`                       | Tạo lịch hẹn mới             |
| PUT    | `/api/appointments/{id}`                  | Cập nhật lịch hẹn            |
| PUT    | `/api/appointments/{id}/confirm`          | Xác nhận lịch hẹn            |
| PUT    | `/api/appointments/{id}/cancel`           | Hủy lịch hẹn                 |
| PUT    | `/api/appointments/{id}/complete`         | Hoàn thành lịch hẹn          |

**Trạng thái:** `pending`, `confirmed`, `cancelled`, `completed`

---

## 3. 🔧 Service Order APIs

| Method | Endpoint                                               | Mô tả                       |
| ------ | ------------------------------------------------------ | --------------------------- |
| GET    | `/api/service-orders`                                  | Lấy tất cả phiếu bảo dưỡng  |
| GET    | `/api/service-orders?status={status}`                  | Lấy phiếu theo trạng thái   |
| GET    | `/api/service-orders/{orderId}`                        | Lấy phiếu theo ID           |
| GET    | `/api/service-orders/technician/{technicianId}`        | Lấy phiếu của kỹ thuật viên |
| POST   | `/api/service-orders`                                  | Tạo phiếu bảo dưỡng         |
| POST   | `/api/service-orders/from-appointment/{appointmentId}` | Tạo phiếu từ lịch hẹn       |
| PUT    | `/api/service-orders/{orderId}/status`                 | Cập nhật trạng thái         |
| PUT    | `/api/service-orders/{orderId}/assign-technician`      | Phân công kỹ thuật viên     |
| PUT    | `/api/service-orders/{orderId}/complete`               | Hoàn thành phiếu            |
| PUT    | `/api/service-orders/{orderId}/amount`                 | Cập nhật tổng tiền          |

**Trạng thái:** `queued`, `in_progress`, `completed`, `cancelled`, `delayed`

**Example - Phân công kỹ thuật viên:**

```bash
PUT /api/service-orders/1/assign-technician
Body: {"technicianId": 2}
```

**Example - Cập nhật trạng thái:**

```bash
PUT /api/service-orders/1/status
Body: {"status": "in_progress"}
```

---

## 4. ✅ Service Checklist APIs

| Method | Endpoint                                                         | Mô tả                     |
| ------ | ---------------------------------------------------------------- | ------------------------- |
| GET    | `/api/service-orders/{orderId}/checklist`                        | Lấy checklist của phiếu   |
| GET    | `/api/service-orders/{orderId}/checklist/pending`                | Lấy items chưa hoàn thành |
| GET    | `/api/service-orders/{orderId}/checklist/completed`              | Lấy items đã hoàn thành   |
| GET    | `/api/service-orders/{orderId}/checklist/{checklistId}`          | Lấy item theo ID          |
| POST   | `/api/service-orders/{orderId}/checklist`                        | Tạo checklist             |
| POST   | `/api/service-orders/{orderId}/checklist/items`                  | Thêm item mới             |
| PUT    | `/api/service-orders/{orderId}/checklist/{checklistId}`          | Cập nhật item             |
| PUT    | `/api/service-orders/{orderId}/checklist/{checklistId}/complete` | Hoàn thành item           |
| DELETE | `/api/service-orders/{orderId}/checklist/{checklistId}`          | Xóa item                  |

**Example - Tạo checklist:**

```bash
POST /api/service-orders/1/checklist
Body: {
  "items": ["Kiểm tra pin", "Kiểm tra phanh", "Kiểm tra lốp"]
}
```

**Example - Hoàn thành item:**

```bash
PUT /api/service-orders/1/checklist/5/complete
Body: {
  "notes": "Pin hoạt động tốt",
  "completedBy": 2
}
```

---

## 5. 📦 Order Items APIs

| Method | Endpoint                                          | Mô tả                           |
| ------ | ------------------------------------------------- | ------------------------------- |
| GET    | `/api/service-orders/{orderId}/items`             | Lấy danh sách items trong phiếu |
| GET    | `/api/service-orders/{orderId}/items/{itemId}`    | Lấy item theo ID                |
| GET    | `/api/service-orders/{orderId}/items/type/{type}` | Lấy items theo loại             |
| POST   | `/api/service-orders/{orderId}/items/service`     | Thêm dịch vụ vào phiếu          |
| POST   | `/api/service-orders/{orderId}/items/part`        | Thêm phụ tùng vào phiếu         |
| PUT    | `/api/service-orders/{orderId}/items/{itemId}`    | Cập nhật item                   |
| DELETE | `/api/service-orders/{orderId}/items/{itemId}`    | Xóa item                        |

**Loại:** `service`, `part`

**Example - Thêm dịch vụ:**

```bash
POST /api/service-orders/1/items/service
Body: {
  "serviceId": 1,
  "quantity": 1,
  "unitPrice": 500000
}
```

**Example - Thêm phụ tùng:**

```bash
POST /api/service-orders/1/items/part
Body: {
  "partId": 1,
  "quantity": 2,
  "unitPrice": 2500000
}
```

---

## 6. 🚗 Vehicle APIs

| Method | Endpoint                                 | Mô tả                        |
| ------ | ---------------------------------------- | ---------------------------- |
| GET    | `/api/vehicles`                          | Lấy tất cả xe                |
| GET    | `/api/vehicles/{vehicleId}`              | Lấy xe theo ID               |
| GET    | `/api/vehicles/customer/{customerId}`    | Lấy xe của khách hàng        |
| GET    | `/api/vehicles/vin/{vin}`                | Lấy xe theo VIN              |
| GET    | `/api/vehicles/brand/{brand}`            | Lấy xe theo hãng             |
| GET    | `/api/vehicles/due-for-service`          | Lấy xe cần bảo dưỡng         |
| POST   | `/api/vehicles`                          | Tạo xe mới                   |
| PUT    | `/api/vehicles/{vehicleId}`              | Cập nhật thông tin xe        |
| PUT    | `/api/vehicles/{vehicleId}/service-info` | Cập nhật thông tin bảo dưỡng |

---

## 7. 🔩 Parts APIs (Đọc/Tham khảo)

| Method | Endpoint                                     | Mô tả                        |
| ------ | -------------------------------------------- | ---------------------------- |
| GET    | `/api/parts`                                 | Lấy danh sách phụ tùng       |
| GET    | `/api/parts/{partId}`                        | Lấy phụ tùng theo ID         |
| GET    | `/api/parts/code/{partCode}`                 | Lấy phụ tùng theo mã         |
| GET    | `/api/parts/category/{category}`             | Lấy phụ tùng theo danh mục   |
| GET    | `/api/parts/manufacturer/{manufacturer}`     | Lấy phụ tùng theo nhà SX     |
| GET    | `/api/parts/search?query={query}`            | Tìm kiếm phụ tùng            |
| GET    | `/api/parts/low-stock`                       | Lấy phụ tùng sắp hết hàng    |
| GET    | `/api/parts/price-range?min={min}&max={max}` | Lấy phụ tùng theo khoảng giá |
| POST   | `/api/parts`                                 | Tạo phụ tùng mới             |
| PUT    | `/api/parts/{partId}`                        | Cập nhật phụ tùng            |
| DELETE | `/api/parts/{partId}`                        | Xóa phụ tùng                 |

---

## 8. 🛠️ Service (Dịch vụ) APIs

| Method | Endpoint                             | Mô tả                 |
| ------ | ------------------------------------ | --------------------- |
| GET    | `/api/services`                      | Lấy danh sách dịch vụ |
| GET    | `/api/services?type={type}`          | Lấy dịch vụ theo loại |
| GET    | `/api/services/{serviceId}`          | Lấy dịch vụ theo ID   |
| GET    | `/api/services/type/{type}`          | Lấy dịch vụ theo loại |
| GET    | `/api/services/packages`             | Lấy gói dịch vụ       |
| GET    | `/api/services/search?query={query}` | Tìm kiếm dịch vụ      |
| POST   | `/api/services`                      | Tạo dịch vụ mới       |
| PUT    | `/api/services/{serviceId}`          | Cập nhật dịch vụ      |

**Loại:** `maintenance`, `repair`, `inspection`, `package`

---

## 📊 Data Flow

```
1. Customer tạo Appointment (pending)
   ↓
2. Staff xác nhận Appointment (confirmed)
   ↓
3. Staff tạo Service Order từ Appointment
   ↓
4. Staff phân công Technician
   ↓
5. Technician thực hiện Checklist
   ↓
6. Technician thêm Order Items (dịch vụ/phụ tùng)
   ↓
7. Cập nhật tổng tiền
   ↓
8. Hoàn thành Service Order (completed)
```

---

## 🔗 Related Services

- **Auth Service:** Quản lý authentication (tạm thời trong maintenance-service)
- **Parts Service:** Quản lý inventory phụ tùng (service khác đảm nhận)
- **Payment Service:** Xử lý thanh toán (service khác đảm nhận)

---

## 📝 Test Accounts

| Role       | Email                      | Password      |
| ---------- | -------------------------- | ------------- |
| Staff      | `staff@evservice.com`      | `password123` |
| Technician | `technician@evservice.com` | `password123` |

---

## 🧪 Quick Test Commands

### Test Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@evservice.com","password":"password123"}'
```

### Test Get All Service Orders

```bash
curl http://localhost:8080/api/service-orders
```

### Test Assign Technician

```bash
curl -X PUT http://localhost:8080/api/service-orders/1/assign-technician \
  -H "Content-Type: application/json" \
  -d '{"technicianId": 2}'
```

### Test Update Status

```bash
curl -X PUT http://localhost:8080/api/service-orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

---

**Last Updated:** November 2, 2025
