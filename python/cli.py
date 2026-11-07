#!/usr/bin/env python3
"""
SysDash CLI Dashboard
Real-time terminal-based system monitoring using rich library
"""

import time
import sys
from datetime import datetime
from typing import Optional

from rich.console import Console
from rich.live import Live
from rich.layout import Layout
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, BarColumn, TextColumn, SpinnerColumn
from rich.text import Text
from rich import box

from collector import MetricsCollector


class CLIDashboard:
    """Terminal-based dashboard using rich"""
    
    def __init__(self, hostname: Optional[str] = None, update_interval: float = 1.0):
        """
        Initialize the CLI dashboard
        
        Args:
            hostname: Custom hostname
            update_interval: Update interval in seconds
        """
        self.console = Console()
        self.collector = MetricsCollector(hostname=hostname)
        self.update_interval = update_interval
        self.start_time = time.time()
        
    def make_layout(self) -> Layout:
        """Create the dashboard layout"""
        layout = Layout(name="root")
        
        layout.split(
            Layout(name="header", size=3),
            Layout(name="main", ratio=1),
            Layout(name="footer", size=3),
        )
        
        layout["main"].split_row(
            Layout(name="left", ratio=2),
            Layout(name="right", ratio=1),
        )
        
        layout["left"].split(
            Layout(name="metrics", ratio=2),
            Layout(name="processes", ratio=1),
        )
        
        layout["right"].split(
            Layout(name="disk"),
            Layout(name="network"),
        )
        
        return layout
    
    def create_header(self) -> Panel:
        """Create header panel"""
        uptime = int(time.time() - self.start_time)
        hours = uptime // 3600
        minutes = (uptime % 3600) // 60
        seconds = uptime % 60
        
        header_text = Text()
        header_text.append("SysDash CLI", style="bold cyan")
        header_text.append(" | ", style="dim")
        header_text.append(f"Host: {self.collector.hostname}", style="bold green")
        header_text.append(" | ", style="dim")
        header_text.append(f"Uptime: {hours:02d}:{minutes:02d}:{seconds:02d}", style="yellow")
        header_text.append(" | ", style="dim")
        header_text.append(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), style="blue")
        
        return Panel(header_text, style="bold white on blue", box=box.DOUBLE)
    
    def create_footer(self) -> Panel:
        """Create footer panel"""
        footer_text = Text()
        footer_text.append("Press ", style="dim")
        footer_text.append("Ctrl+C", style="bold red")
        footer_text.append(" to exit", style="dim")
        footer_text.append(" | ", style="dim")
        footer_text.append(f"Update: {self.update_interval}s", style="dim")
        
        return Panel(footer_text, style="dim white on black")
    
    def create_cpu_memory_panel(self, metrics: dict) -> Panel:
        """Create CPU and Memory metrics panel"""
        table = Table(show_header=False, box=box.SIMPLE, padding=(0, 1))
        table.add_column("Metric", style="cyan", width=15)
        table.add_column("Value", justify="right")
        table.add_column("Bar", width=30)
        
        # CPU
        cpu_total = metrics['cpu']['total']
        cpu_color = self._get_color_for_value(cpu_total)
        cpu_bar = self._create_bar(cpu_total, 100, cpu_color)
        table.add_row(
            "CPU",
            f"{cpu_total:.1f}%",
            cpu_bar
        )
        
        # Memory
        mem_percent = metrics['memory']['percent']
        mem_color = self._get_color_for_value(mem_percent)
        mem_bar = self._create_bar(mem_percent, 100, mem_color)
        mem_used_gb = metrics['memory']['used'] / (1024**3)
        mem_total_gb = metrics['memory']['total'] / (1024**3)
        table.add_row(
            "Memory",
            f"{mem_percent:.1f}% ({mem_used_gb:.1f}/{mem_total_gb:.1f} GB)",
            mem_bar
        )
        
        # Swap
        swap_percent = metrics['memory']['swap']['percent']
        swap_color = self._get_color_for_value(swap_percent)
        swap_bar = self._create_bar(swap_percent, 100, swap_color)
        swap_used_gb = metrics['memory']['swap']['used'] / (1024**3)
        swap_total_gb = metrics['memory']['swap']['total'] / (1024**3)
        table.add_row(
            "Swap",
            f"{swap_percent:.1f}% ({swap_used_gb:.1f}/{swap_total_gb:.1f} GB)",
            swap_bar
        )
        
        # CPU Cores
        table.add_row("", "", "")  # Spacer
        table.add_row("[bold]CPU Cores", "", "")
        for i, core_usage in enumerate(metrics['cpu']['per_core'][:8]):  # Show first 8 cores
            core_color = self._get_color_for_value(core_usage)
            core_bar = self._create_bar(core_usage, 100, core_color)
            table.add_row(
                f"  Core {i}",
                f"{core_usage:.1f}%",
                core_bar
            )
        
        return Panel(table, title="[bold]CPU & Memory", border_style="green", box=box.ROUNDED)
    
    def create_disk_panel(self, metrics: dict) -> Panel:
        """Create disk usage panel"""
        table = Table(show_header=True, box=box.SIMPLE_HEAD, padding=(0, 1))
        table.add_column("Device", style="cyan", width=12)
        table.add_column("Used", justify="right", width=12)
        table.add_column("Usage", width=20)
        
        for partition in metrics['disk']['partitions'][:5]:  # Show first 5 partitions
            usage = partition['percent']
            color = self._get_color_for_value(usage)
            bar = self._create_bar(usage, 100, color)
            
            used_gb = partition['used'] / (1024**3)
            total_gb = partition['total'] / (1024**3)
            
            table.add_row(
                partition['mountpoint'][:12],
                f"{used_gb:.0f}/{total_gb:.0f}GB",
                bar
            )
        
        # Disk I/O
        disk_io = metrics['disk']['io']
        read_mb = disk_io['read_rate'] / (1024**2)
        write_mb = disk_io['write_rate'] / (1024**2)
        
        table.add_row("", "", "")
        table.add_row("[bold]I/O Rates", "", "")
        table.add_row("  Read", f"{read_mb:.2f} MB/s", "")
        table.add_row("  Write", f"{write_mb:.2f} MB/s", "")
        
        return Panel(table, title="[bold]Disk Usage", border_style="yellow", box=box.ROUNDED)
    
    def create_network_panel(self, metrics: dict) -> Panel:
        """Create network statistics panel"""
        table = Table(show_header=False, box=box.SIMPLE, padding=(0, 1))
        table.add_column("Metric", style="cyan", width=15)
        table.add_column("Value", justify="right")
        
        net = metrics['network']
        
        # Rates
        sent_kb = net['bytes_sent_rate'] / 1024
        recv_kb = net['bytes_recv_rate'] / 1024
        
        table.add_row("[bold]Current Rates", "")
        table.add_row("  Upload", f"{sent_kb:.1f} KB/s")
        table.add_row("  Download", f"{recv_kb:.1f} KB/s")
        
        # Totals
        sent_gb = net['bytes_sent'] / (1024**3)
        recv_gb = net['bytes_recv'] / (1024**3)
        
        table.add_row("", "")
        table.add_row("[bold]Total Transfer", "")
        table.add_row("  Sent", f"{sent_gb:.2f} GB")
        table.add_row("  Received", f"{recv_gb:.2f} GB")
        
        # Packets
        table.add_row("", "")
        table.add_row("[bold]Packets", "")
        table.add_row("  Sent", f"{net['packets_sent']:,}")
        table.add_row("  Received", f"{net['packets_recv']:,}")
        
        return Panel(table, title="[bold]Network", border_style="blue", box=box.ROUNDED)
    
    def create_processes_panel(self, metrics: dict) -> Panel:
        """Create top processes panel"""
        table = Table(show_header=True, box=box.SIMPLE_HEAD, padding=(0, 1))
        table.add_column("PID", style="dim", width=8)
        table.add_column("Name", style="cyan", width=20)
        table.add_column("CPU", justify="right", width=8)
        table.add_column("Mem", justify="right", width=8)
        
        for proc in metrics['processes'][:10]:
            cpu_color = self._get_color_for_value(proc['cpu'])
            mem_color = self._get_color_for_value(proc['memory'])
            
            table.add_row(
                str(proc['pid']),
                proc['name'][:20],
                f"[{cpu_color}]{proc['cpu']:.1f}%[/]",
                f"[{mem_color}]{proc['memory']:.1f}%[/]"
            )
        
        return Panel(table, title="[bold]Top Processes", border_style="magenta", box=box.ROUNDED)
    
    def _get_color_for_value(self, value: float) -> str:
        """Get color based on value threshold"""
        if value < 50:
            return "green"
        elif value < 75:
            return "yellow"
        elif value < 90:
            return "orange3"
        else:
            return "red"
    
    def _create_bar(self, value: float, max_value: float, color: str, width: int = 20) -> str:
        """Create a text-based progress bar"""
        filled = int((value / max_value) * width)
        bar = "█" * filled + "░" * (width - filled)
        return f"[{color}]{bar}[/] {value:.0f}%"
    
    def update_dashboard(self, layout: Layout):
        """Update all dashboard panels"""
        try:
            metrics = self.collector.collect_all()
            
            if not metrics:
                layout["header"].update(Panel("[red]Error collecting metrics[/]"))
                return
            
            layout["header"].update(self.create_header())
            layout["footer"].update(self.create_footer())
            layout["metrics"].update(self.create_cpu_memory_panel(metrics))
            layout["disk"].update(self.create_disk_panel(metrics))
            layout["network"].update(self.create_network_panel(metrics))
            layout["processes"].update(self.create_processes_panel(metrics))
            
        except Exception as e:
            layout["header"].update(Panel(f"[red]Error: {e}[/]"))
    
    def run(self):
        """Run the dashboard"""
        layout = self.make_layout()
        
        try:
            with Live(layout, console=self.console, screen=True, refresh_per_second=4) as live:
                while True:
                    self.update_dashboard(layout)
                    time.sleep(self.update_interval)
                    
        except KeyboardInterrupt:
            self.console.print("\n[yellow]Dashboard stopped by user[/]")
        except Exception as e:
            self.console.print(f"\n[red]Error: {e}[/]")
            raise


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="SysDash CLI - Terminal-based system monitoring dashboard",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run with default settings
  python cli.py
  
  # Update every 0.5 seconds
  python cli.py --interval 0.5
  
  # Custom hostname
  python cli.py --hostname production-server-01
  
  # Faster updates
  python cli.py --interval 0.2
        """
    )
    
    parser.add_argument(
        "--interval",
        type=float,
        default=1.0,
        help="Update interval in seconds (default: 1.0)"
    )
    
    parser.add_argument(
        "--hostname",
        type=str,
        default=None,
        help="Custom hostname (default: system hostname)"
    )
    
    args = parser.parse_args()
    
    # Validate interval
    if args.interval < 0.1:
        print("Error: Interval must be at least 0.1 seconds")
        sys.exit(1)
    
    # Create and run dashboard
    dashboard = CLIDashboard(
        hostname=args.hostname,
        update_interval=args.interval
    )
    
    dashboard.run()


if __name__ == "__main__":
    main()
