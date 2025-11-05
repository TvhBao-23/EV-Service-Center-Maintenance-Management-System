# Parts CRUD Test with Delete Confirmation
# Tests all CRUD operations including delete

$baseUrl = "http://localhost:8080"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PARTS CRUD TEST WITH DELETE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Get all parts
Write-Host "Test 1: Get all parts..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/staff/parts" -Method Get -Headers $headers
    $initialCount = $response.Count
    Write-Host "SUCCESS: Found $initialCount parts" -ForegroundColor Green
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Test 2: Add new part
Write-Host ""
Write-Host "Test 2: Add new part..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "HH:mm:ss"
$newPart = @{
    partCode = "TEST-PT-$(Get-Random -Minimum 100 -Maximum 999)"
    name = "Test Part $timestamp"
    category = "electronics"
    manufacturer = "Test Manufacturer"
    unitPrice = 150000
    stockQuantity = 20
    minStockLevel = 5
    location = "Kho A-01"
    status = "available"
    description = "This is a test part for CRUD operations"
} | ConvertTo-Json

try {
    $created = Invoke-RestMethod -Uri "$baseUrl/api/staff/parts" -Method Post -Headers $headers -Body $newPart
    $partId = $created.partId
    Write-Host "SUCCESS: Created part ID: $partId" -ForegroundColor Green
    Write-Host "  Code: $($created.partCode)" -ForegroundColor Gray
    Write-Host "  Name: $($created.name)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Test 3: Update part
Write-Host ""
Write-Host "Test 3: Update part..." -ForegroundColor Yellow
$updateTimestamp = Get-Date -Format "HH:mm:ss"
$updatedPart = @{
    partId = $partId
    partCode = $created.partCode
    name = "Updated Test Part $updateTimestamp"
    category = "electronics"
    manufacturer = "Updated Manufacturer"
    unitPrice = 175000
    stockQuantity = 25
    minStockLevel = 5
    location = "Kho B-02"
    status = "available"
    description = "Updated description"
} | ConvertTo-Json

try {
    $updated = Invoke-RestMethod -Uri "$baseUrl/api/staff/parts/$partId" -Method Put -Headers $headers -Body $updatedPart
    Write-Host "SUCCESS: Updated part" -ForegroundColor Green
    Write-Host "  New name: $($updated.name)" -ForegroundColor Gray
    Write-Host "  New price: $($updated.unitPrice) VND" -ForegroundColor Gray
    Write-Host "  New location: $($updated.location)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Test 4: Delete part
Write-Host ""
Write-Host "Test 4: Delete part..." -ForegroundColor Yellow
Write-Host "Deleting part ID: $partId" -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "$baseUrl/api/staff/parts/$partId" -Method Delete -Headers $headers | Out-Null
    Write-Host "SUCCESS: Deleted part" -ForegroundColor Green
    
    # Verify deletion
    Start-Sleep -Seconds 1
    try {
        $checkDeleted = Invoke-RestMethod -Uri "$baseUrl/api/staff/parts" -Method Get -Headers $headers
        $found = $checkDeleted | Where-Object { $_.partId -eq $partId }
        if ($null -eq $found) {
            Write-Host "SUCCESS: Part confirmed deleted" -ForegroundColor Green
        } else {
            Write-Host "WARNING: Part still exists after delete!" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "INFO: Could not verify deletion" -ForegroundColor Gray
    }
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Final verification
Write-Host ""
Write-Host "Test 5: Verify final count..." -ForegroundColor Yellow
try {
    $finalResponse = Invoke-RestMethod -Uri "$baseUrl/api/staff/parts" -Method Get -Headers $headers
    $finalCount = $finalResponse.Count
    Write-Host "Initial count: $initialCount" -ForegroundColor Gray
    Write-Host "Final count: $finalCount" -ForegroundColor Gray
    
    if ($finalCount -eq $initialCount) {
        Write-Host "SUCCESS: Count matches (added and deleted 1 part)" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Count mismatch" -ForegroundColor Yellow
    }
} catch {
    Write-Host "INFO: Could not verify final count" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "ALL TESTS COMPLETED!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

