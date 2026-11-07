# Python Metrics Collector

Real-time system metrics collector using `psutil` that sends data to the Go backend.

## Features

- ✅ **CPU Metrics**: Total usage, per-core usage, frequency, load average
- ✅ **Memory Metrics**: Total, used, available, free, swap
- ✅ **Disk Metrics**: Partition usage, I/O rates (read/write)
- ✅ **Network Metrics**: Bytes sent/received, rates, per-interface stats
- ✅ **Process Metrics**: Top 10 processes by CPU usage
- ✅ **System Info**: Hostname, uptime, platform

## Installation

### 1. Install Python Dependencies

```bash
cd python
pip install -r requirements.txt
```

Or install individually:
```bash
pip install psutil requests rich websocket-client
```

### 2. Verify Installation

```bash
python -c "import psutil; print(f'psutil version: {psutil.__version__}')"
```

## Usage

### Basic Usage (Default Settings)

```bash
python collector.py
```

This will:
- Collect metrics every 2 seconds
- Send to backend at `http://localhost:8080`
- Use system hostname

### Custom Configuration

```bash
# Custom interval (5 seconds)
python collector.py --interval 5

# Custom backend URL
python collector.py --backend http://192.168.1.100:8080

# Custom hostname
python collector.py --hostname production-server-01

# Enable debug logging
python collector.py --debug

# All options combined
python collector.py --interval 3 --backend http://localhost:8080 --hostname my-server --debug
```

## Command-Line Arguments

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `--interval` | int | 2 | Collection interval in seconds |
| `--backend` | str | http://localhost:8080 | Backend server URL |
| `--hostname` | str | system hostname | Custom hostname identifier |
| `--debug` | flag | false | Enable debug logging |

## Output Example

```
[14:30:45] CPU: 45.2% | Memory: 68.5% | Disk I/O: ↑2.34MB/s ↓1.12MB/s | Network: ↑125.3KB/s ↓89.7KB/s
```

## Metrics Format (JSON)

The collector sends metrics in this format:

```json
{
  "timestamp": "2025-11-07T14:30:45.123456",
  "hostname": "production-server",
  "cpu": {
    "total": 45.2,
    "per_core": [42.1, 48.3, 43.5, 47.0],
    "cores": 4,
    "frequency": {
      "current": 2800.0,
      "min": 800.0,
      "max": 3600.0
    },
    "load_avg": [1.5, 1.3, 1.2]
  },
  "memory": {
    "total": 17179869184,
    "available": 5368709120,
    "used": 11811160064,
    "free": 5368709120,
    "percent": 68.5,
    "swap": {
      "total": 4294967296,
      "used": 536870912,
      "free": 3758096384,
      "percent": 12.5
    }
  },
  "disk": {
    "partitions": [
      {
        "device": "C:\\",
        "mountpoint": "C:\\",
        "fstype": "NTFS",
        "total": 536870912000,
        "used": 322122547200,
        "free": 214748364800,
        "percent": 60.0
      }
    ],
    "io": {
      "read_bytes": 123456789,
      "write_bytes": 987654321,
      "read_rate": 1048576,
      "write_rate": 2097152,
      "read_count": 12345,
      "write_count": 67890
    }
  },
  "network": {
    "bytes_sent": 123456789,
    "bytes_recv": 987654321,
    "bytes_sent_rate": 128000,
    "bytes_recv_rate": 92000,
    "packets_sent": 123456,
    "packets_recv": 654321,
    "interfaces": {
      "Ethernet": {
        "bytes_sent": 123456789,
        "bytes_recv": 987654321,
        "packets_sent": 123456,
        "packets_recv": 654321,
        "errin": 0,
        "errout": 0,
        "dropin": 0,
        "dropout": 0
      }
    }
  },
  "processes": [
    {
      "pid": 1234,
      "name": "chrome.exe",
      "cpu": 15.5,
      "memory": 8.2,
      "user": "username"
    }
  ],
  "system": {
    "hostname": "production-server",
    "platform": "Windows",
    "boot_time": "2025-11-06T08:00:00",
    "uptime_seconds": 108000,
    "timestamp": "2025-11-07T14:30:45"
  }
}
```

## Integration with Backend

The collector sends metrics to the Go backend via:
- **HTTP POST** to `/api/metrics`
- **Content-Type**: `application/json`

### Backend Requirements

Your Go backend should have:
1. Endpoint: `POST /api/metrics`
2. Health check: `GET /health`

## Error Handling

- **Backend Unavailable**: Continues collecting, logs warnings
- **Permission Errors**: Skips inaccessible resources
- **Network Errors**: Logs errors, retries on next interval

## Performance

- **CPU Impact**: < 1% on modern systems
- **Memory Usage**: ~20-30 MB
- **Network**: ~1-5 KB per transmission (depending on process count)

## Advanced Usage

### Run as Background Service (Linux)

Create systemd service `/etc/systemd/system/metrics-collector.service`:

```ini
[Unit]
Description=System Metrics Collector
After=network.target

[Service]
Type=simple
User=monitoring
WorkingDirectory=/opt/metrics-collector
ExecStart=/usr/bin/python3 /opt/metrics-collector/collector.py --interval 2
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable metrics-collector
sudo systemctl start metrics-collector
sudo systemctl status metrics-collector
```

### Run as Windows Service

Use `nssm` (Non-Sucking Service Manager):

```cmd
nssm install MetricsCollector "C:\Python\python.exe" "C:\collector\collector.py"
nssm set MetricsCollector AppDirectory "C:\collector"
nssm start MetricsCollector
```

## Troubleshooting

### Permission Denied Errors

Some disk partitions may require elevated privileges:
```bash
# Linux
sudo python collector.py

# Windows (Run as Administrator)
```

### Backend Connection Errors

Check if backend is running:
```bash
curl http://localhost:8080/health
```

### Import Errors

Ensure all dependencies are installed:
```bash
pip install -r requirements.txt --upgrade
```

## Next Steps

1. **Start Go Backend** (see `../backend/README.md`)
2. **Run Collector**: `python collector.py`
3. **View Dashboard**: Open `http://localhost:3000`

## GPU Support (Optional)

To enable real GPU monitoring, install additional libraries:

### NVIDIA GPUs
```bash
pip install py3nvml nvidia-ml-py
```

### AMD GPUs
```bash
pip install pyadl
```

### Generic GPU Utility
```bash
pip install gputil
```

Then modify `get_gpu_metrics()` in `collector.py` to use these libraries.
