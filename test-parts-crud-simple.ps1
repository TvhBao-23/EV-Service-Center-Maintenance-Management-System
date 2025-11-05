# Test Parts CRUD Operations
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PARTS CRUD TEST" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8083/api/staff"

# Test 1: Get all parts
Write-Host "`nTest 1: Get all parts..." -ForegroundColor Yellow
try {
    $parts = Invoke-RestMethod -Uri "$baseUrl/parts" -Method GET
    Write-Host "SUCCESS: Found $($parts.Count) parts" -ForegroundColor Green
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Add new part
Write-Host "`nTest 2: Add new part..." -ForegroundColor Yellow
$newPart = @{
    partCode = "TEST-PT-$(Get-Random -Minimum 100 -Maximum 999)"
    name = "Test Part $(Get-Date -Format 'HH:mm:ss')"
    category = "battery"
    manufacturer = "Test Manufacturer"
    unitPrice = 5000000
    stockQuantity = 20
    minStockLevel = 5
    location = "Test-01"
    status = "available"
    description = "Test part created by script"
} | ConvertTo-Json

try {
    $created = Invoke-RestMethod -Uri "$baseUrl/parts" -Method POST -Body $newPart -ContentType "application/json"
    Write-Host "SUCCESS: Created part ID: $($created.partId)" -ForegroundColor Green
    Write-Host "  Code: $($created.partCode)" -ForegroundColor Gray
    Write-Host "  Name: $($created.name)" -ForegroundColor Gray
    $testPartId = $created.partId
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Test 3: Update part
Write-Host "`nTest 3: Update part..." -ForegroundColor Yellow
$updatedPart = @{
    partCode = $created.partCode
    name = "Updated Test Part $(Get-Date -Format 'HH:mm:ss')"
    category = "electronics"
    manufacturer = "Samsung"
    unitPrice = 7500000
    stockQuantity = 30
    minStockLevel = 10
    location = "A-02"
    status = "available"
    description = "Updated test part"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$baseUrl/parts/$testPartId" -Method PUT -Body $updatedPart -ContentType "application/json"
    Write-Host "SUCCESS: Updated part" -ForegroundColor Green
    Write-Host "  New name: $($result.name)" -ForegroundColor Gray
    Write-Host "  New price: $($result.unit_price)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Test 4: Delete part
Write-Host "`nTest 4: Delete part (Y/N)? " -ForegroundColor Yellow -NoNewline
$confirm = Read-Host

if ($confirm -eq 'Y' -or $confirm -eq 'y') {
    try {
        Invoke-RestMethod -Uri "$baseUrl/parts/$testPartId" -Method DELETE
        Write-Host "SUCCESS: Deleted part" -ForegroundColor Green
        
        Start-Sleep -Seconds 1
        $allParts = Invoke-RestMethod -Uri "$baseUrl/parts" -Method GET
        $found = $allParts | Where-Object { $_.partId -eq $testPartId }
        
        if (-not $found) {
            Write-Host "SUCCESS: Part confirmed deleted" -ForegroundColor Green
        }
    } catch {
        Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "SKIPPED: Delete test. Part ID: $testPartId" -ForegroundColor Cyan
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "ALL TESTS COMPLETED!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

