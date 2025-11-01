# API Documentation - Maintenance Service

**Base URL:** `http://localhost:8080/api`

**Service Port:** `8080`

---

## 📋 Mục lục

1. [Appointments API](#1-appointments-api)
2. [Service Orders API](#2-service-orders-api)
3. [Vehicles API](#3-vehicles-api)
4. [Services API](#4-services-api)
5. [Parts API](#5-parts-api)
6. [Service Checklists API](#6-service-checklists-api)
7. [Order Items API](#7-order-items-api)
8. [Health & Database API](#8-health--database-api)

---

## 1. Appointments API

**Base Path:** `/api/appointments`

### Endpoints:

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/appointments` | Tạo lịch hẹn mới |
| `GET` | `/api/appointments/{appointmentId}` | Lấy lịch hẹn theo ID |
| `GET` | `/api/appointments/customer/{customerId}` | Lấy danh sách lịch hẹn của khách hàng |
| `GET` | `/api/appointments` | Lấy tất cả lịch hẹn |
| `GET` | `/api/appointments/status/{status}` | Lấy lịch hẹn theo trạng thái (pending, confirmed, cancelled, completed) |
| `PUT` | `/api/appointments/{appointmentId}/confirm` | Xác nhận lịch hẹn |
| `PUT` | `/api/appointments/{appointmentId}/cancel` | Hủy lịch hẹn |
| `PUT` | `/api/appointments/{appointmentId}/complete` | Hoàn thành lịch hẹn |
| `PUT` | `/api/appointments/{appointmentId}` | Cập nhật lịch hẹn |

---

## 2. Service Orders API

**Base Path:** `/api/service-orders`

### Endpoints:

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/service-orders/from-appointment/{appointmentId}` | Tạo phiếu dịch vụ từ lịch hẹn |
| `POST` | `/api/service-orders` | Tạo phiếu dịch vụ trực tiếp |
| `GET` | `/api/service-orders/{orderId}` | Lấy phiếu dịch vụ theo ID |
| `GET` | `/api/service-orders?status={status}` | Lấy phiếu dịch vụ theo trạng thái (optional) |
| `GET` | `/api/service-orders` | Lấy tất cả phiếu dịch vụ |
| `GET` | `/api/service-orders/technician/{technicianId}` | Lấy phiếu dịch vụ của kỹ thuật viên |
| `PUT` | `/api/service-orders/{orderId}/status` | Cập nhật trạng thái phiếu dịch vụ (queued, in_progress, completed, delayed) |
| `PUT` | `/api/service-orders/{orderId}/assign-technician` | Phân công kỹ thuật viên |
| `PUT` | `/api/service-orders/{orderId}/complete` | Hoàn thành phiếu dịch vụ |
| `PUT` | `/api/service-orders/{orderId}/amount` | Cập nhật tổng tiền phiếu dịch vụ |

**Request Body Examples:**

```json
// Update Status
{
  "status": "in_progress"
}

// Assign Technician
{
  "technicianId": 3
}

// Update Amount
{
  "totalAmount": 1500000.00
}
```

---

## 3. Vehicles API

**Base Path:** `/api/vehicles`

### Endpoints:

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/vehicles/{vehicleId}` | Lấy thông tin xe theo ID |
| `GET` | `/api/vehicles/customer/{customerId}` | Lấy danh sách xe của khách hàng |
| `GET` | `/api/vehicles/vin/{vin}` | Lấy xe theo VIN |
| `GET` | `/api/vehicles` | Lấy tất cả xe |
| `GET` | `/api/vehicles/brand/{brand}` | Lấy xe theo hãng |
| `GET` | `/api/vehicles/due-for-service` | Lấy xe cần bảo dưỡng |
| `POST` | `/api/vehicles` | Tạo xe mới |
| `PUT` | `/api/vehicles/{vehicleId}` | Cập nhật thông tin xe |
| `PUT` | `/api/vehicles/{vehicleId}/service-info` | Cập nhật thông tin bảo dưỡng |

---

## 4. Services API

**Base Path:** `/api/services`

### Endpoints:

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/services` | Lấy danh sách dịch vụ (có thể filter theo `?type={type}`) |
| `GET` | `/api/services/{serviceId}` | Lấy dịch vụ theo ID |
| `GET` | `/api/services/type/{type}` | Lấy dịch vụ theo loại (maintenance, repair, inspection, package) |
| `GET` | `/api/services/packages` | Lấy dịch vụ package |
| `GET` | `/api/services/search?name={name}` | Tìm kiếm dịch vụ theo tên |
| `POST` | `/api/services` | Tạo dịch vụ mới |
| `PUT` | `/api/services/{serviceId}` | Cập nhật dịch vụ |

---

## 5. Parts API

**Base Path:** `/api/parts`

### Endpoints:

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/parts` | Lấy danh sách phụ tùng (có thể filter theo `?category={category}`) |
| `GET` | `/api/parts/{partId}` | Lấy phụ tùng theo ID |
| `GET` | `/api/parts/code/{partCode}` | Lấy phụ tùng theo mã |
| `GET` | `/api/parts/category/{category}` | Lấy phụ tùng theo loại |
| `GET` | `/api/parts/manufacturer/{manufacturer}` | Lấy phụ tùng theo nhà sản xuất |
| `GET` | `/api/parts/search?name={name}` | Tìm kiếm phụ tùng theo tên |
| `GET` | `/api/parts/low-stock` | Lấy phụ tùng sắp hết hàng |
| `GET` | `/api/parts/{partId}/inventory` | Kiểm tra tồn kho phụ tùng |
| `POST` | `/api/parts` | Tạo phụ tùng mới |
| `PUT` | `/api/parts/{partId}` | Cập nhật phụ tùng |

---

## 6. Service Checklists API

**Base Path:** `/api/service-checklists`

### Endpoints:

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/service-checklists` | Tạo checklist mới |
| `GET` | `/api/service-checklists` | Lấy tất cả service checklists |
| `GET` | `/api/service-checklists/{checklistId}` | Lấy service checklist theo ID |
| `GET` | `/api/service-checklists/order/{orderId}` | Lấy service checklists theo order ID |
| `PUT` | `/api/service-checklists/{checklistId}` | Cập nhật service checklist |
| `DELETE` | `/api/service-checklists/{checklistId}` | Xóa service checklist |

**Request Body Example:**

```json
// Create Checklist
{
  "orderId": 1,
  "itemName": "Kiểm tra pin",
  "isCompleted": false,
  "notes": "Pin hoạt động bình thường",
  "completedBy": 3
}
```

---

## 7. Order Items API

**Base Path:** `/api/service-orders/{orderId}/items`

### Endpoints:

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/service-orders/{orderId}/items/service` | Thêm dịch vụ vào phiếu |
| `POST` | `/api/service-orders/{orderId}/items/part` | Thêm phụ tùng vào phiếu |
| `GET` | `/api/service-orders/{orderId}/items` | Lấy danh sách items trong phiếu |
| `GET` | `/api/service-orders/{orderId}/items/{itemId}` | Lấy item theo ID |
| `GET` | `/api/service-orders/{orderId}/items/type/{type}` | Lấy items theo loại (service, part) |
| `PUT` | `/api/service-orders/{orderId}/items/{itemId}` | Cập nhật item |
| `DELETE` | `/api/service-orders/{orderId}/items/{itemId}` | Xóa item |

**Request Body Examples:**

```json
// Add Service Item
{
  "serviceId": 1,
  "quantity": 1,
  "unitPrice": 500000.00
}

// Add Part Item
{
  "partId": 1,
  "quantity": 2,
  "unitPrice": 150000.00
}
```

---

## 8. Health & Database API

**Base Path:** `/api`

### Endpoints:

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/health` | Kiểm tra trạng thái service |

---

## 📊 Tổng kết

### Tổng số API endpoints: **~50 endpoints**

### Phân loại theo chức năng:

- **Appointments:** 9 endpoints (CRUD + quản lý trạng thái)
- **Service Orders:** 10 endpoints (CRUD + phân công + hoàn thành)
- **Vehicles:** 9 endpoints (CRUD + tìm kiếm)
- **Services:** 7 endpoints (CRUD + tìm kiếm + filter)
- **Parts:** 9 endpoints (CRUD + tìm kiếm + tồn kho)
- **Service Checklists:** 6 endpoints (CRUD)
- **Order Items:** 7 endpoints (CRUD + filter theo type)

### Trạng thái (Status) values:

- **Appointment Status:** `pending`, `confirmed`, `cancelled`, `completed`
- **Service Order Status:** `queued`, `in_progress`, `completed`, `delayed`
- **Payment Status:** `unpaid`, `paid`, `partially_paid`
- **Service Type:** `maintenance`, `repair`, `inspection`, `package`
- **Item Type:** `service`, `part`

---

## 🔒 CORS Configuration

Tất cả các endpoints đều có `@CrossOrigin(origins = "*")` để cho phép frontend kết nối.

---

## 📝 Lưu ý

1. Tất cả các API đều trả về JSON format
2. Các request body phải có `Content-Type: application/json`
3. Error responses sẽ trả về status code và message
4. Base URL có thể thay đổi tùy theo môi trường (dev/staging/prod)

