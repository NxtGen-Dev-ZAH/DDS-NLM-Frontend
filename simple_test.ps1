# Simple DSS Workflow Test Script
Write-Host "🧪 Testing DSS Workflow System" -ForegroundColor Green

$BaseUrl = "http://localhost:8000"

# Test 1: Health Check
Write-Host "`n📋 Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET
    Write-Host "✅ System Status: Healthy" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Simple Log Creation
Write-Host "`n📝 Creating Test Log" -ForegroundColor Yellow
$logData = @{
    source_ip = "192.168.1.100"
    destination_ip = "10.0.0.1"
    source_port = 12345
    destination_port = 22
    protocol = "TCP"
    packet_size = 1024
    severity = "info"
}

try {
    $json = $logData | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$BaseUrl/api/logs" -Method POST -Body $json -ContentType "application/json"
    Write-Host "✅ Log created with ID: $($result.id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Log creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Agent Analysis
Write-Host "`n🤖 Testing Agent Analysis" -ForegroundColor Yellow
$analysisData = @{
    log_data = @{
        source_ip = "203.0.113.10"
        destination_ip = "10.0.0.5"
        source_port = 54321
        destination_port = 22
        protocol = "TCP"
        packet_size = 2048
        severity = "high"
    }
    session_id = "test_session"
}

try {
    $json = $analysisData | ConvertTo-Json -Depth 3
    $result = Invoke-RestMethod -Uri "$BaseUrl/api/agents/analyze-log" -Method POST -Body $json -ContentType "application/json"
    Write-Host "✅ Analysis completed - Workflow ID: $($result.workflow_id)" -ForegroundColor Green
    Write-Host "Status: $($result.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Agent analysis failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Retrieve Recent Logs
Write-Host "`n📊 Retrieving Recent Logs" -ForegroundColor Yellow
try {
    $logs = Invoke-RestMethod -Uri "$BaseUrl/api/logs?limit=3" -Method GET
    Write-Host "✅ Retrieved $($logs.Count) logs" -ForegroundColor Green
    foreach ($log in $logs) {
        Write-Host "  - Log $($log.id): $($log.source_ip) → $($log.destination_ip)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Log retrieval failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Basic testing completed!" -ForegroundColor Green
Write-Host "Frontend URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan 