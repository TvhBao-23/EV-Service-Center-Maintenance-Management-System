# Báo cáo Phân tích Giá trị Biên (BVA) - AdminService

1. **Phần 1:** Thiết kế một hàm API hoàn chỉnh.
2. **Phần 2:** Áp dụng BVA để bẻ khóa trực tiếp các logic thực tế đang chạy ngầm trong `DashboardService` .

---

# PHẦN 1: API CẬP NHẬT CẤU HÌNH DASHBOARD

## 1.1. Mô tả bài toán
Yêu cầu được xem là **hợp lệ** khi tất cả các tham số đồng thời thỏa mãn miền giá trị:

| Biến đầu vào | Ý nghĩa | Kiểu dữ liệu | Miền giá trị hợp lệ |
|---|---|---|---|
| `maxActivities` | Số lượng hoạt động tối đa hiển thị | Số nguyên | Từ 5 đến 20 |
| `lowStockWarning` | Mức tồn kho tối thiểu để cảnh báo | Số nguyên | Từ 1 đến 50 |
| `refreshInterval` | Thời gian làm mới trang (giây) | Số nguyên | Từ 30 đến 300 |
| `revenueTarget` | Mục tiêu doanh thu (tỷ VNĐ) | Số thực | Từ 1.0 đến 10.0 |

## 1.2. Phân hoạch lớp tương đương (Equivalence Partitioning)

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
|---|---|---|---|---|
| maxActivities | 5 đến 20 | V1 | < 5 | X1 |
| | | | > 20 | X2 |
| lowStockWarning | 1 đến 50 | V2 | < 1 | X3 |
| | | | > 50 | X4 |
| refreshInterval | 30 đến 300 | V3 | < 30 | X5 |
| | | | > 300 | X6 |
| revenueTarget | 1.0 đến 10.0 | V4 | < 1.0 | X7 |
| | | | > 10.0 | X8 |

## 1.3. Phân tích giá trị biên (Boundary Value Analysis)

| Biến đầu vào | min | min+ | nominal | max- | max | Tag biên |
|---|---:|---:|---:|---:|---:|---|
| maxActivities | 5 | 6 | 12 | 19 | 20 | B1, B2, B3, B4, B5 |
| lowStockWarning| 1 | 2 | 25 | 49 | 50 | B6, B7, B8, B9, B10 |
| refreshInterval| 30 | 31 | 120 | 299| 300 | B11, B12, B13, B14, B15 |
| revenueTarget | 1.0 | 1.1 | 5.0 | 9.9 | 10.0| B16, B17, B18, B19, B20 |

## 1.4. Bảng thiết kế Test Case (Kết hợp tối ưu)

| STT | Tên test case | maxActivities | lowStockWarning | refreshInterval | revenueTarget | Kết quả | Tag bao phủ |
|---:|---|---:|---:|---:|---:|---|---|
| 1 | Cấu hình hợp lệ tiêu chuẩn | 12 | 25 | 120 | 5.0 | Hợp lệ | V1, V2, V3, V4 |
| 2 | Tại biên MIN toàn phần | 5 | 1 | 30 | 1.0 | Hợp lệ | B1, B6, B11, B16 |
| 3 | Tại biên MAX toàn phần | 20 | 50 | 300 | 10.0 | Hợp lệ | B5, B10, B15, B20 |
| 4 | maxActivities thấp hơn MIN | 4 | 25 | 120 | 5.0 | Từ chối | X1 |
| 5 | maxActivities cao hơn MAX | 21 | 25 | 120 | 5.0 | Từ chối | X2 |
| 6 | revenueTarget thấp hơn MIN | 12 | 25 | 120 | 0.9 | Từ chối | X7 |
| 7 | Nhiều biến ngoài biên | 25 | 60 | 15 | 12.5 | Từ chối | X2, X4, X5, X8 |

---

# PHẦN 2: BVA CHO CÁC HÀM THỰC TẾ TRONG DASHBOARD SERVICE

## 2.1. Logic xác định "Phụ tùng sắp hết" (Low Stock Calculation)

Trong hàm `getSummary()`, hệ thống lọc ra các phụ tùng sắp hết dựa trên biểu thức: `stockQuantity <= minStockLevel`.
Ta định nghĩa biến trung gian: `delta = stockQuantity - minStockLevel`.

- **Hợp lệ (Được tính là sắp hết):** `delta <= 0`.
- **Không hợp lệ (Tồn kho an toàn):** `delta > 0`.

**Bảng Giá trị biên cho `delta`:**

| Ký hiệu biên | Giá trị `delta` | Ý nghĩa | Kết quả mong đợi |
|---|---:|---|---|
| min | -10 | Kho thấp hơn mức tối thiểu nhiều | Được đếm vào `lowStockParts` |
| max- | -1 | Kho thấp hơn mức tối thiểu 1 đơn vị | Được đếm vào `lowStockParts` |
| max (biên) | 0 | Kho vừa đúng bằng mức tối thiểu | Được đếm vào `lowStockParts` |
| max+ (ngoài) | 1 | Kho vượt mức tối thiểu 1 đơn vị | **Không** được đếm |

**Test Cases:**

| STT | `stockQuantity` | `minStockLevel` | `delta` | Kết quả trả về mong đợi |
|---|---:|---:|---:|---|
| 1 | 4 | 5 | -1 | Tính là Low Stock (max-) |
| 2 | 5 | 5 | 0 | Tính là Low Stock (Tại biên max) |
| 3 | 6 | 5 | 1 | Bỏ qua, Stock an toàn (Ngoại biên max+) |


## 2.2. Logic phân giải thời gian (parseTimestamp)

Hàm `parseTimestamp(Object timeObj)` chứa một giới hạn cứng (hardcode): `num < 946684800000L` (tương đương ngày 1/1/2000). 
- Nếu nhỏ hơn mốc này: Hệ thống coi đó là "Giây" và nhân lên 1000.
- Nếu lớn hơn hoặc bằng mốc này: Hệ thống coi đó là "Mili-giây" và giữ nguyên.

Biên (Boundary) nằm chính xác tại: `946,684,800,000`.

**Test Cases tại giá trị biên:**

| STT | Giá trị đầu vào (`num`) | Kết quả trả về (`long`) | Giải thích |
|---|---:|---:|---|
| 1 | 946,684,799,999 | 946,684,799,999,000 | Nhỏ hơn biên 1 đơn vị -> Bị nhân 1000 |
| 2 | 946,684,800,000 | 946,684,800,000 | Bằng chính xác biên -> Giữ nguyên |
| 3 | 946,684,800,001 | 946,684,800,001 | Lớn hơn biên 1 đơn vị -> Giữ nguyên |


## 2.3. Logic cắt danh sách hiển thị (List Limiting)

Hàm `getRecentActivities()` giới hạn mảng trả về: `recentCompletedReceipts.stream().limit(3)`.
- Biến đầu vào: `N` (Số lượng hoá đơn lấy được từ DB).
- Kết quả: Hệ thống chỉ trả về `min(N, 3)` hoá đơn.

**Bảng Test Cases xung quanh biên MAX = 3:**

| `N` (Kích thước mảng gốc) | Số lượng trả về mong đợi | Tag / Ký hiệu biên |
|---:|---:|---|
| 0 | 0 | Empty |
| 2 | 2 | Dưới biên (max-) |
| 3 | 3 | Ngay tại biên (max) |
| 4 | 3 | Vượt biên 1 đơn vị (max+) -> Bị cắt bỏ bớt |
| 100 | 3 | Vượt xa biên -> Bị cắt bỏ bớt |
