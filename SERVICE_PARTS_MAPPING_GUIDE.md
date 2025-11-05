# 🔧 Service-Parts Mapping System - Hướng Dẫn

## 📋 Tổng Quan

Hệ thống **Service-Parts Mapping** giúp lọc phụ tùng theo dịch vụ đã chọn, tránh hiển thị phụ tùng không liên quan.

## 🎯 Mục Đích

**Trước khi có mapping:**
- Chọn dịch vụ "Sửa chữa hệ thống sạc" → Hiển thị TẤT CẢ 24 phụ tùng (pin, motor, lốp, phanh...)
- Rườm rà, khó tìm phụ tùng cần thiết

**Sau khi có mapping:**
- Chọn dịch vụ "Sửa chữa hệ thống sạc" → Chỉ hiển thị 8 phụ tùng liên quan (charging, electronic)
- Gọn gàng, tập trung vào phụ tùng cần dùng

## 📊 Mapping Table

### Dịch Vụ và Category Mapping

| Dịch Vụ | Service Category | Part Categories | Số Phụ Tùng |
|---------|------------------|----------------|-------------|
| Bảo dưỡng định kỳ | `maintenance` | filter, accessory, fluid, brake, tire, electronic | 14 |
| Thay pin lithium-ion | `battery` | battery | 3 |
| Sửa chữa hệ thống sạc | `charging` | charging, electronic | 8 |
| Thay motor điện | `motor` | motor, electronic | 5 |
| Kiểm tra BMS | `electronic` | electronic, battery | 6 |
| Thay inverter | `electronic` | electronic, battery | 6 |
| Bảo dưỡng hệ thống làm mát | `cooling` | cooling, fluid | 3 |
| Cập nhật phần mềm | `electronic` | electronic | 3 |

### Database Schema

```sql
-- Bảng service_part_categories
CREATE TABLE service_part_categories (
    mapping_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_category VARCHAR(50) NOT NULL,     -- Category của service
    part_category VARCHAR(100) NOT NULL,       -- Category của parts
    priority INT DEFAULT 1,                     -- Độ ưu tiên hiển thị
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (service_category, part_category)
);
```

### Ví Dụ Mapping Data

```sql
-- Charging service → charging + electronic parts
INSERT INTO service_part_categories (service_category, part_category, priority) VALUES
('charging', 'charging', 1),
('charging', 'electronic', 2);

-- Battery service → chỉ battery parts
INSERT INTO service_part_categories (service_category, part_category, priority) VALUES
('battery', 'battery', 1);

-- Maintenance → nhiều categories
INSERT INTO service_part_categories (service_category, part_category, priority) VALUES
('maintenance', 'filter', 1),
('maintenance', 'accessory', 2),
('maintenance', 'fluid', 3),
('maintenance', 'brake', 4),
('maintenance', 'tire', 5),
('maintenance', 'electronic', 6);
```

## 🔌 API Endpoints

### 1. Lấy Parts Theo Service Category

**Endpoint:** `GET /api/staff/parts/for-service/{serviceCategory}`

**Ví dụ:**

```bash
# Lấy parts cho dịch vụ sửa chữa hệ thống sạc
GET http://localhost:8083/api/staff/parts/for-service/charging

# Response: [CHG-PORT-001, CHG-CABLE-001, CHG-ONBOARD-001, BMS-001, INV-001, ...]
```

```bash
# Lấy parts cho dịch vụ thay pin
GET http://localhost:8083/api/staff/parts/for-service/battery

# Response: [BAT-LI-001, BAT-LI-002, BAT-CELL-001]
```

```bash
# Lấy parts cho bảo dưỡng định kỳ
GET http://localhost:8083/api/staff/parts/for-service/maintenance

# Response: [FILTER-001, WIPER-001, FLUID-001, BRK-PAD-001, TIRE-001, ...]
```

### 2. Response Format

```json
[
  {
    "partId": 1,
    "partCode": "CHG-PORT-001",
    "name": "Cổng Sạc Type 2",
    "description": "Phoenix Contact",
    "category": "charging",
    "manufacturer": "Phoenix Contact",
    "unitPrice": 5000000,
    "stockQuantity": 10,
    "minStockLevel": 3,
    "location": "Kho F-01",
    "status": "available"
  },
  ...
]
```

## 💻 Backend Implementation

### 1. Entity - ServicePartCategory.java

```java
@Entity
@Table(name = "service_part_categories")
public class ServicePartCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long mappingId;
    
    @Column(name = "service_category")
    private String serviceCategory;
    
    @Column(name = "part_category")
    private String partCategory;
    
    private Integer priority;
}
```

### 2. Repository - ServicePartCategoryRepository.java

```java
@Repository
public interface ServicePartCategoryRepository extends JpaRepository<ServicePartCategory, Long> {
    
    @Query("SELECT spc.partCategory FROM ServicePartCategory spc " +
           "WHERE spc.serviceCategory = :serviceCategory " +
           "GROUP BY spc.partCategory " +
           "ORDER BY MIN(spc.priority) ASC")
    List<String> findPartCategoriesByServiceCategory(@Param("serviceCategory") String serviceCategory);
}
```

### 3. Service - PartService.java

```java
public List<Part> getPartsForService(String serviceCategory) {
    // 1. Lấy danh sách part categories cho service này
    List<String> partCategories = servicePartCategoryRepository
            .findPartCategoriesByServiceCategory(serviceCategory);
    
    // 2. Tìm tất cả parts thuộc các categories này
    List<Part> parts = partRepository.findByCategoryIn(partCategories);
    
    return parts;
}
```

### 4. Controller - PartController.java

```java
@GetMapping("/for-service/{serviceCategory}")
public ResponseEntity<List<Part>> getPartsForService(@PathVariable String serviceCategory) {
    return ResponseEntity.ok(partService.getPartsForService(serviceCategory));
}
```

## 🎨 Frontend Usage (Đề Xuất)

### React/Vue Component

```javascript
// Khi user chọn dịch vụ từ dropdown
const handleServiceChange = async (serviceId) => {
  // Lấy service info
  const service = services.find(s => s.serviceId === serviceId);
  const serviceCategory = service.category; // 'charging', 'battery', etc.
  
  // Fetch parts cho service này
  const response = await fetch(
    `http://localhost:8083/api/staff/parts/for-service/${serviceCategory}`
  );
  const relevantParts = await response.json();
  
  // Hiển thị chỉ các parts liên quan
  setAvailableParts(relevantParts);
};
```

### Dropdown Example

```jsx
<select onChange={(e) => handleServiceChange(e.target.value)}>
  <option value="">-- Chọn loại dịch vụ --</option>
  <option value="1" data-category="maintenance">Bảo dưỡng định kỳ</option>
  <option value="2" data-category="battery">Thay pin lithium-ion</option>
  <option value="3" data-category="charging">Sửa chữa hệ thống sạc</option>
  <option value="4" data-category="motor">Thay motor điện</option>
  ...
</select>

<!-- Parts sẽ tự động filter theo service đã chọn -->
<select name="parts" multiple>
  {relevantParts.map(part => (
    <option key={part.partId} value={part.partId}>
      {part.partCode} - {part.name} ({part.unitPrice.toLocaleString()}đ)
    </option>
  ))}
</select>
```

## ✅ Test Results

```powershell
# Test 1: Charging service
GET /api/staff/parts/for-service/charging
✅ Found 8 parts (charging + electronic categories)

# Test 2: Battery service  
GET /api/staff/parts/for-service/battery
✅ Found 3 parts (only battery category)

# Test 3: Maintenance service
GET /api/staff/parts/for-service/maintenance
✅ Found 14 parts (filter, accessory, fluid, brake, tire, electronic)
```

## 📝 Cách Thêm Mapping Mới

### Thêm service mới:

```sql
-- 1. Thêm service vào bảng services
INSERT INTO services (name, description, estimated_duration_minutes, base_price, category) 
VALUES ('Sửa chữa động cơ', 'Sửa chữa động cơ điện', 180, 2000000, 'motor');

-- 2. Thêm mapping cho service này
INSERT INTO service_part_categories (service_category, part_category, priority) VALUES
('motor', 'motor', 1),
('motor', 'electronic', 2);
```

### Cập nhật mapping hiện tại:

```sql
-- Thêm category mới vào service hiện tại
INSERT INTO service_part_categories (service_category, part_category, priority) 
VALUES ('charging', 'battery', 3);

-- Hoặc xóa mapping không cần thiết
DELETE FROM service_part_categories 
WHERE service_category = 'charging' AND part_category = 'battery';
```

## 🔍 Query Examples

### Xem tất cả mappings:

```sql
SELECT 
    s.name AS service_name,
    s.category AS service_category,
    GROUP_CONCAT(DISTINCT spc.part_category ORDER BY spc.priority) AS part_categories
FROM services s
LEFT JOIN service_part_categories spc ON s.category = spc.service_category
GROUP BY s.service_id, s.name, s.category
ORDER BY s.service_id;
```

### Xem parts cho một service cụ thể:

```sql
SELECT p.*
FROM parts p
WHERE p.category IN (
    SELECT part_category 
    FROM service_part_categories 
    WHERE service_category = 'charging'
);
```

## 🚀 Benefits

1. **Giảm Rối Mắt:** Chỉ hiển thị phụ tùng liên quan đến dịch vụ
2. **Tăng Hiệu Quả:** Nhân viên tìm phụ tùng nhanh hơn
3. **Giảm Lỗi:** Tránh chọn nhầm phụ tùng không phù hợp
4. **Dễ Bảo Trì:** Thêm/sửa mapping không cần thay đổi code
5. **Scalable:** Dễ dàng thêm service mới và mapping mới

## 📦 Files Changed

- ✅ `mysql-init/03_service_parts_mapping.sql` - Database schema và seed data
- ✅ `staffservice/.../domain/ServicePartCategory.java` - Entity
- ✅ `staffservice/.../repository/ServicePartCategoryRepository.java` - Repository
- ✅ `staffservice/.../repository/PartRepository.java` - Thêm `findByCategoryIn()`
- ✅ `staffservice/.../service/PartService.java` - Thêm `getPartsForService()`
- ✅ `staffservice/.../controller/PartController.java` - Thêm endpoint mới

---

**✨ Hệ thống đã sẵn sàng sử dụng!**

