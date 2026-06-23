# BÁO CÁO KẾT QUẢ KIỂM THỬ PHÂN HỆ ADMIN (AdminService)
**Người thực hiện:** Châu Thế Tùng
**Module:** AdminService

---

**Files referenced:**
- `AdminDashboardController`: [backend/adminservice/src/main/java/spring/api/adminservice/api/AdminDashboardController.java](backend/adminservice/src/main/java/spring/api/adminservice/api/AdminDashboardController.java)
- `DashboardService`: [backend/adminservice/src/main/java/spring/api/adminservice/service/DashboardService.java](backend/adminservice/src/main/java/spring/api/adminservice/service/DashboardService.java)

---

**1. Mục tiêu báo cáo**
- Mô tả các endpoint public của `adminservice`, mapping đến logic trong `DashboardService`.
- Thiết kế test cases (EP/BVA + chi tiết test steps) tương tự cấu trúc của `auth.md` để dùng cho kiểm thử tích hợp và regression.

---

**2. YÊU CẦU NGHIỆP VỤ TÓM TẮT (Requirements)**
- REQ-ADM-1: Dashboard summary (counts, revenue, low-stock) được trả bởi `GET /api/admin/dashboard`.
- REQ-ADM-2: Recent activities list được trả bởi `GET /api/admin/activities` (bookings + recent receipts).
- REQ-ADM-3: Health check `GET /api/admin/health`.
- REQ-ADM-4: Staff count `GET /api/admin/staff-count`.

---

**3. KIẾN TRÚC NGẮN (How it works)**
- `AdminDashboardController` (controller layer) gọi `DashboardService` để tập hợp dữ liệu từ downstream services (staffservice, customerservice, paymentservice).
- `DashboardService` sử dụng `RestTemplate` và các base URLs:
  - `STAFF_BASE = http://staffservice:8083/api/staff`
  - `CUSTOMER_BASE = http://customerservice:8082/api/customers`
  - `PAYMENT_BASE = http://paymentservice:8084/api/payments` (lưu ý: service payment thực tế sử dụng `/api/payment`)
- Hành vi quan trọng:
  - Thu thập appointments, vehicles, customers, technicians, parts từ `staffservice`.
  - Tính `lowStockParts` dựa trên `stockQuantity` và `minStockLevel` fields trong response `parts`.
  - Lấy `payments/statistics` từ `customerservice` nếu có; nếu `totalRevenue` == 0 thì fallback tính revenue từ `staffservice/service-receipts`.
  - Sắp xếp recent bookings/receipts theo timestamp (supports `createdAt`, `created_at`, ISO strings, epoch long).

---

**4. RỦI RO & VẤN ĐỀ PHÁT HIỆN (Observations / Known Issues)**
- Endpoint mismatch: `DashboardService` dùng `PAYMENT_BASE` pointing to `/api/payments` (plural) while actual `PaymentController` in `paymentservice` exposes `/api/payment` (singular). Đây là nguồn phổ biến gây 404 trong tích hợp.
- `lowStockParts` logic assumes `stockQuantity` and `minStockLevel` are numeric — if missing or null, code uses default 0; risk: parts with null stock will be counted as low stock (may be unintended).
- Time parsing: `parseTimestamp` falls back to 0 on parse failure; if many items have unparsable timestamps, ordering/limits may be inconsistent.

---

**5. THIẾT KẾ KIỂM THỬ HỘP ĐEN (EP & BVA)**

- Inputs to validate:
  - `service responses`: arrays from `staffservice` endpoints (`/appointments`, `/vehicles`, `/customers`, `/parts`, `/service-receipts`).
  - `payments statistics` from `customerservice` at `/payments/statistics`.

EP (Equivalence Partitioning):
- Payments stats present with positive `totalRevenue` vs absent/zero.
- Parts responses with numeric `stockQuantity` vs missing/null values.
- Bookings list entries with valid timestamps vs missing timestamp fields.

BVA (Boundary Value Analysis):
- Fallback revenue: zero payments stats vs 1 receipt vs many receipts (sum correctness).
- lowStock threshold: stockQuantity = minStockLevel, minStockLevel + 1, 0, null.
- Recent activities limit: boundary at 8 (limit in code) — test when bookings = 7, 8, 9.

**5.1. Áp dụng Standard Boundary Value Analysis**

Đối với `adminservice`, ta áp dụng Standard BVA lên các điều kiện số học quan trọng trong dashboard:

| Biến kiểm thử | Miền giá trị | min | min+ | nominal | max- | max | Ghi chú |
|---|---|---|---|---|---|---|---|
| Số lượng booking trả về | [0, 9+] | 7 | 8 | 9 | 10 | 11 | Giới hạn `recentBookings.limit(8)`
| Số lượng receipt hoàn tất | [0, 4+] | 2 | 3 | 4 | 5 | 6 | Giới hạn `recentCompletedReceipts.limit(3)`
| `stockQuantity` so với `minStockLevel` | [0, cao] | 0 | `minStockLevel` | `minStockLevel+1` | `minStockLevel+2` | `minStockLevel+5` | Kiểm thử ngưỡng low stock
| `totalRevenue` từ payments stats | [0, dương] | 0 | 1 | 100000 | 999999 | 1000000 | Kiểm tra fallback khi revenue = 0 và khi revenue có giá trị đại diện

BVA này giúp chọn các giá trị test ở ranh giới để kiểm tra:
- `GET /api/admin/activities` trả đúng số lượng booking và receipt tối đa.
- `GET /api/admin/dashboard` fallback revenue khi `totalRevenue = 0`.
- `lowStockParts` đánh dấu chính xác tại ngưỡng `stockQuantity == minStockLevel`.

**5.2. Ánh xạ BVA vào các test case**
- ADM-3 sử dụng các giá trị `totalRevenue`: `0` (min) và `100000` (nominal) để xác nhận fallback và giá trị có hiệu lực.
- ADM-4 sử dụng số lượng booking `7`, `8`, `9` để kiểm tra giới hạn recent booking.
- ADM-4 cũng sử dụng số lượng receipt `2`, `3`, `4` để kiểm tra giới hạn recent completed receipts.
- ADM-2 sử dụng các giá trị low stock biên: `stockQuantity = minStockLevel` và `stockQuantity = minStockLevel+1`.

---

**6. TEST CASES (chi tiết giống `auth.md` style)**

| ID | API / Path | Goal | Preconditions | Method | Expected Status | Tag |
|---|---:|---|---|---:|---:|---|
| **ADM-1** | `GET /api/admin/health` | Health check returns OK | Service running | GET | 200 | smoke |
| **ADM-2** | `GET /api/admin/dashboard` | Verify summary fields present (`totalCustomers`, `totalBookings`, `totalParts`, `lowStockParts`, `totalRevenue`) | Seed `staffservice` with known counts; mock `customerservice/payments/statistics` to return a known totalRevenue | GET | 200 | integration, regression |
| **ADM-3** | `GET /api/admin/dashboard` fallback | When `payments/statistics` absent or zero, dashboard computes revenue from `staffservice/service-receipts` | Ensure `payments/statistics` returns 0 or is unavailable; seed 2 receipts with `totalAmount` 100 and 200 | GET | 200; `totalRevenue` = 300 | time-sensitive |
| **ADM-4** | `GET /api/admin/activities` | Recent bookings sorted and limited to 8; receipts limited to 3 | Seed `staffservice/appointments` with timestamps (9 items) and receipts (4 done receipts) | GET | 200; bookings size = 8; receipts size = 3 | boundary |
| **ADM-5** | `GET /api/admin/staff-count` | Returns numeric count from `staffservice` | `staffservice` responds with `{count: N}` | GET | 200; body.count = N | smoke |

For each test case include steps similar to `auth.md`:
- Prepare DB/fixtures or mock downstream responses.
- Acquire admin JWT if controller requires auth (controller currently has no security annotation in source; run in environment where gateway handles auth).
- Call API and assert JSON schema keys and values.

---

**7. KỊCH BẢN CHI TIẾT MẪU (ADM-3 example: revenue fallback)**

Preconditions:
- `customerservice/payments/statistics` returns `{ totalRevenue: 0, pendingPayments: 0 }` OR the endpoint is unreachable.
- `staffservice/service-receipts` contains two receipts with `totalAmount`: 120000, 80000 and `status` = `done`.

Steps:
1. Seed receipts into `staffservice` (or mock endpoint) as above.
2. Call `GET /api/admin/dashboard`.
3. Assert response `totalRevenue` equals 200000.
4. Assert `lowStockParts` value equals expected computed value from `parts` fixture.

Expected:
- HTTP 200 with JSON: `{"totalRevenue":200000,...}`

---

**8. KHUYẾN NGHỊ**
- Đồng bộ tên endpoint thanh toán giữa các service: đổi `DashboardService.PAYMENT_BASE` thành `http://paymentservice:8084/api/payment` hoặc cấu hình gateway rewrite để ánh xạ `/api/payments` về `/api/payment`.
- Làm cho phép tính `lowStockParts` an toàn hơn: dữ liệu `stockQuantity` nếu null hoặc không tồn tại nên được coi là không đủ điều kiện đếm, hoặc cần tài liệu rõ định dạng dữ liệu mong đợi; bổ sung kiểm tra phòng ngừa và logging khi trường dữ liệu thiếu.
- Thêm kiểm thử hợp đồng / tích hợp (`wiremock` hoặc `MockRestServiceServer`) cho `DashboardService` để mô phỏng lỗi và các trường hợp cạnh ở downstream.
- Xem xét inject `Clock` hoặc provider thời gian để các test liên quan đến thời gian trở nên ổn định và có thể lặp lại được.

---

**9. GHI CHÚ TỰ ĐỘNG HÓA**
- Unit tests: sử dụng `MockRestServiceServer` để stub các cuộc gọi đến dịch vụ downstream và kiểm tra hành vi của `DashboardService.getSummary()` và `getRecentActivities()`.
- Integration tests: triển khai các service cục bộ hoặc dùng `testcontainers`; tạo collection Postman cho các endpoint `GET /api/admin/*` và bao gồm phản hồi mô phỏng từ downstream services.

---

File created: backend/adminservice/ADMIN_SERVICE_REPORT.md
