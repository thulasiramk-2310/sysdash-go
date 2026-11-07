#!/usr/bin/env python3
"""
Test script for metrics collector
Can be run without the Go backend to verify data collection
"""

import sys
import json
from collector import MetricsCollector

def test_collector():
    """Test the metrics collector and print formatted output"""
    
    print("=" * 80)
    print("SYSTEM METRICS COLLECTOR - TEST MODE")
    print("=" * 80)
    print()
    
    # Initialize collector
    collector = MetricsCollector()
    
    # Collect all metrics
    print("Collecting metrics...")
    metrics = collector.collect_all()
    
    if not metrics:
        print("❌ Failed to collect metrics!")
        return False
    
    print("✅ Successfully collected metrics!\n")
    
    # Display formatted output
    print("-" * 80)
    print("SYSTEM INFORMATION")
    print("-" * 80)
    print(f"Hostname:      {metrics['system']['hostname']}")
    print(f"Timestamp:     {metrics['timestamp']}")
    print(f"Uptime:        {metrics['system']['uptime_seconds'] / 3600:.2f} hours")
    print()
    
    print("-" * 80)
    print("CPU METRICS")
    print("-" * 80)
    print(f"Total Usage:   {metrics['cpu']['total']:.2f}%")
    print(f"Cores:         {metrics['cpu']['cores']}")
    print(f"Frequency:     {metrics['cpu']['frequency']['current']:.0f} MHz")
    print(f"Per-Core:      {', '.join([f'{x:.1f}%' for x in metrics['cpu']['per_core']])}")
    print()
    
    print("-" * 80)
    print("MEMORY METRICS")
    print("-" * 80)
    mem = metrics['memory']
    print(f"Total:         {mem['total'] / 1024**3:.2f} GB")
    print(f"Used:          {mem['used'] / 1024**3:.2f} GB ({mem['percent']:.1f}%)")
    print(f"Available:     {mem['available'] / 1024**3:.2f} GB")
    print(f"Swap Used:     {mem['swap']['used'] / 1024**3:.2f} GB ({mem['swap']['percent']:.1f}%)")
    print()
    
    print("-" * 80)
    print("DISK METRICS")
    print("-" * 80)
    for partition in metrics['disk']['partitions']:
        print(f"Device:        {partition['device']}")
        print(f"  Mountpoint:  {partition['mountpoint']}")
        print(f"  Total:       {partition['total'] / 1024**3:.2f} GB")
        print(f"  Used:        {partition['used'] / 1024**3:.2f} GB ({partition['percent']:.1f}%)")
        print(f"  Free:        {partition['free'] / 1024**3:.2f} GB")
        print()
    
    disk_io = metrics['disk']['io']
    print(f"Read Rate:     {disk_io['read_rate'] / 1024**2:.2f} MB/s")
    print(f"Write Rate:    {disk_io['write_rate'] / 1024**2:.2f} MB/s")
    print()
    
    print("-" * 80)
    print("NETWORK METRICS")
    print("-" * 80)
    net = metrics['network']
    print(f"Sent:          {net['bytes_sent'] / 1024**3:.2f} GB total")
    print(f"Received:      {net['bytes_recv'] / 1024**3:.2f} GB total")
    print(f"Send Rate:     {net['bytes_sent_rate'] / 1024:.2f} KB/s")
    print(f"Receive Rate:  {net['bytes_recv_rate'] / 1024:.2f} KB/s")
    print()
    
    print("-" * 80)
    print("TOP PROCESSES (by CPU)")
    print("-" * 80)
    print(f"{'PID':<8} {'Name':<30} {'CPU %':<10} {'Memory %':<10} {'User':<15}")
    print("-" * 80)
    for proc in metrics['processes'][:10]:
        print(f"{proc['pid']:<8} {proc['name']:<30} {proc['cpu']:<10.2f} "
              f"{proc['memory']:<10.2f} {proc['user']:<15}")
    print()
    
    # Save to file
    output_file = "metrics_sample.json"
    with open(output_file, 'w') as f:
        json.dump(metrics, f, indent=2)
    
    print("-" * 80)
    print(f"✅ Full metrics saved to: {output_file}")
    print("-" * 80)
    print()
    
    return True


if __name__ == "__main__":
    try:
        success = test_collector()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error during test: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
