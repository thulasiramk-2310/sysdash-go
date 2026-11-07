# SysDash CLI Tools

Three command-line monitoring tools for different use cases.

## Tools Overview

| Tool | Description | Dependencies | Best For |
|------|-------------|--------------|----------|
| **cli.py** | Full-featured dashboard | psutil + rich | Beautiful terminal UI |
| **cli_mini.py** | Minimal dashboard | psutil only | Quick checks, no dependencies |
| **cli_remote.py** | Remote monitoring | requests + rich | Monitoring via backend API |

## 1. Full CLI Dashboard (`cli.py`)

Beautiful terminal dashboard with rich UI components.

### Features

- ✅ Real-time CPU, Memory, Disk, Network monitoring
- ✅ Color-coded progress bars and metrics
- ✅ Top processes table
- ✅ Multi-core CPU visualization
- ✅ Partition-level disk usage
- ✅ Network interface statistics

### Installation

```powershell
pip install rich psutil
```

### Usage

```powershell
# Basic usage
python cli.py

# Update every 0.5 seconds
python cli.py --interval 0.5

# Custom hostname
python cli.py --hostname production-server

# Fast refresh (0.2s)
python cli.py --interval 0.2
```

### Screenshot (Text Representation)

```
══════════════════════════════════════════════════════════════════════════════
  SysDash CLI | DESKTOP-PC | Uptime: 00:05:23 | 2025-11-07 14:30:45
══════════════════════════════════════════════════════════════════════════════

╭──────────── CPU & Memory ────────────╮  ╭──────── Disk Usage ────────╮
│ CPU      45.2%  ████████████░░░░░░░ │  │ Device      Used    Usage  │
│ Memory   68.5%  ██████████████░░░░░ │  │ C:\      256/512GB ███████ │
│ Swap     12.5%  ██░░░░░░░░░░░░░░░░░ │  │                            │
│                                      │  │ I/O Rates                  │
│ CPU Cores                            │  │   Read    2.34 MB/s        │
│   Core 0  42.1%  ████████░░          │  │   Write   1.12 MB/s        │
│   Core 1  48.3%  █████████░          │  ╰────────────────────────────╯
│   Core 2  43.5%  ████████░░          │
│   Core 3  47.0%  █████████░          │  ╭───────── Network ──────────╮
╰──────────────────────────────────────╯  │ Current Rates              │
                                           │   Upload     125.3 KB/s    │
╭──────────── Top Processes ────────────╮  │   Download    89.7 KB/s    │
│ PID      Name              CPU    Mem │  │                            │
│ 1234     chrome.exe       15.5%  8.2%│  │ Total Transfer             │
│ 2345     code.exe         12.3%  6.5%│  │   Sent        12.34 GB     │
│ 3456     node.exe          8.1%  4.2%│  │   Received    45.67 GB     │
╰───────────────────────────────────────╯  ╰────────────────────────────╯

────────────────────────────────────────────────────────────────────────────
  Press Ctrl+C to exit | Update: 1.0s
────────────────────────────────────────────────────────────────────────────
```

### Keyboard Controls

- `Ctrl+C` - Exit dashboard

### Arguments

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `--interval` | float | 1.0 | Update interval in seconds |
| `--hostname` | string | system | Custom hostname |

## 2. Mini CLI Dashboard (`cli_mini.py`)

Lightweight dashboard without external dependencies (besides psutil).

### Features

- ✅ No rich library required
- ✅ Pure ASCII UI
- ✅ Fast and lightweight
- ✅ All core metrics included
- ✅ Works on any terminal

### Installation

```powershell
pip install psutil
```

### Usage

```powershell
# Basic usage
python cli_mini.py

# Custom interval
python cli_mini.py --interval 2

# Custom hostname
python cli_mini.py --hostname my-server
```

### Screenshot (Text Representation)

```
================================================================================
  SYSDASH CLI MINI | DESKTOP-PC | Uptime: 323s | 14:30:45
================================================================================

CPU USAGE:
  Total: ████████████████████░░░░░░░░░░░░░░░░░░░░ 45.2%
  Cores: 4 cores
    Core 0:  42.1%  ████████
    Core 1:  48.3%  █████████
    Core 2:  43.5%  ████████
    Core 3:  47.0%  █████████

MEMORY:
  RAM:  ██████████████████████████░░░░░░░░░░░░░░ 68.5%
        5.42 GB / 8.00 GB
  Swap: ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 12.5%
        512.00 MB / 4.00 GB

DISK:
  C:\: ████████████████████░░░░░░░░░░░░░░░░░░░░ 50.0%
        256.00 GB / 512.00 GB
  I/O:  Read: 2.34 MB/s  Write: 1.12 MB/s

NETWORK:
  Upload:   125.30 KB/s
  Download: 89.70 KB/s
  Total Sent:     12.34 GB
  Total Received: 45.67 GB

TOP PROCESSES:
  PID      Name                      CPU%     Memory%
  --------------------------------------------------
  1234     chrome.exe                15.5     8.2
  2345     code.exe                  12.3     6.5
  3456     node.exe                   8.1     4.2

--------------------------------------------------------------------------------
  Press Ctrl+C to exit | Update interval: 1.0s
--------------------------------------------------------------------------------
```

## 3. Remote CLI Dashboard (`cli_remote.py`)

Monitor multiple hosts via the Go backend API.

### Features

- ✅ Connect to Go backend (no local collection)
- ✅ View all monitored hosts
- ✅ Multi-host support
- ✅ Real-time updates from backend
- ✅ Beautiful rich UI

### Prerequisites

```powershell
# Backend must be running
cd backend
go run .
```

### Installation

```powershell
pip install rich requests
```

### Usage

```powershell
# Connect to local backend
python cli_remote.py

# Connect to remote backend
python cli_remote.py --backend http://192.168.1.100:8080

# Monitor specific host
python cli_remote.py --host production-web-01

# Custom update interval
python cli_remote.py --interval 5
```

### Screenshot (Text Representation)

```
══════════════════════════════════════════════════════════════════════════════
  SysDash Remote Monitor | Backend: http://localhost:8080 | 2025-11-07 14:30:45
══════════════════════════════════════════════════════════════════════════════

╭─ Monitored Hosts ─╮  ╭──────────── Metrics: production-web-01 ────────────╮
│ #  Hostname  Status│  │ System                                              │
│ 1  prod-web  ● Onln│  │   Hostname     production-web-01                   │
│ 2  prod-db   ● Onln│  │   Timestamp    2025-11-07T14:30:45Z               │
│ 3  prod-cache● Onln│  │                                                     │
╰───────────────────╯  │ CPU                                                 │
                       │   Usage        45.2% ████████████░░░░░░░░          │
╭── Top Processes ──╮  │   Cores        4                                    │
│ PID   Name    CPU%│  │                                                     │
│ 1234  chrome  15.5│  │ Memory                                              │
│ 2345  code    12.3│  │   Usage        68.5% ██████████████░░░░░░          │
│ 3456  node     8.1│  │   Used/Total   5.4 GB / 8.0 GB                     │
╰───────────────────╯  │                                                     │
                       │ Disk                                                │
                       │   Usage        50.0% ██████████░░░░░░░░░░          │
                       │   Used/Total   256 GB / 512 GB                      │
                       │   I/O Read     2.34 MB/s                            │
                       │   I/O Write    1.12 MB/s                            │
                       │                                                     │
                       │ Network                                             │
                       │   Upload       125.3 KB/s                           │
                       │   Download     89.7 KB/s                            │
                       ╰─────────────────────────────────────────────────────╯

────────────────────────────────────────────────────────────────────────────
  Press Ctrl+C to exit | Update: 2.0s
────────────────────────────────────────────────────────────────────────────
```

### Arguments

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `--backend` | string | http://localhost:8080 | Backend server URL |
| `--interval` | float | 2.0 | Update interval in seconds |
| `--host` | string | all | Monitor specific host |

## Comparison

### When to Use Each Tool

**Use `cli.py` when:**
- You want beautiful, colorful UI
- Running on local machine
- Need detailed per-core CPU stats
- Want best visualization

**Use `cli_mini.py` when:**
- You want minimal dependencies
- Running in restricted environments
- Need quick system check
- Terminal doesn't support rich formatting

**Use `cli_remote.py` when:**
- Monitoring multiple remote hosts
- Backend is already running
- Need centralized view
- Want to see all hosts at once

## Performance Impact

| Tool | CPU Usage | Memory | Network |
|------|-----------|--------|---------|
| cli.py | < 1% | ~25 MB | None (local) |
| cli_mini.py | < 0.5% | ~15 MB | None (local) |
| cli_remote.py | < 0.5% | ~30 MB | HTTP/2s (minimal) |

## Troubleshooting

### Error: Module 'rich' not found

```powershell
pip install rich
```

### Error: Permission denied (psutil)

**Windows:** Run as Administrator
```powershell
# Right-click PowerShell -> Run as Administrator
python cli.py
```

**Linux/macOS:**
```bash
sudo python3 cli.py
```

### Error: Cannot connect to backend

```powershell
# Check if backend is running
curl http://localhost:8080/health

# Start backend if not running
cd backend
go run .
```

### Display issues (garbled characters)

Try the mini version:
```powershell
python cli_mini.py
```

Or use a better terminal:
- Windows: Windows Terminal (from Microsoft Store)
- Linux: GNOME Terminal, Konsole
- macOS: iTerm2

## Advanced Usage

### Run as Background Monitor

**Linux (with screen):**
```bash
screen -S monitor
python cli.py
# Press Ctrl+A then D to detach
# screen -r monitor to reattach
```

**Windows (with background process):**
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python cli.py" -WindowStyle Minimized
```

### Log Output to File

```powershell
# For cli_mini.py (simpler output)
python cli_mini.py > monitor.log 2>&1
```

### Monitor Multiple Hosts Simultaneously

```powershell
# Terminal 1
python cli_remote.py --host host-1

# Terminal 2
python cli_remote.py --host host-2

# Terminal 3
python cli_remote.py --host host-3
```

## Examples

### Example 1: Quick System Check

```powershell
# Run mini dashboard for 10 seconds then stop
timeout 10 python cli_mini.py
```

### Example 2: Monitor Production Server

```powershell
# Connect to production backend
python cli_remote.py --backend https://monitor.company.com --host prod-web-01
```

### Example 3: High-Frequency Monitoring

```powershell
# Update every 0.1 seconds (10 times per second)
python cli.py --interval 0.1
```

### Example 4: Minimal Resource Usage

```powershell
# Use mini version with slow updates
python cli_mini.py --interval 5
```

## Integration

### Use with Scripts

```python
from collector import MetricsCollector

# Get one snapshot
collector = MetricsCollector()
metrics = collector.collect_all()

# Check if CPU is high
if metrics['cpu']['total'] > 80:
    print("WARNING: High CPU usage!")
```

### Pipe to Other Tools

```powershell
# Export metrics to JSON
python -c "from collector import MetricsCollector; import json; c=MetricsCollector(); print(json.dumps(c.collect_all()))" > metrics.json
```

## Tips

1. **Performance**: Use `--interval` to control refresh rate
2. **Terminal Size**: Resize terminal for best experience (minimum 80x24)
3. **Color Support**: Enable ANSI colors in terminal settings
4. **SSH**: Works great over SSH connections
5. **tmux/screen**: Perfect for persistent monitoring sessions

## Next Steps

- Use `cli.py` for local monitoring with rich UI
- Use `cli_remote.py` to monitor multiple hosts
- Combine with web dashboard for complete visibility
- Set up alerts based on threshold values

## License

MIT License - See LICENSE file for details
