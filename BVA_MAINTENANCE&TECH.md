# Assignment: BVA kết hợp phân vùng tương đương cho 4 API Maintenance & Tech

**Phạm vi:** Phân hệ 03 - Quản lý Bảo dưỡng & Kỹ thuật  
**Số testcase:** 29  
**Mục tiêu:** Thiết kế testcase theo phương pháp **Equivalence Partitioning** kết hợp **Boundary Value Analysis / Robustness BVA** cho các API đã được viết unit test.

---

## 1. Mục tiêu bài làm

1. Xác định các lớp tương đương hợp lệ và không hợp lệ cho từng API.
2. Xác định các điểm biên quan trọng trong logic xử lý của controller.
3. Gắn tag cho từng lớp, từng biên và từng testcase để dễ theo dõi.
4. Liên kết trực tiếp với 29 unit test đã thực hiện trong `StaffControllerTest`.

---

## 2. Phạm vi kiểm thử

Các API đã được kiểm thử:

- `POST /api/staff/service-receipts`
- `POST /api/staff/assignments`
- `PUT /api/staff/checklists/{id}`
- `POST /api/staff/maintenance-reports`

### Giả định chung

1. Kiểm thử tập trung vào logic trong `StaffController`.
2. Các trường số như `appointment_id`, `technician_id`, `assignmentId`, `vehicleId` được kiểm tra theo kiểu tồn tại, định dạng và ràng buộc logic trong code.
3. `assignment_date` được hiểu là chuỗi ngày giờ ISO-8601.
4. `workPerformed` không được rỗng trắng.
5. `laborHours` nếu sai định dạng thì hệ thống bỏ qua, không làm fail request.

---

## 3. Phân vùng tương đương

### 3.1. API `POST /api/staff/assignments`

| Conditions | Valid Partitions | Tag | Invalid Partitions | Tag |
|---|---|---|---|---|
| `technician_id` | Có giá trị số, tồn tại, đúng role technician | V1 | Thiếu `technician_id` | X1 |
| `technician_id` |  |  | Sai format, không ép được sang số | X2 |
| `technician_id` |  |  | Tồn tại nhưng role không phải technician | X3 |
| `appointment_id` / `receipt_id` | Có `appointment_id` hợp lệ | V2 | Thiếu cả `appointment_id` và `receipt_id` | X4 |
| `appointment_id` | Tồn tại trong DB | V3 | Không tìm thấy appointment | X5 |
| `appointment_id` |  |  | Sai format | X6 |
| `receipt_id` | Mã SR hợp lệ và tìm được receipt | V4 | Không tìm thấy receipt | X7 |
| `appointment_id` | Chưa từng được phân công | V5 | Đã được phân công | X8 |
| `assignment_date` | Đúng format ISO | V6 | Sai format, hệ thống fallback sang now | B1 |

### 3.2. API `POST /api/staff/service-receipts`

| Conditions | Valid Partitions | Tag | Invalid Partitions | Tag |
|---|---|---|---|---|
| `appointment_id` | Có giá trị số hợp lệ | V7 | Thiếu `appointment_id` | X9 |
| `vehicle_id` | Có giá trị số hợp lệ | V8 | Thiếu `vehicle_id` | X10 |
| `odometer_reading` | Có giá trị số hợp lệ | V9 | Thiếu `odometer_reading` | X11 |
| `appointment_id` | Chưa có phiếu tiếp nhận | V10 | Đã có phiếu tiếp nhận | X12 |
| Optional fields | `fuel_level`, `exterior_condition`, `interior_condition`, `customer_complaints`, `estimated_completion` có thể có hoặc không | V11 | Dữ liệu optional không đúng kiểu mong đợi | X13 |

### 3.3. API `PUT /api/staff/checklists/{id}`

| Conditions | Valid Partitions | Tag | Invalid Partitions | Tag |
|---|---|---|---|---|
| `id` | Checklist id số tồn tại | V12 | Không tìm thấy checklist | X14 |
| `id` | Receipt number dạng `SR-...` tìm được receipt | V13 | Receipt không tồn tại | X15 |
| `id` | Receipt id số tìm được receipt và assignment | V14 | Receipt có nhưng chưa phân công | X16 |
| `checklist` | Tìm được checklist theo assignmentId | V15 | Không có checklist tương ứng | X17 |
| `batterySoh` / `battery_health` | Có hoặc không có, nếu có thì map đúng | V16 | Sai kiểu dữ liệu gây lỗi parse | X18 |
| `voltage` | Có giá trị số hợp lệ | V17 | Sai format số | X19 |
| `brakeCondition` / `brakeSystem` | Có hoặc không có, map đúng | V18 | Không có dữ liệu map | X20 |

### 3.4. API `POST /api/staff/maintenance-reports`

| Conditions | Valid Partitions | Tag | Invalid Partitions | Tag |
|---|---|---|---|---|
| `vehicleId` / `vehicle_id` | Có giá trị số hợp lệ | V19 | Thiếu `vehicleId` | X21 |
| `assignmentId` / `assignment_id` | Có assignmentId hợp lệ | V20 | Thiếu cả `assignmentId` và `appointmentId` | X22 |
| `appointmentId` / `appointment_id` | Có appointmentId hợp lệ và assignment tồn tại/tự tạo được | V21 | Appointment không tồn tại | X23 |
| `workPerformed` / `work_performed` | Có nội dung không rỗng | V22 | Thiếu `workPerformed` | X24 |
| `workPerformed` | Chuỗi trắng thì fallback sang default | B2 | Chuỗi rỗng/blank | B3 |
| `partsUsed` / `issuesFound` / `recommendations` | Có hoặc không có | V23 | Sai kiểu dữ liệu | X25 |
| `laborHours` / `labor_hours` | Số hợp lệ | V24 | Sai format, hệ thống bỏ qua | B4 |

---

## 4. Giá trị biên / điểm biên logic

### 4.1. Biên logic của `assignment_date`

| Biên | Giá trị | Ý nghĩa | Tag |
|---|---|---|---|
| Hợp lệ | `2026-07-01T09:00:00` | Parse được | B1-V |
| Không hợp lệ | `invalid-date` | Không parse được, fallback sang `now()` | B1-X |

### 4.2. Biên logic của `workPerformed`

| Biên | Giá trị | Ý nghĩa | Tag |
|---|---|---|---|
| Hợp lệ | `"Work done"` | Nội dung hợp lệ | B2-V |
| Biên không hợp lệ | `"   "` | Blank, hệ thống đổi sang mặc định | B3-X |

### 4.3. Biên logic của `laborHours`

| Biên | Giá trị | Ý nghĩa | Tag |
|---|---|---|---|
| Hợp lệ | `2.5` | Lưu được vào report | B4-V |
| Không hợp lệ | `"abc"` | Bỏ qua, không làm fail request | B4-X |

### 4.4. Biên logic của `receipt_id`

| Biên | Giá trị | Ý nghĩa | Tag |
|---|---|---|---|
| Dạng SR | `SR-20260602-071738` | Tìm theo receipt number | B5-V |
| Dạng số | `33` | Tìm theo receipt id | B5-V2 |
| Không hợp lệ | `SR-NOTFOUND` | Không tìm thấy receipt | B5-X |

### 4.5. Biên logic của checklist `id`

| Biên | Giá trị | Ý nghĩa | Tag |
|---|---|---|---|
| Dạng số | `72` | Tìm trực tiếp checklist | B6-V |
| Dạng SR | `SR-20260602-071738` | Tìm qua receipt -> assignment -> checklist | B6-V2 |
| Không hợp lệ | `SR-NOTFOUND` | Không tìm thấy checklist | B6-X |

---

## 5. Bảng 29 testcase

| TC | API | Tên testcase | Input chính | Expected | Kỹ thuật | Tag |
|---|---|---|---|---|---|---|
| SR01 | Service Receipt | Tạo phiếu tiếp nhận hợp lệ | đủ `appointment_id`, `vehicle_id`, `odometer_reading` | `200`, có `receipt` | EP | V7, V8, V9, V10 |
| SR02 | Service Receipt | Thiếu dữ liệu optional | chỉ gửi field bắt buộc | `200`, lưu null các field optional | EP | V11 |
| SR03 | Service Receipt | Tạo trùng appointment | dùng lại `appointment_id` đã có phiếu | `400`, báo phiếu đã tồn tại | EP | X12 |
| AS01 | Assignment | Phân công bằng `appointment_id` hợp lệ | `technician_id`, `appointment_id` | `200`, có `assignment` | EP | V1, V2, V3, V5 |
| AS02 | Assignment | Phân công bằng `receipt_id` dạng SR | `receipt_id: SR-...` | `200`, có `assignment` | EP | V1, V4, V5 |
| AS03 | Assignment | Thiếu `technician_id` | bỏ technician | `400` | EP | X1 |
| AS04 | Assignment | `appointment_id` sai format | `"abc"` | `400` | EP | X6 |
| AS05 | Assignment | Technician không tồn tại | id không có trong DB | `400` | EP | X3 |
| AS06 | Assignment | User không phải technician | dùng user role staff/admin | `400` | EP | X3 |
| AS07 | Assignment | Sai format `technician_id` | `"abc"` | `400` | EP | X2 |
| AS08 | Assignment | Thiếu cả `appointment_id` và `receipt_id` | chỉ gửi technician | `400` | EP | X4 |
| AS09 | Assignment | `appointment_id` không tồn tại | appointment id không có trong DB | `400` | EP | X5 |
| AS10 | Assignment | Phân công bằng `receipt_id` số | `receipt_id: 33` | `200`, có `assignment` | EP | V4, V5 |
| AS11 | Assignment | Appointment đã được phân công | gửi lại appointment cũ | `400` | EP | X8 |
| AS12 | Assignment | `assignment_date` sai format | `"invalid-date"` | vẫn `200`, tự set now | BVA/Robustness | B1 |
| CL01 | Checklist | Update checklist bằng mã SR hợp lệ | `batterySoh`, `voltage`, `tireCondition`, `brakeCondition` | `200` | EP | V13, V14, V15, V16, V17, V18 |
| CL02 | Checklist | Update checklist bằng receiptId số | `id = 53` | `200` | EP | V14, V15, V16 |
| CL03 | Checklist | Receipt có nhưng chưa phân công | receipt chưa có assignment | `400` | EP | X16 |
| CL04 | Checklist | Checklist đã có thì update | gọi lại cùng id | `200`, update checklist | EP | V12, V15 |
| CL05 | Checklist | Mã SR không tồn tại | `SR-NOTFOUND` | `404` | EP | X15, X17 |
| MR01 | Maintenance Report | Tạo report bằng `assignmentId` | có `vehicleId`, `assignmentId`, `workPerformed` | `200` | EP | V19, V20, V22 |
| MR02 | Maintenance Report | Dùng field alias | `vehicle_id`, `assignment_id`, `work_performed` | `200` | EP | V19, V20, V22, V23, V24 |
| MR03 | Maintenance Report | Tạo report bằng `appointmentId` chưa có assignment | backend tự tạo assignment | `200` | EP | V19, V21, V22 |
| MR04 | Maintenance Report | Tạo report bằng `appointmentId` đã có assignment | không gửi assignmentId | `200` | EP | V19, V21, V22 |
| MR05 | Maintenance Report | `workPerformed` rỗng | `"   "` | backend set default | BVA/Robustness | B2, B3 |
| MR06 | Maintenance Report | Thiếu assignmentId hoặc appointmentId | chỉ gửi vehicleId và workPerformed | `400` | EP | X22 |
| MR07 | Maintenance Report | Thiếu vehicleId | bỏ vehicle | `400` | EP | X21 |
| MR08 | Maintenance Report | Thiếu workPerformed | bỏ work | `400` | EP | X24 |
| MR09 | Maintenance Report | `laborHours` sai format | `"abc"` | vẫn `200`, bỏ qua labor | BVA/Robustness | B4 |

---

## 6. Mapping unit test sang testcase

| TC | Tên unit test hiện tại | Tag hiển thị trong JUnit |
|---|---|---|
| SR01 | `tc13_createServiceReceipt_createReceipt` | `SR-01 - Tạo phiếu tiếp nhận hợp lệ` |
| SR02 | `tc14_createServiceReceipt_missingOptionalFields` | `SR-07 - Có đầy đủ field optional` |
| SR03 | `tc15_createServiceReceipt_duplicateReceipt` | `SR-02 - Tạo trùng appointment` |
| AS01 | `tc01_createAssignment_fromAppointment` | `AS-01 - Phân công bằng appointment_id hợp lệ` |
| AS02 | `tc02_createAssignment_fromReceiptNumber` | `AS-02 - Phân công bằng receipt_id dạng SR` |
| AS03 | `tc03_createAssignment_missingTechnicianId` | `AS-03 - Thiếu technician_id` |
| AS04 | `tc07_createAssignment_invalidTechnicianIdFormat` | `AS-04 - technician_id sai format` |
| AS05 | `tc05_createAssignment_unknownTechnician` | `AS-05 - Technician không tồn tại` |
| AS06 | `tc06_createAssignment_invalidTechnicianRole` | `AS-06 - User không phải technician` |
| AS07 | `tc04_createAssignment_invalidAppointmentIdFormat` | `AS-11 - appointment_id sai format` |
| AS08 | `tc08_createAssignment_missingAppointmentAndReceipt` | `AS-07 - Thiếu cả appointment_id và receipt_id` |
| AS09 | `tc09_createAssignment_missingAppointment` | `AS-12 - appointment_id không tồn tại` |
| AS10 | `tc10_createAssignment_numericReceiptId` | `AS-13 - Phân công bằng receipt_id số` |
| AS11 | `tc11_createAssignment_duplicateAppointment` | `AS-09 - Appointment đã được phân công` |
| AS12 | `tc12_createAssignment_invalidAssignmentDateFallsBackToNow` | `AS-10 - assignment_date sai format` |
| CL01 | `tc16_updateChecklist_fromReceiptNumber` | `CL-04 - Checklist chưa có thì tự tạo từ mã SR` |
| CL02 | `tc17_updateChecklist_fromNumericReceiptId` | `CL-04 - Checklist chưa có thì tự tạo từ receiptId số` |
| CL03 | `tc18_updateChecklist_receiptWithoutAssignment` | `CL-03 - Receipt có nhưng chưa phân công` |
| CL04 | `tc19_updateChecklist_existingChecklistByNumericId` | `CL-05 - Checklist đã có thì update` |
| CL05 | `tc20_updateChecklist_notFound` | `CL-02 - Mã SR không tồn tại` |
| MR01 | `tc21_createMaintenanceReport_withAssignmentId` | `MR-01 - Tạo report bằng assignmentId` |
| MR02 | `tc22_createMaintenanceReport_aliasFieldNames` | `MR-07 - Có optional fields` |
| MR03 | `tc23_createMaintenanceReport_createAssignmentFromAppointment` | `MR-03 - Tạo report bằng appointmentId chưa có assignment` |
| MR04 | `tc24_createMaintenanceReport_useExistingAssignmentForAppointment` | `MR-02 - Tạo report bằng appointmentId đã có assignment` |
| MR05 | `tc25_createMaintenanceReport_defaultWorkPerformedAndIgnoreInvalidLaborHours` | `MR-06/MR-09 - workPerformed rỗng và laborHours sai format` |
| MR06 | `tc26_createMaintenanceReport_missingAssignmentOrAppointment` | `MR-10 - Thiếu assignmentId hoặc appointmentId` |
| MR07 | `tc27_createMaintenanceReport_missingRequiredFields` | `MR-04 - Thiếu vehicleId` |
| MR08 | `tc28_createMaintenanceReport_missingWorkPerformed` | `MR-05 - Thiếu workPerformed` |
| MR09 | `tc29_createMaintenanceReport_missingAppointmentWhenAutoCreatingAssignment` | `MR-03 - Appointment không tồn tại khi tự tạo assignment` |

---

## 7. Nhận xét

### 7.1. Vì sao đây là kết hợp BVA và phân vùng tương đương

- **Equivalence Partitioning** được dùng cho các trạng thái như:
  - Có/không có `technician_id`, `appointment_id`, `vehicleId`.
  - Tồn tại/không tồn tại trong DB.
  - Đúng/sai format.
  - Đúng/sai role.

- **BVA / Robustness BVA** được dùng cho các điểm giáp ranh logic:
  - `assignment_date` đúng format / sai format.
  - `workPerformed` có nội dung / blank.
  - `laborHours` hợp lệ / không hợp lệ nhưng hệ thống bỏ qua.
  - `receipt_id` dạng số / dạng SR / không tìm thấy.

### 7.2. Giá trị của tag

Tag giúp liên kết giữa:

- lớp tương đương,
- điểm biên,
- testcase,
- và unit test thực tế.

Nhờ đó dễ kiểm tra độ bao phủ khi chạy JaCoCo / SonarQube.

---

## 8. Các nhánh `if/else` liên quan đến testcase

### 8.1. `POST /api/staff/assignments`

| Nhánh `if` trong code | Ý nghĩa | TC bao phủ |
|---|---|---|
| `if (request == null)` | Request rỗng | TC phụ ngoài bảng |
| `if (request.get("technician_id") != null)` / `else` | Có hoặc thiếu `technician_id` | AS03, AS07 |
| `catch (NumberFormatException)` khi parse `technician_id` | Sai format `technician_id` | AS07 |
| `if (technician == null)` | Không tìm thấy technician | AS05 |
| `if (!UserRole.technician.equals(...))` | User không phải technician | AS06 |
| `if (request.get("appointment_id") != null)` / `else if (request.get("receipt_id") != null)` / `else` | Chọn nguồn lấy appointment | AS01, AS02, AS08 |
| `catch (NumberFormatException)` khi parse `appointment_id` | Sai format `appointment_id` | AS04 |
| `catch (NumberFormatException)` khi parse `receipt_id` | receipt_id dạng SR thay vì số | AS02 |
| `if (receipt == null)` | Không tìm thấy receipt | TC phụ ngoài bảng / mở rộng |
| `if (appointment == null)` | Không tìm thấy appointment | AS09 |
| `if (assignmentRepository.findByAppointmentId(...).isPresent())` | Appointment đã có assignment | AS11 |
| `if (request.get("assignment_date") != null)` / `else` | Có/không có assignment_date | AS12 |
| `catch (Exception e)` khi parse assignment_date | Sai format ngày giờ | AS12 |
| `if (request.containsKey("notes") && request.get("notes") != null)` | Có notes thì set notes | AS01 |

### 8.2. `POST /api/staff/service-receipts`

| Nhánh `if` trong code | Ý nghĩa | TC bao phủ |
|---|---|---|
| `if (serviceReceiptRepository.findByAppointmentId(...).isPresent())` | Phiếu tiếp nhận đã tồn tại | SR03 |
| `if (request.containsKey("fuel_level"))` | Có fuel level | SR01 |
| `if (request.containsKey("exterior_condition"))` | Có condition ngoại thất | SR01 |
| `if (request.containsKey("interior_condition"))` | Có condition nội thất | SR01 |
| `if (request.containsKey("customer_complaints"))` | Có complaints | SR01 |
| `if (request.containsKey("estimated_completion"))` | Có thời gian dự kiến hoàn tất | SR01 |

### 8.3. `PUT /api/staff/checklists/{id}`

| Nhánh `if` trong code | Ý nghĩa | TC bao phủ |
|---|---|---|
| `try { Long.valueOf(id) } catch (...)` | Phân biệt id số và mã SR | CL01, CL05 |
| `if (checklist == null)` sau khi tìm theo checklistId | Không có checklist trực tiếp | CL02, CL05 |
| `if (receipt != null)` khi id là số | Dùng receipt id số | CL02 |
| `if (assignment != null)` | Có assignment liên quan | CL01, CL02 |
| `else return badRequest` | Receipt có nhưng chưa phân công | CL03 |
| `if (checklist == null)` trước khi tạo mới | Tạo checklist mới nếu chưa có | CL01, CL02 |
| `if (assignmentId != null)` | Có đủ dữ liệu để tạo checklist mới | CL01, CL02 |
| `else return notFound` | Không tìm thấy checklist/receipt phù hợp | CL05 |
| `if (request.containsKey("batterySoh") ...)` / `else if ...` | Map field SOH | CL01, CL02 |
| `if (request.containsKey("voltage") ...)` / `else if ...` | Map voltage | CL01, CL02 |
| `if (request.containsKey("batteryTemperature") ...)` / `else if ...` | Map nhiệt độ pin | CL01 |
| `if (request.containsKey("brakeCondition") ...)` / `else if ...` | Map phanh | CL01, CL02 |
| `if (request.containsKey("tireCondition") ...)` / `else if ...` | Map lốp | CL01 |
| `if (request.containsKey("notes") ...)` | Map notes | CL01 |

### 8.4. `POST /api/staff/maintenance-reports`

| Nhánh `if` trong code | Ý nghĩa | TC bao phủ |
|---|---|---|
| `if (!request.containsKey("vehicleId") && !request.containsKey("vehicle_id"))` | Thiếu vehicleId | MR07 |
| `if (!request.containsKey("workPerformed") && !request.containsKey("work_performed"))` | Thiếu workPerformed | MR08 |
| `if (request.containsKey("assignmentId") || request.containsKey("assignment_id"))` | Có assignmentId trực tiếp | MR01, MR02 |
| `else if (request.containsKey("appointmentId") || request.containsKey("appointment_id"))` | Đi qua appointmentId | MR03, MR04, MR09 |
| `if (existingAssignment.isPresent())` | Dùng assignment có sẵn | MR04 |
| `else` tạo assignment mới | Tự tạo assignment | MR03 |
| `if (workPerformed != null && !workPerformed.trim().isEmpty())` | workPerformed hợp lệ hay blank | MR01, MR05 |
| `if (request.containsKey("partsUsed") || request.containsKey("parts_used"))` | Có partsUsed | MR02 |
| `if (request.containsKey("issuesFound") || request.containsKey("issues_found"))` | Có issuesFound | MR02 |
| `if (request.containsKey("recommendations"))` | Có recommendations | MR02 |
| `if (request.containsKey("laborHours") || request.containsKey("labor_hours"))` | Có laborHours | MR02, MR09 |
| `catch (Exception e)` khi parse laborHours | Sai format laborHours | MR09 |

---

## 9. Gợi ý cách dùng file này trong báo cáo

- Dùng phần **Phân vùng tương đương** để giải thích các lớp input hợp lệ và không hợp lệ.
- Dùng phần **Giá trị biên** để giải thích các điểm sát biên hoặc robustness.
- Dùng phần **29 testcase** để trình bày danh sách kiểm thử.
- Dùng phần **nhánh `if/else`** để chứng minh white-box coverage cho từng testcase.
