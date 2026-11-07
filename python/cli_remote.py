#!/usr/bin/env python3
"""
SysDash Remote CLI - Monitor remote hosts via Go backend
Connects to backend API/WebSocket to view metrics from multiple hosts
"""

import time
import sys
import json
import requests
from typing import List, Dict, Optional
from datetime import datetime

from rich.console import Console
from rich.live import Live
from rich.layout import Layout
from rich.panel import Panel
from rich.table import Table
from rich import box
from rich.text import Text


class RemoteDashboard:
    """Remote monitoring dashboard via backend API"""
    
    def __init__(self, backend_url: str = "http://localhost:8080", update_interval: float = 2.0):
        """
        Initialize remote dashboard
        
        Args:
            backend_url: Backend server URL
            update_interval: Update interval in seconds
        """
        self.console = Console()
        self.backend_url = backend_url.rstrip('/')
        self.update_interval = update_interval
        self.selected_host = None
        self.hosts_cache = []
        
    def fetch_hosts(self) -> List[str]:
        """Fetch list of available hosts"""
        try:
            response = requests.get(f"{self.backend_url}/api/hosts", timeout=5)
            if response.ok:
                data = response.json()
                return data.get('hosts', [])
        except Exception as e:
            self.console.print(f"[red]Error fetching hosts: {e}[/]")
        return []
    
    def fetch_metrics(self, hostname: Optional[str] = None) -> Optional[Dict]:
        """Fetch metrics for a specific host or all hosts"""
        try:
            if hostname:
                url = f"{self.backend_url}/api/metrics?host={hostname}"
            else:
                url = f"{self.backend_url}/api/metrics"
            
            response = requests.get(url, timeout=5)
            if response.ok:
                return response.json()
        except Exception as e:
            self.console.print(f"[red]Error fetching metrics: {e}[/]")
        return None
    
    def check_backend_health(self) -> bool:
        """Check if backend is reachable"""
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=3)
            return response.ok
        except:
            return False
    
    def create_header(self) -> Panel:
        """Create header panel"""
        header_text = Text()
        header_text.append("SysDash Remote Monitor", style="bold cyan")
        header_text.append(" | ", style="dim")
        header_text.append(f"Backend: {self.backend_url}", style="green")
        header_text.append(" | ", style="dim")
        header_text.append(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), style="blue")
        
        return Panel(header_text, style="bold white on blue", box=box.DOUBLE)
    
    def create_hosts_panel(self, hosts: List[str]) -> Panel:
        """Create hosts list panel"""
        table = Table(show_header=True, box=box.SIMPLE_HEAD, padding=(0, 2))
        table.add_column("#", style="dim", width=4)
        table.add_column("Hostname", style="cyan")
        table.add_column("Status", justify="center", width=10)
        
        for i, host in enumerate(hosts, 1):
            status = "[green]●[/] Online" if host else "[red]●[/] Offline"
            table.add_row(str(i), host, status)
        
        if not hosts:
            table.add_row("", "[dim]No hosts found[/]", "")
        
        return Panel(table, title="[bold]Monitored Hosts", border_style="green", box=box.ROUNDED)
    
    def create_metrics_panel(self, metrics: Dict) -> Panel:
        """Create metrics panel for selected host"""
        if not metrics:
            return Panel("[dim]No data available[/]", title="Metrics")
        
        # Handle both single host and multi-host responses
        if 'data' in metrics and isinstance(metrics['data'], list):
            if not metrics['data']:
                return Panel("[dim]No hosts reporting[/]", title="Metrics")
            metrics = metrics['data'][0]  # Use first host
        
        table = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
        table.add_column("Metric", style="cyan", width=20)
        table.add_column("Value", justify="right", width=40)
        
        # System Info
        table.add_row("[bold]System", "")
        table.add_row("  Hostname", metrics.get('hostname', 'N/A'))
        table.add_row("  Timestamp", metrics.get('timestamp', 'N/A'))
        table.add_row("", "")
        
        # CPU
        cpu = metrics.get('cpu', {})
        cpu_total = cpu.get('total', 0)
        cpu_color = self._get_color(cpu_total)
        table.add_row("[bold]CPU", "")
        table.add_row("  Usage", f"[{cpu_color}]{cpu_total:.1f}%[/] {self._create_bar(cpu_total)}")
        table.add_row("  Cores", str(cpu.get('cores', 0)))
        table.add_row("", "")
        
        # Memory
        memory = metrics.get('memory', {})
        mem_percent = memory.get('percent', 0)
        mem_color = self._get_color(mem_percent)
        mem_used = memory.get('used', 0) / (1024**3)
        mem_total = memory.get('total', 0) / (1024**3)
        table.add_row("[bold]Memory", "")
        table.add_row("  Usage", f"[{mem_color}]{mem_percent:.1f}%[/] {self._create_bar(mem_percent)}")
        table.add_row("  Used/Total", f"{mem_used:.1f} GB / {mem_total:.1f} GB")
        table.add_row("", "")
        
        # Disk
        disk = metrics.get('disk', {})
        partitions = disk.get('partitions', [])
        if partitions:
            partition = partitions[0]
            disk_percent = partition.get('percent', 0)
            disk_color = self._get_color(disk_percent)
            disk_used = partition.get('used', 0) / (1024**3)
            disk_total = partition.get('total', 0) / (1024**3)
            table.add_row("[bold]Disk", "")
            table.add_row("  Usage", f"[{disk_color}]{disk_percent:.1f}%[/] {self._create_bar(disk_percent)}")
            table.add_row("  Used/Total", f"{disk_used:.0f} GB / {disk_total:.0f} GB")
        
        disk_io = disk.get('io', {})
        read_mb = disk_io.get('read_rate', 0) / (1024**2)
        write_mb = disk_io.get('write_rate', 0) / (1024**2)
        table.add_row("  I/O Read", f"{read_mb:.2f} MB/s")
        table.add_row("  I/O Write", f"{write_mb:.2f} MB/s")
        table.add_row("", "")
        
        # Network
        network = metrics.get('network', {})
        sent_kb = network.get('bytes_sent_rate', 0) / 1024
        recv_kb = network.get('bytes_recv_rate', 0) / 1024
        table.add_row("[bold]Network", "")
        table.add_row("  Upload", f"{sent_kb:.1f} KB/s")
        table.add_row("  Download", f"{recv_kb:.1f} KB/s")
        
        return Panel(table, title=f"[bold]Metrics: {metrics.get('hostname', 'Unknown')}", 
                    border_style="yellow", box=box.ROUNDED)
    
    def create_processes_panel(self, metrics: Dict) -> Panel:
        """Create processes panel"""
        if not metrics:
            return Panel("[dim]No data[/]", title="Processes")
        
        if 'data' in metrics and isinstance(metrics['data'], list):
            if not metrics['data']:
                return Panel("[dim]No data[/]", title="Processes")
            metrics = metrics['data'][0]
        
        processes = metrics.get('processes', [])
        
        table = Table(show_header=True, box=box.SIMPLE_HEAD, padding=(0, 1))
        table.add_column("PID", style="dim", width=8)
        table.add_column("Name", style="cyan", width=20)
        table.add_column("CPU%", justify="right", width=8)
        table.add_column("Mem%", justify="right", width=8)
        
        for proc in processes[:10]:
            cpu_color = self._get_color(proc.get('cpu', 0))
            mem_color = self._get_color(proc.get('memory', 0))
            table.add_row(
                str(proc.get('pid', 0)),
                proc.get('name', '')[:20],
                f"[{cpu_color}]{proc.get('cpu', 0):.1f}[/]",
                f"[{mem_color}]{proc.get('memory', 0):.1f}[/]"
            )
        
        if not processes:
            table.add_row("", "[dim]No processes[/]", "", "")
        
        return Panel(table, title="[bold]Top Processes", border_style="magenta", box=box.ROUNDED)
    
    def _get_color(self, value: float) -> str:
        """Get color based on threshold"""
        if value < 50:
            return "green"
        elif value < 75:
            return "yellow"
        elif value < 90:
            return "orange3"
        else:
            return "red"
    
    def _create_bar(self, value: float, width: int = 20) -> str:
        """Create progress bar"""
        filled = int((value / 100) * width)
        bar = "█" * filled + "░" * (width - filled)
        color = self._get_color(value)
        return f"[{color}]{bar}[/]"
    
    def make_layout(self) -> Layout:
        """Create dashboard layout"""
        layout = Layout(name="root")
        
        layout.split(
            Layout(name="header", size=3),
            Layout(name="main", ratio=1),
            Layout(name="footer", size=1),
        )
        
        layout["main"].split_row(
            Layout(name="hosts", ratio=1),
            Layout(name="content", ratio=2),
        )
        
        layout["content"].split(
            Layout(name="metrics", ratio=2),
            Layout(name="processes", ratio=1),
        )
        
        return layout
    
    def update_dashboard(self, layout: Layout):
        """Update dashboard with fresh data"""
        # Fetch hosts
        hosts = self.fetch_hosts()
        self.hosts_cache = hosts
        
        # Fetch metrics
        metrics = self.fetch_metrics(self.selected_host if self.selected_host else None)
        
        # Update panels
        layout["header"].update(self.create_header())
        layout["hosts"].update(self.create_hosts_panel(hosts))
        layout["metrics"].update(self.create_metrics_panel(metrics))
        layout["processes"].update(self.create_processes_panel(metrics))
        
        # Footer
        footer_text = Text()
        footer_text.append("Press ", style="dim")
        footer_text.append("Ctrl+C", style="bold red")
        footer_text.append(" to exit | Update: ", style="dim")
        footer_text.append(f"{self.update_interval}s", style="cyan")
        layout["footer"].update(Panel(footer_text, style="dim"))
    
    def run(self):
        """Run the remote dashboard"""
        # Check backend connectivity
        if not self.check_backend_health():
            self.console.print(f"[red]Error: Cannot connect to backend at {self.backend_url}[/]")
            self.console.print("[yellow]Please ensure the Go backend is running:[/]")
            self.console.print("  cd backend && go run .")
            sys.exit(1)
        
        self.console.print(f"[green]✓ Connected to backend at {self.backend_url}[/]")
        time.sleep(1)
        
        layout = self.make_layout()
        
        try:
            with Live(layout, console=self.console, screen=True, refresh_per_second=2) as live:
                while True:
                    self.update_dashboard(layout)
                    time.sleep(self.update_interval)
        except KeyboardInterrupt:
            self.console.print("\n[yellow]Remote dashboard stopped[/]")
        except Exception as e:
            self.console.print(f"\n[red]Error: {e}[/]")
            raise


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="SysDash Remote CLI - Monitor hosts via backend API"
    )
    
    parser.add_argument(
        "--backend",
        type=str,
        default="http://localhost:8080",
        help="Backend server URL (default: http://localhost:8080)"
    )
    
    parser.add_argument(
        "--interval",
        type=float,
        default=2.0,
        help="Update interval in seconds (default: 2.0)"
    )
    
    parser.add_argument(
        "--host",
        type=str,
        default=None,
        help="Monitor specific host (default: all hosts)"
    )
    
    args = parser.parse_args()
    
    dashboard = RemoteDashboard(
        backend_url=args.backend,
        update_interval=args.interval
    )
    
    if args.host:
        dashboard.selected_host = args.host
    
    dashboard.run()


if __name__ == "__main__":
    main()
