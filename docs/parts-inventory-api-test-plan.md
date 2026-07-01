# Parts & Inventory API Test Plan

## 1. Phạm vi và lưu ý thực tế
- Service hiện tại triển khai các endpoint sau:
  - GET /api/parts
  - POST /api/parts
  - POST /api/transactions/import
  - POST /api/transactions/export
- Endpoint theo yêu cầu POST /api/parts/transactions và POST /api/parts/requests chưa có controller riêng trong code hiện tại.
- Vì vậy, kịch bản test dưới đây chia làm 2 phần:
  1. Test đúng với API hiện có trong service.
  2. Mẫu test cho endpoint đề xuất /api/parts/requests khi team triển khai sau.

## 2. Phân tích BVA (Boundary Value Analysis)

### 2.1 GET /api/parts
- Không có input parameter, nên BVA không áp dụng.
- Khuyến nghị dùng 1 smoke test cộng 1 negative test khi service offline hoặc gateway lỗi.

### 2.2 POST /api/parts
Ràng buộc hợp lý cho API:
- partCode: bắt buộc, không được rỗng.
- name: bắt buộc, không được rỗng.
- unitPrice: nên >= 0.

Đề xuất testcase BVA:
| ID | Điều kiện | Giá trị đầu vào | Kết quả mong đợi |
|---|---|---|---|
| BVA-01 | partCode rỗng | "" | 400 Bad Request |
| BVA-02 | partCode tối thiểu hợp lệ | "P1" | 200 OK |
| BVA-03 | name rỗng | "" | 400 Bad Request |
| BVA-04 | unitPrice = 0 | 0 | 200 OK |
| BVA-05 | unitPrice âm | -1 | 400 Bad Request |

### 2.3 POST /api/transactions/import và /api/transactions/export
Ràng buộc hợp lý:
- partId: phải > 0.
- quantity: phải > 0.
- staffId: phải > 0.

Đề xuất testcase BVA:
| ID | Điều kiện | Giá trị đầu vào | Kết quả mong đợi |
|---|---|---|---|
| BVA-06 | partId = 0 | 0 | 400 Bad Request |
| BVA-07 | partId = 1 | 1 | 200 OK |
| BVA-08 | quantity = 0 | 0 | 400 Bad Request |
| BVA-09 | quantity = 1 | 1 | 200 OK |
| BVA-10 | staffId = 0 | 0 | 400 Bad Request |
| BVA-11 | staffId = 1 | 1 | 200 OK |

### 2.4 POST /api/parts/requests (endpoint đề xuất)
Nếu triển khai theo nghiệp vụ khách hàng mua/bảo hành pin hoặc linh kiện, các trường hợp biên nên bao gồm:
- requestType: PURCHASE, BATTERY_WARRANTY, PART_WARRANTY
- quantity: > 0
- partId/customerId: > 0

Đề xuất testcase BVA:
| ID | Điều kiện | Giá trị đầu vào | Kết quả mong đợi |
|---|---|---|---|
| BVA-12 | requestType không hợp lệ | "XYZ" | 400 Bad Request |
| BVA-13 | requestType hợp lệ | "PURCHASE" | 200 OK |
| BVA-14 | quantity = 0 | 0 | 400 Bad Request |
| BVA-15 | quantity = 1 | 1 | 200 OK |
| BVA-16 | partId = 0 | 0 | 400 Bad Request |
| BVA-17 | customerId = 0 | 0 | 400 Bad Request |

### Tổng số testcase BVA đề xuất
- 5 testcase cho POST /api/parts
- 6 testcase cho transaction import/export
- 6 testcase cho endpoint request (nếu triển khai)
- Tổng: 17 testcase BVA chính

## 3. Hướng dẫn White-box cho thành viên 4
Mục tiêu white-box là kiểm tra các nhánh điều kiện và luồng xử lý bên trong service kho, đặc biệt ở [backend/parts-inventory-service/src/main/java/org/example/partsinventoryservice/service/InventoryService.java](backend/parts-inventory-service/src/main/java/org/example/partsinventoryservice/service/InventoryService.java).

### 3.1 Điểm cần tập trung
1. importStock
   - Nhánh 1: qty <= 0 -> ném BadRequestException.
   - Nhánh 2: staffId null -> dùng fallback 1L.
   - Nhánh 3: partId không tồn tại -> ném ResourceNotFoundException.
   - Nhánh 4: chưa có PartInventory -> tạo mới với quantity = 0 và minStockLevel = 5.
   - Nhánh 5: đã có tồn kho -> cập nhật số lượng và ghi transaction IMPORT.

2. exportStock
   - Nhánh 1: qty <= 0 -> ném BadRequestException.
   - Nhánh 2: chưa khởi tạo tồn kho -> ném ResourceNotFoundException.
   - Nhánh 3: tồn kho sau khi xuất < 0 -> ném BadRequestException.
   - Nhánh 4: xuất thành công -> giảm quantity và tạo transaction EXPORT.

3. adjustStock
   - Nhánh 1: delta làm âm tồn kho -> ném BadRequestException.
   - Nhánh 2: delta hợp lệ -> điều chỉnh quantity và tạo transaction ADJUSTMENT.

4. countLowStock
   - Đếm các item có quantityInStock <= minStockLevel.

### 3.2 Testcase White-box đề xuất
| ID | Chức năng | Điều kiện test | Kết quả mong đợi |
|---|---|---|---|
| WB-01 | importStock | qty = 0 | Throw BadRequestException |
| WB-02 | importStock | qty = 5, staffId = null, partId hợp lệ | Tạo transaction IMPORT, inventory tăng 5 |
| WB-03 | importStock | partId không tồn tại | Throw ResourceNotFoundException |
| WB-04 | importStock | part chưa có inventory | Tạo mới PartInventory và ghi transaction |
| WB-05 | exportStock | qty = 0 | Throw BadRequestException |
| WB-06 | exportStock | qty > tồn kho hiện có | Throw BadRequestException |
| WB-07 | exportStock | qty hợp lệ và inventory tồn tại | Giảm quantity, tạo transaction EXPORT |
| WB-08 | adjustStock | delta làm âm tồn kho | Throw BadRequestException |
| WB-09 | adjustStock | delta hợp lệ | Tăng/giảm quantity, tạo transaction ADJUSTMENT |
| WB-10 | countLowStock | Có item ở mức min và dưới min | Đếm đúng số lượng item low stock |

### 3.3 Cách kiểm tra kết quả white-box
- Kiểm tra exception type và message.
- So sánh giá trị quantityInStock trước và sau khi gọi method.
- Kiểm tra trong bảng part_transactions có bản ghi đúng type: IMPORT / EXPORT / ADJUSTMENT.
- Kiểm tra liên kết partId, createdByStaffId, relatedOrderId, relatedRequestId.

### 3.4 Gợi ý cách viết test cho thành viên 4
- Dùng unit test với JUnit + Mockito hoặc integration test với DB thực.
- Ưu tiên test từng nhánh riêng lẻ trước, sau đó mới test luồng end-to-end.
- Với mỗi testcase, nên có 3 bước: setup -> execute -> assert.

## 4. Kịch bản test Postman

### Biến môi trường
- baseUrl = http://localhost:8080
- partId = 1
- staffId = 1

### 3.1 GET /api/parts
Request:
- Method: GET
- URL: {{baseUrl}}/api/parts

Test script:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array", function () {
    const json = pm.response.json();
    pm.expect(json).to.be.an('array');
});
```

### 3.2 POST /api/parts
Request:
- Method: POST
- URL: {{baseUrl}}/api/parts
- Body: raw JSON
```json
{
  "partCode": "P1001",
  "name": "Battery Pack",
  "description": "Pin xe điện",
  "category": "Battery",
  "unitPrice": 2500000,
  "manufacturer": "EVCo"
}
```

Test script:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response contains partId", function () {
    const json = pm.response.json();
    pm.expect(json).to.have.property('partId');
    if (json.partId) {
        pm.environment.set('partId', json.partId.toString());
    }
});
```

### 3.3 POST /api/transactions/import
Request:
- Method: POST
- URL: {{baseUrl}}/api/transactions/import
- Body: none
- Params:
  - partId = {{partId}}
  - quantity = 5
  - staffId = 1
  - note = Nhập kho ban đầu

Test script:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Transaction type is IMPORT", function () {
    const json = pm.response.json();
    pm.expect(json.type).to.eql('IMPORT');
});
```

### 3.4 POST /api/transactions/export
Request:
- Method: POST
- URL: {{baseUrl}}/api/transactions/export
- Body: none
- Params:
  - partId = {{partId}}
  - quantity = 2
  - staffId = 1
  - requestId = 1001
  - orderId = 2001
  - note = Xuất cho đơn yêu cầu khách hàng

Test script:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Transaction type is EXPORT", function () {
    const json = pm.response.json();
    pm.expect(json.type).to.eql('EXPORT');
});
```

### 3.5 POST /api/parts/requests (mẫu cho endpoint đề xuất)
Request:
- Method: POST
- URL: {{baseUrl}}/api/parts/requests
- Body: raw JSON
```json
{
  "customerId": 1,
  "partId": 1,
  "requestType": "PURCHASE",
  "quantity": 1,
  "description": "Khách hàng yêu cầu mua phụ tùng"
}
```

Test script:
```javascript
pm.test("Response status is 200 or 404 depending on implementation", function () {
    pm.expect([200, 404]).to.include(pm.response.code);
});
```

## 4. Kịch bản test nghiệp vụ gộp
1. Tạo part mới bằng POST /api/parts.
2. Gọi GET /api/parts để xác nhận part xuất hiện.
3. Gọi POST /api/transactions/import để nhập kho.
4. Gọi POST /api/transactions/export để xuất kho cho request.
5. Gọi GET /api/transactions/type/EXPORT hoặc GET /api/transactions/part/{{partId}} để kiểm tra log.
6. Với endpoint đề xuất /api/parts/requests, gửi request và xác nhận hệ thống tạo đơn và ghi log giao dịch.
