# Kiểm thử Customer & Vehicle API bằng BVA kết hợp phân vùng tương đương

**Chủ đề:** Quản lý khách hàng và xe cộ trong hệ thống EV Service Center  
**Phạm vi:** Hồ sơ khách hàng, đăng ký xe, danh sách xe, đặt lịch hẹn, lịch sử lịch hẹn  
**Kỹ thuật:** Phân vùng tương đương kết hợp phân tích giá trị biên  
**Công cụ thực thi:** Postman  
**Số test case sử dụng:** 23 test case

---

## 1. Mục tiêu kiểm thử

1. Kiểm tra API xem và cập nhật hồ sơ khách hàng.
2. Kiểm tra API đăng ký xe điện mới, đặc biệt là VIN và năm sản xuất.
3. Kiểm tra API lấy danh sách xe của khách hàng.
4. Kiểm tra API đặt lịch hẹn với xe, dịch vụ và trung tâm hợp lệ.
5. Áp dụng phân vùng tương đương để chia dữ liệu đầu vào thành các lớp hợp lệ và không hợp lệ.
6. Áp dụng BVA cho các trường có biên rõ ràng như độ dài VIN và năm sản xuất.

---

## 2. Các API được kiểm thử

| Nhóm chức năng | Method | Endpoint | Ý nghĩa |
|---|---|---|---|
| Hồ sơ khách hàng | GET | `/api/customers/profile` | Xem thông tin hồ sơ |
| Hồ sơ khách hàng | PUT | `/api/customers/profile` | Cập nhật hồ sơ |
| Xe của khách hàng | POST | `/api/customers/vehicles` | Đăng ký xe điện mới |
| Xe của khách hàng | GET | `/api/customers/vehicles` | Lấy danh sách xe của khách |
| Xe của khách hàng | PUT | `/api/customers/vehicles/{id}` | Cập nhật toàn bộ xe |
| Xe của khách hàng | PATCH | `/api/customers/vehicles/{id}` | Cập nhật một phần xe |
| Xe của khách hàng | DELETE | `/api/customers/vehicles/{id}` | Xóa xe |
| Đặt lịch | POST | `/api/customers/appointments` | Khách hàng đặt lịch hẹn |
| Lịch sử lịch hẹn | GET | `/api/customers/tracking/history` | Xem lịch sử lịch hẹn |

Base URL khi test bằng Postman:

```http
http://localhost:8090
```

Header chung cho các API customer:

```http
Authorization: Bearer {{token}}
Content-Type: application/json
```

---

## 3. Điều kiện nghiệp vụ và miền giá trị

| Biến/Điều kiện đầu vào | Ý nghĩa | Miền hợp lệ |
|---|---|---|
| `full_name` | Họ tên khách hàng khi cập nhật hồ sơ | Có thể gửi hoặc không gửi; nếu gửi thì cập nhật |
| `phone` | Số điện thoại khi cập nhật hồ sơ | Có thể gửi hoặc không gửi; nếu gửi thì cập nhật |
| `address` | Địa chỉ khi cập nhật hồ sơ | Có thể gửi hoặc không gửi; nếu gửi thì cập nhật |
| `vin` | Mã VIN của xe | Bắt buộc, đúng 17 ký tự, không trùng |
| `brand` | Hãng xe | Bắt buộc, không rỗng |
| `model` | Mẫu xe | Bắt buộc, không rỗng |
| `year` | Năm sản xuất | Bắt buộc, `year >= 2000` |
| `vehicleId` | Xe được dùng để đặt lịch | Tồn tại trong danh sách xe của khách |
| `serviceId` | Dịch vụ được chọn | Tồn tại trong bảng `services` |
| `centerId` | Trung tâm dịch vụ | Bắt buộc tồn tại trong bảng `service_centers` |
| `appointmentDate` | Thời gian đặt lịch | Đúng định dạng ISO `yyyy-MM-ddTHH:mm:ss` |

---

## 4. Phân vùng tương đương

| Conditions | Valid Partitions | Tag | Invalid Partitions | Tag | Valid Boundaries | Tag |
|---|---|---|---|---|---|---|
| Token xác thực | Token hợp lệ của customer | V_AUTH | Thiếu hoặc sai token | X_AUTH | Không áp dụng | - |
| Hồ sơ customer | Có các field hợp lệ để cập nhật | V_PROFILE | Body sai kiểu dữ liệu nghiêm trọng | X_PROFILE | Cập nhật 1 field duy nhất | B_PROFILE_ONE |
| VIN | VIN đúng 17 ký tự và chưa tồn tại | V_VIN | VIN rỗng, VIN khác 17 ký tự, VIN bị trùng | X_VIN_EMPTY, X_VIN_LEN, X_VIN_DUP | Độ dài VIN = 17 | B_VIN_17 |
| Hãng xe/model | `brand`, `model` không rỗng | V_REQUIRED | Thiếu `brand` hoặc `model` | X_REQUIRED | Không áp dụng | - |
| Năm sản xuất | `year >= 2000` | V_YEAR | `year < 2000`, thiếu `year` | X_YEAR_LOW, X_YEAR_NULL | `year = 2000` | B_YEAR_MIN |
| Danh sách xe | Customer có xe hoặc không có xe | V_LIST | Lỗi khi customer chưa có record | X_LIST_SERVER | Danh sách rỗng `[]` | B_LIST_EMPTY |
| Dịch vụ | `serviceId` tồn tại | V_SERVICE | `serviceId` không tồn tại | X_SERVICE | ID dịch vụ tồn tại | B_SERVICE_EXIST |
| Trung tâm | `centerId` tồn tại | V_CENTER | `centerId` null, <= 0, hoặc không tồn tại | X_CENTER | `centerId` nhỏ nhất đang tồn tại | B_CENTER_MIN |
| Ngày giờ lịch hẹn | Đúng định dạng ISO LocalDateTime | V_DATE | Sai định dạng ngày giờ | X_DATE_FORMAT | Giá trị đúng sát định dạng yêu cầu | B_DATE_FORMAT |

---

## 5. Phân tích giá trị biên

| Biến đầu vào | min invalid | min | min+ | nominal | max-/max | max invalid | Tag biên |
|---|---:|---:|---:|---:|---:|---:|---|
| Độ dài `vin` | 16 ký tự | 17 ký tự | 17 ký tự | 17 ký tự | 17 ký tự | 18 ký tự | B_VIN_17, X_VIN_LEN |
| `year` | 1999 | 2000 | 2001 | 2024 | Không giới hạn trên trong code | - | B_YEAR_MIN, X_YEAR_LOW |
| Số field profile gửi lên | 0 field | 1 field | 2 field | 3 field | 3 field | Body sai kiểu | B_PROFILE_ONE |
| Số xe trong danh sách | - | 0 xe | 1 xe | Nhiều xe | Nhiều xe | Lỗi server | B_LIST_EMPTY |
| `centerId` | 0 hoặc không tồn tại | ID tồn tại nhỏ nhất | ID tồn tại tiếp theo | ID tồn tại bất kỳ | ID tồn tại lớn nhất | ID không tồn tại | B_CENTER_MIN, X_CENTER |
| `appointmentDate` | Sai format | Đúng format ISO | Đúng format ISO | `2026-07-01T09:00:00` | Đúng format ISO | Sai format | B_DATE_FORMAT, X_DATE_FORMAT |

Ghi chú:

- `vin` có biên rõ nhất vì code dùng `@Size(min = 17, max = 17)`.
- `year` có biên dưới rõ ràng vì code dùng `@Min(value = 2000)`.
- `centerId` đã được sửa theo nghiệp vụ: khách bắt buộc chọn trung tâm tồn tại, nếu không tồn tại thì trả `400 Bad Request`.

---

## 6. Bảng test case

| STT | Tên test case | API | Input chính | Kết quả mong đợi | Tag được bao phủ |
|---:|---|---|---|---|---|
| 1 | Xem hồ sơ khách hàng | `GET /api/customers/profile` | Token customer hợp lệ | `200 OK`, body có `user_id`, `email`, `full_name`, `role`; nếu có customer thì có `customer_id`, `address` | V_AUTH, V_PROFILE |
| 2 | Cập nhật đầy đủ hồ sơ | `PUT /api/customers/profile` | `full_name`, `phone`, `address` | `200 OK`, cập nhật thành công; gọi lại profile thấy dữ liệu đã đổi | V_PROFILE |
| 3 | Cập nhật một phần hồ sơ | `PUT /api/customers/profile` | Chỉ gửi `phone` | `200 OK`, chỉ field `phone` thay đổi | B_PROFILE_ONE |
| 4 | Đăng ký xe hợp lệ | `POST /api/customers/vehicles` | VIN 17 ký tự, `brand`, `model`, `year = 2024` | `200 OK`, body có `vehicleId`, `vin`, `brand`, `model`, `year` | V_VIN, B_VIN_17, V_REQUIRED, V_YEAR |
| 5 | Đăng ký xe với VIN trùng | `POST /api/customers/vehicles` | Gửi lại VIN đã tồn tại | `400 Bad Request`, body có `error` liên quan VIN | X_VIN_DUP |
| 6 | Đăng ký xe với VIN sai độ dài | `POST /api/customers/vehicles` | `vin = "123"` | `400 Bad Request`, body có `fields.vin` | X_VIN_LEN |
| 7 | Đăng ký xe thiếu field bắt buộc | `POST /api/customers/vehicles` | Thiếu `brand` hoặc `model` | `400 Bad Request`, body có lỗi validation | X_REQUIRED |
| 8 | Đăng ký xe với năm sản xuất nhỏ hơn 2000 | `POST /api/customers/vehicles` | `year = 1999` | `400 Bad Request`, body có lỗi validation `year` | X_YEAR_LOW |
| 9 | Xem danh sách xe của khách hàng có xe | `GET /api/customers/vehicles` | Token customer đã tạo xe | `200 OK`, body là array và có ít nhất 1 xe | V_LIST |
| 10 | Xem danh sách xe khi chưa có xe | `GET /api/customers/vehicles` | Token customer chưa tạo xe | `200 OK`, body là array rỗng `[]` | B_LIST_EMPTY |
| 11 | Đặt lịch hẹn hợp lệ | `POST /api/customers/appointments` | `vehicleId` hợp lệ, `serviceId` tồn tại, `centerId` tồn tại, date đúng format | `201 Created`, body có `success: true`, có `appointmentId` | V_SERVICE, V_CENTER, V_DATE |
| 12 | Đặt lịch với trung tâm không tồn tại | `POST /api/customers/appointments` | `centerId = 999999`, `serviceId` hợp lệ | `400 Bad Request`, body có `success: false`, message trung tâm không tồn tại | X_CENTER |
| 13 | Đặt lịch với sai định dạng ngày giờ | `POST /api/customers/appointments` | `appointmentDate = "01/07/2026 09:00"` | `400` hoặc `500`, không tạo appointment | X_DATE_FORMAT |
| 14 | Cập nhật hồ sơ với body rỗng | `PUT /api/customers/profile` | Body `{}` | `200 OK`, dữ liệu giữ nguyên | B_PROFILE_ONE |
| 15 | Lấy danh sách xe khi không có token | `GET /api/customers/vehicles` | Không gửi Authorization | `401 Unauthorized` | X_AUTH |
| 16 | Đăng ký xe khi không có token | `POST /api/customers/vehicles` | Không gửi Authorization | `401 Unauthorized` | X_AUTH |
| 17 | Cập nhật toàn bộ thông tin xe | `PUT /api/customers/vehicles/{id}` | Dữ liệu xe hợp lệ | `200 OK`, toàn bộ field được cập nhật | V_REQUIRED, V_YEAR |
| 18 | Cập nhật xe không tồn tại | `PUT /api/customers/vehicles/{id}` | `id` không tồn tại | `404 Not Found`, message `Xe không tồn tại` | X_VIN_LEN |
| 19 | Cập nhật một phần hồ sơ xe | `PATCH /api/customers/vehicles/{id}` | Chỉ gửi `odometerKm` hợp lệ | `200 OK`, chỉ `odometerKm` thay đổi | B_LIST_EMPTY |
| 20 | Cập nhật xe với số km sai kiểu | `PATCH /api/customers/vehicles/{id}` | `odometerKm = "hai nghin"` | `400 Bad Request`, message `odometerKm phải là số` | X_PROFILE |
| 21 | Xóa xe hợp lệ | `DELETE /api/customers/vehicles/{id}` | `id` hợp lệ | `200 OK`, trả message xóa thành công | V_LIST |
| 22 | Đặt lịch khi không có token | `POST /api/customers/appointments` | Không gửi Authorization | `401 Unauthorized` | X_AUTH |
| 23 | Xem lịch sử lịch hẹn khi không có token | `GET /api/customers/tracking/history` | Không gửi Authorization | `401 Unauthorized` | X_AUTH |

---

## 7. Dữ liệu Postman gợi ý

### TC04 - Đăng ký xe hợp lệ

```json
{
  "vin": "1HGCM82633A004352",
  "brand": "Tesla",
  "model": "Model 3",
  "year": 2024,
  "batteryCapacityKwh": 75,
  "odometerKm": 1000
}
```

### TC06 - VIN sai độ dài

```json
{
  "vin": "123",
  "brand": "Tesla",
  "model": "Model Y",
  "year": 2024,
  "batteryCapacityKwh": 75,
  "odometerKm": 1000
}
```

### TC08 - Năm sản xuất nhỏ hơn 2000

```json
{
  "vin": "1HGCM82633A004998",
  "brand": "Tesla",
  "model": "Model S",
  "year": 1999,
  "batteryCapacityKwh": 75,
  "odometerKm": 1000
}
```

### TC11 - Đặt lịch hẹn hợp lệ

```json
{
  "vehicleId": {{vehicleId}},
  "serviceId": {{serviceId}},
  "centerId": {{centerId}},
  "appointmentDate": "2026-07-01T09:00:00",
  "notes": "Bảo dưỡng xe"
}
```

### TC12 - Đặt lịch với trung tâm không tồn tại

```json
{
  "vehicleId": {{vehicleId}},
  "serviceId": {{serviceId}},
  "centerId": 999999,
  "appointmentDate": "2026-07-02T10:00:00",
  "notes": "Test centerId không tồn tại"
}
```

### TC13 - Sai format ngày giờ

```json
{
  "vehicleId": {{vehicleId}},
  "serviceId": {{serviceId}},
  "centerId": {{centerId}},
  "appointmentDate": "01/07/2026 09:00",
  "notes": "Sai format ngày giờ"
}
```

### TC19 - Cập nhật một phần hồ sơ xe

```json
{
  "odometerKm": 2000
}
```

### TC20 - Cập nhật xe với số km sai kiểu

```json
{
  "odometerKm": "hai nghin"
}
```

### TC22 - Đặt lịch khi không có token

```json
{
  "vehicleId": 5,
  "serviceId": 1,
  "centerId": 1,
  "appointmentDate": "2026-07-10T09:00:00",
  "notes": "Bao duong xe"
}
```

---

## 8. Postman Tests script mẫu

### Kiểm tra thành công chung

```js
pm.test("Trả về status thành công", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});
```

### Kiểm tra validation VIN

```js
pm.test("VIN sai độ dài trả về 400", function () {
    pm.response.to.have.status(400);
});

pm.test("Có thông báo lỗi VIN", function () {
    const json = pm.response.json();
    pm.expect(json).to.have.property("fields");
    pm.expect(json.fields).to.have.property("vin");
});
```

### Kiểm tra danh sách xe

```js
pm.test("Trả về 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Response là một mảng xe", function () {
    const json = pm.response.json();
    pm.expect(json).to.be.an("array");
});
```

### Kiểm tra cập nhật xe với số km sai kiểu

```js
pm.test("Trả về 400 Bad Request", function () {
    pm.response.to.have.status(400);
});

pm.test("Có thông báo lỗi số km phải là số", function () {
    const json = pm.response.json();
    pm.expect(json.message).to.include("odometerKm phải là số");
});
```

### Kiểm tra đặt lịch với trung tâm không tồn tại

```js
pm.test("Trung tâm không tồn tại trả về 400", function () {
    pm.response.to.have.status(400);
});

pm.test("Response báo lỗi trung tâm không tồn tại", function () {
    const json = pm.response.json();
    pm.expect(json.success).to.eql(false);
    pm.expect(json.message).to.include("Trung tam dich vu khong ton tai");
});
```

---

## 9. Ghi chú về bao phủ

| Nhóm bao phủ | Test case liên quan |
|---|---|
| Token hợp lệ | TC01 đến TC13 |
| Profile hợp lệ và cập nhật từng phần | TC01, TC02, TC03, TC14 |
| VIN hợp lệ, VIN trùng, VIN sai biên độ dài | TC04, TC05, TC06 |
| Field bắt buộc của xe | TC07 |
| Biên năm sản xuất | TC08 |
| Danh sách xe có dữ liệu và rỗng | TC09, TC10 |
| Cập nhật toàn bộ xe | TC17 |
| Xe không tồn tại | TC18 |
| Cập nhật một phần xe | TC19 |
| Cập nhật số km sai kiểu | TC20 |
| Xóa xe hợp lệ | TC21 |
| Đặt lịch hợp lệ | TC11 |
| Trung tâm không tồn tại | TC12 |
| Sai format ngày giờ | TC13 |
| Thiếu token | TC15, TC16, TC22, TC23 |

