"""Quick test to see the payload being sent"""
import sys
sys.path.insert(0, 'python')

from collector import MetricsCollector
import json

collector = MetricsCollector()
metrics = collector.collect_all()

print("=== PAYLOAD ===")
print(json.dumps(metrics, indent=2))
print("\n=== KEYS ===")
print(metrics.keys())
