# Simple Parts System Test
Write-Host "`n=== TESTING PARTS SYSTEM ===" -ForegroundColor Cyan

$base = "http://localhost:8083"

Write-Host "`n1. Testing Parts API..." -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri "$base/api/staff/parts" -UseBasicParsing
    $p = $r.Content | ConvertFrom-Json
    Write-Host "   SUCCESS: $($p.Count) parts found" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing Low Stock..." -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri "$base/api/staff/parts/low-stock" -UseBasicParsing
    $p = $r.Content | ConvertFrom-Json
    Write-Host "   SUCCESS: $($p.Count) low stock items" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Testing Battery Category..." -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri "$base/api/staff/parts/category/battery" -UseBasicParsing
    $p = $r.Content | ConvertFrom-Json
    Write-Host "   SUCCESS: $($p.Count) battery parts" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Testing Part Requests..." -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri "$base/api/staff/part-requests" -UseBasicParsing
    $p = $r.Content | ConvertFrom-Json
    Write-Host "   SUCCESS: $($p.Count) requests" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== ALL TESTS COMPLETED ===" -ForegroundColor Green
Write-Host "`nFrontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Login: staff@evservice.com / staff123`n" -ForegroundColor White

