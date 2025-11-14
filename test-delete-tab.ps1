# Test Delete Tab API Flow

$API_URL = "http://localhost:5000/api"

Write-Host "`n🔐 Step 1: Login..." -ForegroundColor Cyan
$loginBody = @{
    email = "admin@gmail.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Login successful" -ForegroundColor Green
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    # Step 2: Get current tabs
    Write-Host "`n📋 Step 2: Get current tabs..." -ForegroundColor Cyan
    $tabsResponse = Invoke-RestMethod -Uri "$API_URL/pricing" -Headers $headers
    Write-Host "Current tabs: $($tabsResponse.tabs.Count)"
    foreach ($tab in $tabsResponse.tabs) {
        Write-Host "  ID: $($tab.id) | Name: $($tab.name)"
    }
    
    # Step 3: Add a new tab
    Write-Host "`n➕ Step 3: Adding new tab..." -ForegroundColor Cyan
    $addBody = @{ name = "PS TEST TAB" } | ConvertTo-Json
    $addResponse = Invoke-RestMethod -Uri "$API_URL/pricing/tabs" -Method POST -Body $addBody -Headers $headers
    $newTabId = $addResponse.id
    Write-Host "✅ Tab created with ID: $newTabId" -ForegroundColor Green
    
    # Step 4: Verify tab was added
    Write-Host "`n✔️  Step 4: Verify tab exists..." -ForegroundColor Cyan
    $verifyResponse = Invoke-RestMethod -Uri "$API_URL/pricing?_=$([DateTimeOffset]::Now.ToUnixTimeMilliseconds())" -Headers $headers
    $foundTab = $verifyResponse.tabs | Where-Object { $_.id -eq $newTabId }
    if ($foundTab) {
        Write-Host "✅ New tab found: ID $($foundTab.id) | Name: $($foundTab.name)" -ForegroundColor Green
    } else {
        throw "Tab $newTabId not found after creation!"
    }
    
    # Step 5: Delete the tab
    Write-Host "`n🗑️  Step 5: Deleting tab ID $newTabId..." -ForegroundColor Cyan
    $deleteResponse = Invoke-RestMethod -Uri "$API_URL/pricing/tabs/$newTabId" -Method DELETE -Headers $headers
    Write-Host "Delete response: $($deleteResponse.message)" -ForegroundColor Green
    
    # Step 6: Verify tab was deleted
    Write-Host "`n✔️  Step 6: Verify tab was deleted..." -ForegroundColor Cyan
    $finalResponse = Invoke-RestMethod -Uri "$API_URL/pricing?_=$([DateTimeOffset]::Now.ToUnixTimeMilliseconds())" -Headers $headers
    Write-Host "Tabs after deleting: $($finalResponse.tabs.Count)"
    $stillExists = $finalResponse.tabs | Where-Object { $_.id -eq $newTabId }
    if ($stillExists) {
        throw "Tab $newTabId still exists after deletion!"
    } else {
        Write-Host "✅ Tab $newTabId successfully removed" -ForegroundColor Green
    }
    
    Write-Host "`n🎉 All tests passed!" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ Test failed: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
