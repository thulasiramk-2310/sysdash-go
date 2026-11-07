#!/usr/bin/env pwsh
# PowerShell test script for Windows

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Testing SysDash Backend API" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "http://localhost:8080"

# Test 1: Health Check
Write-Host "[TEST 1] Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/health" -Method Get
    Write-Host "✓ Health check passed" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "✗ Health check failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: POST Metrics
Write-Host "[TEST 2] POST Metrics" -ForegroundColor Yellow
$metrics = @{
    hostname = "test-host-windows"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    cpu = @{
        total = 45.5
        per_core = @(40, 45, 50, 48)
        cores = 4
        frequency = @{
            current = 2800
            min = 800
            max = 3600
        }
        load_avg = @(1.5, 1.3, 1.2)
    }
    memory = @{
        total = 8589934592
        used = 4294967296
        available = 4294967296
        free = 4294967296
        percent = 50.0
        swap = @{
            total = 4294967296
            used = 536870912
            free = 3758096384
            percent = 12.5
        }
    }
    disk = @{
        partitions = @(
            @{
                device = "C:\"
                mountpoint = "C:\"
                fstype = "NTFS"
                total = 536870912000
                used = 268435456000
                free = 268435456000
                percent = 50.0
            }
        )
        io = @{
            read_bytes = 123456789
            write_bytes = 987654321
            read_rate = 1048576
            write_rate = 2097152
            read_count = 12345
            write_count = 67890
        }
    }
    network = @{
        bytes_sent = 123456789
        bytes_recv = 987654321
        bytes_sent_rate = 128000
        bytes_recv_rate = 92000
        packets_sent = 123456
        packets_recv = 654321
        interfaces = @{}
    }
    gpu = @{
        usage = 35.0
        temperature = 65.0
        memory = @{
            total = 8589934592
            used = 2147483648
            percent = 25.0
        }
    }
    processes = @(
        @{
            pid = 1234
            name = "chrome.exe"
            cpu = 15.5
            memory = 8.2
            user = "testuser"
        },
        @{
            pid = 5678
            name = "code.exe"
            cpu = 12.3
            memory = 6.5
            user = "testuser"
        }
    )
    system = @{
        hostname = "test-host-windows"
        platform = "Windows"
        boot_time = (Get-Date).AddHours(-24).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        uptime_seconds = 86400
        timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    }
}

try {
    $json = $metrics | ConvertTo-Json -Depth 10
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/metrics" -Method Post -Body $json -ContentType "application/json"
    Write-Host "✓ POST metrics successful" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "✗ POST metrics failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: GET All Metrics
Write-Host "[TEST 3] GET All Metrics" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/metrics" -Method Get
    Write-Host "✓ GET metrics successful" -ForegroundColor Green
    Write-Host "Hosts found: $($response.hosts)" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "✗ GET metrics failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: GET Specific Host
Write-Host "[TEST 4] GET Specific Host Metrics" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/metrics?host=test-host-windows" -Method Get
    Write-Host "✓ GET host metrics successful" -ForegroundColor Green
    Write-Host "CPU: $($response.cpu.total)% | Memory: $($response.memory.percent)%" -ForegroundColor Cyan
} catch {
    Write-Host "✗ GET host metrics failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: GET Hosts List
Write-Host "[TEST 5] GET Hosts List" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/hosts" -Method Get
    Write-Host "✓ GET hosts list successful" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "✗ GET hosts list failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "All tests completed!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
