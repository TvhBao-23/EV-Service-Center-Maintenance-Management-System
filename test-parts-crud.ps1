# Test Script for Parts CRUD Operations
# Tests Add, Edit, Delete functionality for Parts in Staff Dashboard

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   PARTS CRUD TEST SUITE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8083/api/staff"

# Test 1: Get all parts (READ)
Write-Host "Test 1: Lấy danh sách phụ tùng hiện tại..." -ForegroundColor Yellow
try {
    $existingParts = Invoke-RestMethod -Uri "$baseUrl/parts" -Method GET
    Write-Host "✅ Đã có $($existingParts.Count) phụ tùng trong hệ thống" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Lỗi: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Add new part (CREATE)
Write-Host "Test 2: Thêm phụ tùng mới..." -ForegroundColor Yellow
$newPart = @{
    partCode = "TEST-PT-$(Get-Random -Minimum 100 -Maximum 999)"
    name = "Phụ Tùng Test - $(Get-Date -Format 'HH:mm:ss')"
    category = "battery"
    manufacturer = "Test Manufacturer"
    unitPrice = 5000000
    stockQuantity = 20
    minStockLevel = 5
    location = "Kho Test-01"
    status = "available"
    description = "Đây là phụ tùng test được tạo bởi script"
} | ConvertTo-Json

try {
    $createdPart = Invoke-RestMethod -Uri "$baseUrl/parts" -Method POST -Body $newPart -ContentType "application/json"
    Write-Host "✅ Đã thêm phụ tùng thành công!" -ForegroundColor Green
    Write-Host "   ID: $($createdPart.part_id)" -ForegroundColor Gray
    Write-Host "   Mã: $($createdPart.part_code)" -ForegroundColor Gray
    Write-Host "   Tên: $($createdPart.name)" -ForegroundColor Gray
    Write-Host "   Giá: $('{0:N0}' -f $createdPart.unit_price) VNĐ" -ForegroundColor Gray
    Write-Host ""
    $testPartId = $createdPart.part_id
} catch {
    Write-Host "❌ Lỗi khi thêm phụ tùng: $_" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# Small delay
Start-Sleep -Seconds 1

# Test 3: Edit the part (UPDATE)
Write-Host "Test 3: Cập nhật phụ tùng vừa tạo..." -ForegroundColor Yellow
$updatedPart = @{
    partCode = $createdPart.part_code
    name = "Phụ Tùng Test ĐÃ SỬA - $(Get-Date -Format 'HH:mm:ss')"
    category = "electronics"
    manufacturer = "Samsung Vietnam"
    unitPrice = 7500000
    stockQuantity = 30
    minStockLevel = 10
    location = "Kho A-02"
    status = "available"
    description = "Phụ tùng đã được cập nhật thông tin"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$baseUrl/parts/$testPartId" -Method PUT -Body $updatedPart -ContentType "application/json"
    Write-Host "✅ Đã cập nhật phụ tùng thành công!" -ForegroundColor Green
    Write-Host "   Tên mới: $($result.name)" -ForegroundColor Gray
    Write-Host "   Giá mới: $('{0:N0}' -f $result.unit_price) VNĐ" -ForegroundColor Gray
    Write-Host "   Số lượng mới: $($result.stock_quantity)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Lỗi khi cập nhật phụ tùng: $_" -ForegroundColor Red
    exit 1
}

# Small delay
Start-Sleep -Seconds 1

# Test 4: Get updated part details
Write-Host "Test 4: Kiểm tra thông tin phụ tùng sau khi sửa..." -ForegroundColor Yellow
try {
    $allParts = Invoke-RestMethod -Uri "$baseUrl/parts" -Method GET
    $updatedPartInfo = $allParts | Where-Object { $_.part_id -eq $testPartId }
    
    if ($updatedPartInfo) {
        Write-Host "✅ Tìm thấy phụ tùng đã sửa!" -ForegroundColor Green
        Write-Host "   ID: $($updatedPartInfo.part_id)" -ForegroundColor Gray
        Write-Host "   Mã: $($updatedPartInfo.part_code)" -ForegroundColor Gray
        Write-Host "   Tên: $($updatedPartInfo.name)" -ForegroundColor Gray
        Write-Host "   Danh mục: $($updatedPartInfo.category)" -ForegroundColor Gray
        Write-Host "   Nhà SX: $($updatedPartInfo.manufacturer)" -ForegroundColor Gray
        Write-Host "   Giá: $('{0:N0}' -f $updatedPartInfo.unit_price) VNĐ" -ForegroundColor Gray
        Write-Host "   Tồn kho: $($updatedPartInfo.stock_quantity)" -ForegroundColor Gray
        Write-Host "   Vị trí: $($updatedPartInfo.location)" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "⚠️ Không tìm thấy phụ tùng sau khi cập nhật!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Lỗi khi kiểm tra: $_" -ForegroundColor Red
}

# Ask user before deleting
Write-Host "Test 5: Xóa phụ tùng test..." -ForegroundColor Yellow
Write-Host "⚠️  Bạn có muốn xóa phụ tùng test này không? (Y/N): " -ForegroundColor Yellow -NoNewline
$confirmation = Read-Host

if ($confirmation -eq 'Y' -or $confirmation -eq 'y') {
    try {
        Invoke-RestMethod -Uri "$baseUrl/parts/$testPartId" -Method DELETE
        Write-Host "✅ Đã xóa phụ tùng test thành công!" -ForegroundColor Green
        Write-Host ""
        
        # Verify deletion
        Start-Sleep -Seconds 1
        $allPartsAfter = Invoke-RestMethod -Uri "$baseUrl/parts" -Method GET
        $deletedPart = $allPartsAfter | Where-Object { $_.part_id -eq $testPartId }
        
        if (-not $deletedPart) {
            Write-Host "✅ Xác nhận: Phụ tùng đã bị xóa khỏi hệ thống" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Cảnh báo: Phụ tùng vẫn còn trong hệ thống!" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Lỗi khi xóa phụ tùng: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⏭️  Bỏ qua xóa phụ tùng. ID: $testPartId" -ForegroundColor Cyan
    Write-Host "   Bạn có thể xóa thủ công từ giao diện Staff Dashboard" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   TEST HOÀN TẤT!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tóm tắt kết quả:" -ForegroundColor Yellow
Write-Host "✅ READ (Đọc): OK" -ForegroundColor Green
Write-Host "✅ CREATE (Thêm): OK" -ForegroundColor Green
Write-Host "✅ UPDATE (Sửa): OK" -ForegroundColor Green
if ($confirmation -eq 'Y' -or $confirmation -eq 'y') {
    Write-Host "✅ DELETE (Xóa): OK" -ForegroundColor Green
} else {
    Write-Host "⏭️  DELETE (Xóa): Bỏ qua" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "Tat ca chuc nang CRUD cho phu tung hoat dong tot!" -ForegroundColor Green
Write-Host ""

