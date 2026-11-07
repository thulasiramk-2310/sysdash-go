import psutil
import requests
import socket
import time

BACKEND_URL = "http://localhost:8080/api/metrics"
HOSTNAME = socket.gethostname()

# Network throughput state
prev_net = psutil.net_io_counters()
prev_time = time.time()

while True:
    # Collect top processes by CPU usage
    proc_list = []
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
        try:
            proc_list.append({
                "pid": proc.info['pid'],
                "name": proc.info['name'],
                "cpu": proc.info['cpu_percent'],
                "memory": proc.info['memory_info'].rss
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
    # Sort and take top 10 by CPU
    top_procs = sorted(proc_list, key=lambda p: p['cpu'], reverse=True)[:10]
    print("[DEBUG] Top process RSS values:")
    for proc in top_procs:
        print(f"PID: {proc['pid']}, Name: {proc['name']}, RSS: {proc['memory']}")

    # Network throughput calculation
    curr_net = psutil.net_io_counters()
    curr_time = time.time()
    interval = max(curr_time - prev_time, 1e-6)
    up_bps = (curr_net.bytes_sent - prev_net.bytes_sent) / interval
    down_bps = (curr_net.bytes_recv - prev_net.bytes_recv) / interval
    prev_net = curr_net
    prev_time = curr_time

    metrics = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "hostname": HOSTNAME,
        "cpu": {
            "total": psutil.cpu_percent(),
            "per_core": psutil.cpu_percent(percpu=True),
            "cores": psutil.cpu_count(logical=True)
        },
        "memory": {
            "total": psutil.virtual_memory().total,
            "used": psutil.virtual_memory().used,
            "percent": psutil.virtual_memory().percent
        },
        "disk": {
            "partitions": [{
                "device": p.device,
                "percent": psutil.disk_usage(p.mountpoint).percent
            } for p in psutil.disk_partitions() if p.fstype],
            "io": {
                "read_rate": psutil.disk_io_counters().read_bytes,
                "write_rate": psutil.disk_io_counters().write_bytes
            }
        },
        "network": {
            "bytes_sent_rate": up_bps,
            "bytes_recv_rate": down_bps
        },
        "gpu": {"usage": 0},
        "processes": top_procs,
        "system": {}
    }
    try:
        resp = requests.post(BACKEND_URL, json=metrics)
        print(f"POST {BACKEND_URL} status: {resp.status_code}")
    except Exception as e:
        print(f"Error posting metrics: {e}")
    time.sleep(5)
