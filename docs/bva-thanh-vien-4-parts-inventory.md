# BVA Thành Viên 4: Kiểm Thử Chức Năng Quản Lý Phụ Tùng

**Thành viên:** Nguyen Thi My Anh
**Chủ đề:** Phân hoạch lớp tương đương, phân tích giá trị biên, thiết kế test case và unit test  
**Phạm vi:** Parts Inventory Service  
**Chức năng kiểm thử:** Tạo phụ tùng mới qua API `POST /api/parts`  
**Mức độ:** Cơ bản đến trung bình  

---

## 1. Mục Tiêu Kiểm Thử

1. Xác định các điều kiện kiểm thử cho chức năng tạo phụ tùng mới.
2. Áp dụng kỹ thuật **phân hoạch lớp tương đương** để chia dữ liệu đầu vào thành nhóm hợp lệ và không hợp lệ.
3. Áp dụng kỹ thuật **phân tích giá trị biên** cho các trường có ràng buộc rõ ràng.
4. Thiết kế test case có input, expected result và tag bao phủ.
5. Viết unit test cho các trường hợp validate quan trọng trong `PartService`.

---

## 2. Nội Dung Tham Khảo

Phần kiểm thử này tập trung vào các kỹ thuật kiểm thử hộp đen:

- **Equivalence Partitioning:** chia miền dữ liệu đầu vào thành các lớp tương đương.
- **Boundary Value Analysis:** chọn dữ liệu tại biên và gần biên để kiểm thử.
- **Test Case Design:** thiết kế test case có input, expected outcome và tag bao phủ.
- **Unit Test:** kiểm tra logic validate trong service bằng JUnit và Mockito.

Bảng phân tích sử dụng cấu trúc:

| Conditions | Valid Partitions | Tag | Invalid Partitions | Tag | Valid Boundaries | Tag |
|---|---|---|---|---|---|---|

Và bảng test case sử dụng cấu trúc:

| Test Case | Input | Expected Outcome | New Tags Covered |
|---|---|---|---|

---

## 3. Mô Tả Chức Năng

Hệ thống Parts Inventory Service cho phép nhân viên tạo mới một phụ tùng trong kho thông qua API:

```http
POST /api/parts
```

Một yêu cầu tạo phụ tùng được xem là hợp lệ khi các trường bắt buộc thỏa mãn điều kiện sau:

| Biến đầu vào | Ý nghĩa | Kiểu dữ liệu | Miền giá trị hợp lệ |
|---|---|---|---|
| `partCode` | Mã phụ tùng | String | Không null, không rỗng |
| `name` | Tên phụ tùng | String | Không null, không rỗng |
| `unitPrice` | Giá phụ tùng | Decimal | Lớn hơn hoặc bằng 0 |

Các trường khác như `description`, `category`, `manufacturer` là thông tin bổ sung, không phải trọng tâm của phần BVA này.

Hệ thống trả về:

- **Hợp lệ:** lưu phụ tùng thành công.
- **Không hợp lệ:** trả lỗi `400 Bad Request` với thông báo lỗi tương ứng.

---

## 4. Giả Định Kiểm Thử

1. Chỉ kiểm thử logic validate khi tạo phụ tùng mới.
2. Không xét lỗi kết nối database, lỗi server hoặc lỗi authentication.
3. `partCode` và `name` được xem là rỗng nếu giá trị là `null`, chuỗi rỗng hoặc chỉ chứa khoảng trắng.
4. `unitPrice` hợp lệ khi giá trị lớn hơn hoặc bằng 0.
5. Dữ liệu hợp lệ khi tất cả trường bắt buộc đều hợp lệ.

Công thức logic tổng quát:

```text
Valid =
partCode != null
AND trim(partCode) != ""
AND name != null
AND trim(name) != ""
AND unitPrice != null
AND unitPrice >= 0
```

---

# PHẦN A. PHÂN TÍCH VÀ THIẾT KẾ TEST CASE

---

## Câu 1. Xác Định Lớp Tương Đương

### Bảng Phân Hoạch Lớp Tương Đương

| Conditions | Valid Partitions | Tag | Invalid Partitions | Tag | Valid Boundaries | Tag |
|---|---|---|---|---|---|---|
| `partCode` | Chuỗi có ít nhất 1 ký tự sau khi trim | V1 | `null` | X1 | Độ dài tối thiểu 1 ký tự | B1 |
| `partCode` | Ví dụ: `"P1001"` | V1 | `""` hoặc `"   "` | X2 | `"P"` | B1 |
| `name` | Chuỗi có ít nhất 1 ký tự sau khi trim | V2 | `null` | X3 | Độ dài tối thiểu 1 ký tự | B2 |
| `name` | Ví dụ: `"Battery Pack"` | V2 | `""` hoặc `"   "` | X4 | `"A"` | B2 |
| `unitPrice` | Giá lớn hơn hoặc bằng 0 | V3 | `null` | X5 | Giá nhỏ nhất hợp lệ là `0` | B3 |
| `unitPrice` | Ví dụ: `2500000` | V3 | Giá âm `< 0` | X6 | `0` và `1` | B3, B4 |

### Ý Nghĩa Tag

| Tag | Ý nghĩa |
|---|---|
| V1 | `partCode` hợp lệ |
| V2 | `name` hợp lệ |
| V3 | `unitPrice` hợp lệ |
| X1 | `partCode` bị thiếu |
| X2 | `partCode` rỗng hoặc chỉ chứa khoảng trắng |
| X3 | `name` bị thiếu |
| X4 | `name` rỗng hoặc chỉ chứa khoảng trắng |
| X5 | `unitPrice` bị thiếu |
| X6 | `unitPrice` âm |
| B1 | Biên tối thiểu hợp lệ của `partCode` |
| B2 | Biên tối thiểu hợp lệ của `name` |
| B3 | Biên dưới hợp lệ của `unitPrice` là `0` |
| B4 | Giá hợp lệ ngay trên biên dưới của `unitPrice` |

---

## Câu 2. Phân Tích Giá Trị Biên

### Bảng Giá Trị Biên

| Biến đầu vào | min invalid | min | min+ | nominal | max | Tag biên |
|---|---:|---:|---:|---:|---:|---|
| Độ dài `partCode` | 0 ký tự | 1 ký tự | 2 ký tự | 5 ký tự | Không giới hạn trong service | B1 |
| Độ dài `name` | 0 ký tự | 1 ký tự | 2 ký tự | 12 ký tự | Không giới hạn trong service | B2 |
| `unitPrice` | -1 | 0 | 1 | 2500000 | Không giới hạn trong service | B3, B4 |

### Lưu Ý

- Với `partCode` và `name`, biên quan trọng nhất là độ dài tối thiểu sau khi trim.
- Với `unitPrice`, biên quan trọng nhất là `0`, vì đây là giá trị nhỏ nhất hợp lệ.
- Service hiện tại chưa giới hạn độ dài tối đa cho `partCode` và `name`, nên phần BVA chỉ tập trung vào biên tối thiểu.

---

## Câu 3. Thiết Kế Test Case

| Test Case | Input | Expected Outcome | New Tags Covered |
|---|---|---|---|
| TC_PART_01 | `partCode = "P1001"`, `name = "Battery Pack"`, `unitPrice = 2500000` | Hợp lệ, gọi `partRepository.save()` và trả về phụ tùng đã lưu | V1, V2, V3 |
| TC_PART_02 | `partCode = null`, `name = "Battery Pack"`, `unitPrice = 2500000` | Không hợp lệ, ném `BadRequestException`, message `"partCode is required"` | X1 |
| TC_PART_03 | `partCode = "   "`, `name = "Battery Pack"`, `unitPrice = 2500000` | Không hợp lệ, ném `BadRequestException`, message `"partCode is required"` | X2 |
| TC_PART_04 | `partCode = "P1001"`, `name = null`, `unitPrice = 2500000` | Không hợp lệ, ném `BadRequestException`, message `"name is required"` | X3 |
| TC_PART_05 | `partCode = "P1001"`, `name = " "`, `unitPrice = 2500000` | Không hợp lệ, ném `BadRequestException`, message `"name is required"` | X4 |
| TC_PART_06 | `partCode = "P1001"`, `name = "Battery Pack"`, `unitPrice = null` | Không hợp lệ, ném `BadRequestException`, message `"unitPrice must be greater than or equal to 0"` | X5 |
| TC_PART_07 | `partCode = "P1001"`, `name = "Battery Pack"`, `unitPrice = -1` | Không hợp lệ, ném `BadRequestException`, message `"unitPrice must be greater than or equal to 0"` | X6 |
| TC_PART_08 | `partCode = "P"`, `name = "A"`, `unitPrice = 0` | Hợp lệ tại biên tối thiểu, gọi `partRepository.save()` | B1, B2, B3 |
| TC_PART_09 | `partCode = "P1"`, `name = "AB"`, `unitPrice = 1` | Hợp lệ ngay trên biên tối thiểu, gọi `partRepository.save()` | B4 |

---

## Câu 4. Triển Khai Unit Test

Unit test được viết bằng:

| Thành phần | Công nghệ |
|---|---|
| Ngôn ngữ | Java |
| Framework test | JUnit 5 |
| Mock dependency | Mockito |
| File test | `PartServiceCreateValidationTest.java` |
| Class được test | `PartService` |
| Method được test | `create(Part req)` |

### Danh Sách Unit Test Đã Viết

| Unit test | Mục đích | Expected result |
|---|---|---|
| `createShouldRejectMissingPartCode` | Kiểm tra thiếu `partCode` | Ném `BadRequestException`, không gọi `save()` |
| `createShouldRejectBlankPartCode` | Kiểm tra `partCode` rỗng | Ném `BadRequestException`, không gọi `save()` |
| `createShouldRejectMissingName` | Kiểm tra thiếu `name` | Ném `BadRequestException`, không gọi `save()` |
| `createShouldRejectBlankName` | Kiểm tra `name` rỗng | Ném `BadRequestException`, không gọi `save()` |
| `createShouldRejectMissingUnitPrice` | Kiểm tra thiếu `unitPrice` | Ném `BadRequestException`, không gọi `save()` |
| `createShouldRejectNegativeUnitPrice` | Kiểm tra `unitPrice` âm | Ném `BadRequestException`, không gọi `save()` |
| `createShouldSaveValidPart` | Kiểm tra dữ liệu hợp lệ | Gọi `partRepository.save()` và trả về kết quả |

### Vị Trí File Unit Test

```text
backend/parts-inventory-service/src/test/java/org/example/partsinventoryservice/service/PartServiceCreateValidationTest.java
```

### Lệnh Chạy Test

```bash
cd backend/parts-inventory-service
mvn test
```

Kết quả mong đợi:

```text
BUILD SUCCESS
Tests run: 8, Failures: 0, Errors: 0
```

---

# PHẦN B. BẢNG CHẤM ĐIỂM CHI TIẾT

---

## Câu 1. Lớp Tương Đương: 2 Điểm

| Tiêu chí | Điểm |
|---|---:|
| Xác định đúng lớp hợp lệ cho `partCode`, `name`, `unitPrice` | 0.8 |
| Xác định đúng lớp không hợp lệ do thiếu dữ liệu | 0.4 |
| Xác định đúng lớp không hợp lệ do dữ liệu rỗng hoặc âm | 0.4 |
| Có đặt tag rõ ràng cho các lớp | 0.4 |
| **Tổng** | **2.0** |

---

## Câu 2. Giá Trị Biên: 2 Điểm

| Tiêu chí | Điểm |
|---|---:|
| Xác định đúng biên tối thiểu của `partCode` | 0.5 |
| Xác định đúng biên tối thiểu của `name` | 0.5 |
| Xác định đúng biên dưới của `unitPrice` | 0.5 |
| Giải thích rõ trường chưa có biên trên trong service | 0.5 |
| **Tổng** | **2.0** |

---

## Câu 3. Test Case: 3 Điểm

| Tiêu chí | Điểm |
|---|---:|
| Có tối thiểu 8 test case | 0.5 |
| Có test case hợp lệ | 0.5 |
| Có test case không hợp lệ | 0.5 |
| Có test case tại biên hoặc gần biên | 0.5 |
| Expected result rõ ràng, có lý do khi không hợp lệ | 0.5 |
| Có tag được bao phủ | 0.5 |
| **Tổng** | **3.0** |

---

## Câu 4. Unit Test: 3 Điểm

| Tiêu chí | Điểm |
|---|---:|
| Viết đúng unit test cho `PartService.create()` | 1.0 |
| Có sử dụng JUnit 5 và Mockito | 0.5 |
| Có test case biên cho `partCode`, `name`, `unitPrice` | 0.5 |
| Có test case hợp lệ tại biên | 0.5 |
| Có test case không hợp lệ ngoài biên | 0.5 |
| **Tổng** | **3.0** |

---

# PHẦN C. NHẬN XÉT

## 1. Vì Sao Cần Tag?

Tag giúp theo dõi test case nào đã bao phủ điều kiện nào. Khi trình bày với giảng viên, có thể chỉ ra nhanh:

| Tag | Ý nghĩa | Test case bao phủ |
|---|---|---|
| V1 | `partCode` hợp lệ | TC_PART_01, TC_PART_08, TC_PART_09 |
| V2 | `name` hợp lệ | TC_PART_01, TC_PART_08, TC_PART_09 |
| V3 | `unitPrice` hợp lệ | TC_PART_01, TC_PART_08, TC_PART_09 |
| X1 | Thiếu `partCode` | TC_PART_02 |
| X2 | `partCode` rỗng | TC_PART_03 |
| X3 | Thiếu `name` | TC_PART_04 |
| X4 | `name` rỗng | TC_PART_05 |
| X5 | Thiếu `unitPrice` | TC_PART_06 |
| X6 | `unitPrice` âm | TC_PART_07 |
| B1 | Biên tối thiểu của `partCode` | TC_PART_08 |
| B2 | Biên tối thiểu của `name` | TC_PART_08 |
| B3 | Biên dưới `unitPrice = 0` | TC_PART_08 |
| B4 | Giá trị ngay trên biên `unitPrice = 1` | TC_PART_09 |

## 2. Bug Đã Phát Hiện Và Sửa

Trước khi sửa, khi gửi request thiếu `partCode`, API bị lỗi:

```text
not-null property references a null or transient value:
org.example.partsinventoryservice.entity.Part.partCode
```

Nguyên nhân là dữ liệu không hợp lệ đi thẳng xuống Hibernate, làm hệ thống trả lỗi server.

Sau khi sửa:

- Service validate `partCode` trước khi lưu.
- Nếu thiếu hoặc rỗng `partCode`, hệ thống ném `BadRequestException`.
- API trả lỗi rõ ràng hơn: `400 Bad Request`.
- Unit test đã được bổ sung để tránh lỗi tái diễn.

