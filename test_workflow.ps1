#!/usr/bin/env pwsh
# DSS Workflow Project - Comprehensive Testing Script
# This script tests log ingestion and the complete AI agent workflow

Write-Host "🧪 DSS Workflow Project - Testing Script" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

# Configuration
$BaseUrl = "http://localhost:8000"
$FrontendUrl = "http://localhost:3000"

# Test 1: Health Check
Write-Host "`n📋 Test 1: System Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET
    Write-Host "✅ System Status: $($health.overall_status)" -ForegroundColor Green
    Write-Host "Components: $($health.components.Keys -join ', ')" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Basic Log Creation
Write-Host "`n📝 Test 2: Basic Log Creation" -ForegroundColor Yellow
$logData = @{
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    source_ip = "192.168.1.100"
    destination_ip = "10.0.0.1"
    source_port = 12345
    destination_port = 22
    protocol = "TCP"
    packet_size = 1024
    flags = "SYN"
    severity = "info"
    raw_log = "Test log entry for workflow validation"
}

try {
    $json = $logData | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$BaseUrl/api/logs" -Method POST -Body $json -ContentType "application/json"
    Write-Host "✅ Log created with ID: $($result.id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Log creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Suspicious Log Analysis (Triggers Triage Agent)
Write-Host "`n🔍 Test 3: Suspicious Log Analysis" -ForegroundColor Yellow
$suspiciousLog = @{
    log_data = @{
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        source_ip = "203.0.113.10"  # External IP
        destination_ip = "10.0.0.5"  # Internal server
        source_port = 54321
        destination_port = 22  # SSH port
        protocol = "TCP"
        packet_size = 2048
        flags = "PSH,ACK"
        severity = "high"
        raw_log = "Suspicious SSH connection attempt from external IP"
    }
    session_id = "test_session_suspicious"
    priority = "high"
}

try {
    $json = $suspiciousLog | ConvertTo-Json -Depth 3
    $result = Invoke-RestMethod -Uri "$BaseUrl/api/agents/analyze-log" -Method POST -Body $json -ContentType "application/json"
    Write-Host "✅ Workflow ID: $($result.workflow_id)" -ForegroundColor Green
    Write-Host "Status: $($result.status)" -ForegroundColor Gray
    Write-Host "Agents Involved: $($result.agents_involved -join ', ')" -ForegroundColor Gray
    Write-Host "Threat Level: $($result.results.triage.threat_level)" -ForegroundColor Gray
    Write-Host "Priority Score: $($result.results.triage.priority_score)" -ForegroundColor Gray
    
    if ($result.results.analysis) {
        Write-Host "🔬 Deep Analysis Performed" -ForegroundColor Cyan
        Write-Host "Risk Level: $($result.results.analysis.risk_level)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Suspicious log analysis failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: High-Priority Log (Should trigger Analysis Agent)
Write-Host "`n🚨 Test 4: Critical Threat Analysis" -ForegroundColor Yellow
$criticalLog = @{
    log_data = @{
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        source_ip = "198.51.100.50"  # Known malicious IP
        destination_ip = "10.0.0.10"  # Internal database server
        source_port = 8080
        destination_port = 3306  # MySQL port
        protocol = "TCP"
        packet_size = 4096
        flags = "SYN,ACK"
        severity = "critical"
        raw_log = "Multiple failed login attempts to database server from external IP"
    }
    session_id = "test_session_critical"
    priority = "critical"
}

try {
    $json = $criticalLog | ConvertTo-Json -Depth 3
    $result = Invoke-RestMethod -Uri "$BaseUrl/api/agents/analyze-log" -Method POST -Body $json -ContentType "application/json"
    Write-Host "✅ Critical Analysis Complete" -ForegroundColor Green
    Write-Host "Workflow ID: $($result.workflow_id)" -ForegroundColor Gray
    Write-Host "Execution Time: $($result.execution_time) seconds" -ForegroundColor Gray
    Write-Host "Recommendations: $($result.recommendations -join ', ')" -ForegroundColor Cyan
    Write-Host "Next Actions: $($result.next_actions -join ', ')" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Critical log analysis failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Batch Processing
Write-Host "`n📦 Test 5: Batch Log Processing" -ForegroundColor Yellow
$batchLogs = @{
    log_entries = @(
        @{
            timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            source_ip = "192.168.1.50"
            destination_ip = "10.0.0.20"
            source_port = 80
            destination_port = 8080
            protocol = "HTTP"
            packet_size = 512
            severity = "info"
        },
        @{
            timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            source_ip = "172.16.0.100"
            destination_ip = "10.0.0.30"
            source_port = 443
            destination_port = 8443
            protocol = "HTTPS"
            packet_size = 1024
            severity = "info"
        },
        @{
            timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            source_ip = "203.0.113.100"  # Potentially suspicious
            destination_ip = "10.0.0.40"
            source_port = 1234
            destination_port = 25  # SMTP
            protocol = "TCP"
            packet_size = 8192
            severity = "medium"
        }
    )
    session_id = "batch_test_session"
    priority = "normal"
}

try {
    $json = $batchLogs | ConvertTo-Json -Depth 4
    $results = Invoke-RestMethod -Uri "$BaseUrl/api/agents/batch-analyze" -Method POST -Body $json -ContentType "application/json"
    Write-Host "✅ Batch processing completed" -ForegroundColor Green
    Write-Host "Processed $($results.Count) logs" -ForegroundColor Gray
    
    foreach ($result in $results) {
        Write-Host "  - Workflow $($result.workflow_id): $($result.status)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Batch processing failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Chatbot Interaction
Write-Host "`n💬 Test 6: Chatbot Interaction" -ForegroundColor Yellow
$chatRequest = @{
    message = "What security incidents have been detected recently?"
    session_id = "chat_test_session"
}

try {
    $json = $chatRequest | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$BaseUrl/api/agents/chat" -Method POST -Body $json -ContentType "application/json"
    Write-Host "✅ Chatbot Response Received" -ForegroundColor Green
    Write-Host "Response: $($result.results.chatbot.response)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Chatbot interaction failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Recent Logs Retrieval
Write-Host "`n📊 Test 7: Recent Logs Retrieval" -ForegroundColor Yellow
try {
    $logs = Invoke-RestMethod -Uri "$BaseUrl/api/logs?limit=5" -Method GET
    Write-Host "✅ Retrieved $($logs.Count) recent logs" -ForegroundColor Green
    
    foreach ($log in $logs) {
        Write-Host "  - Log $($log.id): $($log.source_ip) → $($log.destination_ip) [$($log.severity)]" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Log retrieval failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: System Statistics
Write-Host "`n📈 Test 8: System Statistics" -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$BaseUrl/stats" -Method GET
    Write-Host "✅ System Statistics Retrieved" -ForegroundColor Green
    Write-Host "Total Workflows: $($stats.total_workflows)" -ForegroundColor Gray
    Write-Host "Successful Workflows: $($stats.successful_workflows)" -ForegroundColor Gray
    Write-Host "Average Execution Time: $($stats.average_execution_time) seconds" -ForegroundColor Gray
} catch {
    Write-Host "❌ Statistics retrieval failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Summary
Write-Host "`n🎯 Testing Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open frontend dashboard: $FrontendUrl" -ForegroundColor Cyan
Write-Host "2. View API documentation: $BaseUrl/docs" -ForegroundColor Cyan
Write-Host "3. Monitor real-time logs in the dashboard" -ForegroundColor Cyan
Write-Host "4. Test the interactive chat interface" -ForegroundColor Cyan
Write-Host "`nFor continuous testing, you can run specific API calls or use the test agents:" -ForegroundColor Gray
Write-Host "cd backend && uv run python test_agents.py" -ForegroundColor Gray 