package main

import (
	"sync"
	"time"
)

// Metrics represents the system metrics data structure
type Metrics struct {
	Timestamp string      `json:"timestamp"`
	Hostname  string      `json:"hostname"`
	CPU       CPUMetrics  `json:"cpu"`
	Memory    MemMetrics  `json:"memory"`
	Disk      DiskMetrics `json:"disk"`
	Network   NetMetrics  `json:"network"`
	GPU       GPUMetrics  `json:"gpu,omitempty"`
	Processes []Process   `json:"processes"`
	System    SysInfo     `json:"system"`
}

// CPUMetrics contains CPU usage information
type CPUMetrics struct {
	Total   float64      `json:"total"`
	PerCore []float64    `json:"per_core"`
	Cores   int          `json:"cores"`
	Freq    CPUFrequency `json:"frequency"`
	LoadAvg []float64    `json:"load_avg"`
}

// CPUFrequency contains CPU frequency info
type CPUFrequency struct {
	Current float64 `json:"current"`
	Min     float64 `json:"min"`
	Max     float64 `json:"max"`
}

// MemMetrics contains memory usage information
type MemMetrics struct {
	Total     int64    `json:"total"`
	Available int64    `json:"available"`
	Used      int64    `json:"used"`
	Free      int64    `json:"free"`
	Percent   float64  `json:"percent"`
	Swap      SwapInfo `json:"swap"`
}

// SwapInfo contains swap memory information
type SwapInfo struct {
	Total   int64   `json:"total"`
	Used    int64   `json:"used"`
	Free    int64   `json:"free"`
	Percent float64 `json:"percent"`
}

// DiskMetrics contains disk usage and I/O information
type DiskMetrics struct {
	Partitions []Partition `json:"partitions"`
	IO         DiskIO      `json:"io"`
}

// Partition represents a disk partition
type Partition struct {
	Device     string  `json:"device"`
	Mountpoint string  `json:"mountpoint"`
	FSType     string  `json:"fstype"`
	Total      int64   `json:"total"`
	Used       int64   `json:"used"`
	Free       int64   `json:"free"`
	Percent    float64 `json:"percent"`
}

// DiskIO contains disk I/O statistics
type DiskIO struct {
	ReadBytes  int64   `json:"read_bytes"`
	WriteBytes int64   `json:"write_bytes"`
	ReadRate   float64 `json:"read_rate"`
	WriteRate  float64 `json:"write_rate"`
	ReadCount  int64   `json:"read_count"`
	WriteCount int64   `json:"write_count"`
}

// NetMetrics contains network statistics
type NetMetrics struct {
	BytesSent     int64                `json:"bytes_sent"`
	BytesRecv     int64                `json:"bytes_recv"`
	BytesSentRate float64              `json:"bytes_sent_rate"`
	BytesRecvRate float64              `json:"bytes_recv_rate"`
	PacketsSent   int64                `json:"packets_sent"`
	PacketsRecv   int64                `json:"packets_recv"`
	Interfaces    map[string]Interface `json:"interfaces"`
}

// Interface represents network interface statistics
type Interface struct {
	BytesSent   int64 `json:"bytes_sent"`
	BytesRecv   int64 `json:"bytes_recv"`
	PacketsSent int64 `json:"packets_sent"`
	PacketsRecv int64 `json:"packets_recv"`
	ErrIn       int64 `json:"errin"`
	ErrOut      int64 `json:"errout"`
	DropIn      int64 `json:"dropin"`
	DropOut     int64 `json:"dropout"`
}

// GPUMetrics contains GPU statistics (optional)
type GPUMetrics struct {
	Usage       float64   `json:"usage"`
	Temperature float64   `json:"temperature"`
	Memory      GPUMemory `json:"memory"`
}

// GPUMemory contains GPU memory information
type GPUMemory struct {
	Total   int64   `json:"total"`
	Used    int64   `json:"used"`
	Percent float64 `json:"percent"`
}

// Process represents a running process
type Process struct {
	PID    int     `json:"pid"`
	Name   string  `json:"name"`
	CPU    float64 `json:"cpu"`
	Memory float64 `json:"memory"`
	User   string  `json:"user"`
}

// SysInfo contains general system information
type SysInfo struct {
	Hostname      string  `json:"hostname"`
	Platform      string  `json:"platform"`
	BootTime      string  `json:"boot_time"`
	UptimeSeconds float64 `json:"uptime_seconds"`
	Timestamp     string  `json:"timestamp"`
}

// MetricsStore stores metrics for multiple hosts in memory
type MetricsStore struct {
	mu      sync.RWMutex
	metrics map[string]Metrics
}

// NewMetricsStore creates a new metrics store
func NewMetricsStore() *MetricsStore {
	return &MetricsStore{
		metrics: make(map[string]Metrics),
	}
}

// Set stores metrics for a host
func (s *MetricsStore) Set(hostname string, metrics Metrics) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.metrics[hostname] = metrics
}

// Get retrieves metrics for a host
func (s *MetricsStore) Get(hostname string) (Metrics, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	metrics, exists := s.metrics[hostname]
	return metrics, exists
}

// GetAll retrieves all metrics
func (s *MetricsStore) GetAll() []Metrics {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]Metrics, 0, len(s.metrics))
	for _, m := range s.metrics {
		result = append(result, m)
	}
	return result
}

// GetHosts retrieves list of all hostnames
func (s *MetricsStore) GetHosts() []string {
	s.mu.RLock()
	defer s.mu.RUnlock()

	hosts := make([]string, 0, len(s.metrics))
	for hostname := range s.metrics {
		hosts = append(hosts, hostname)
	}
	return hosts
}

// CleanStale removes metrics older than specified duration
func (s *MetricsStore) CleanStale(maxAge time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	for hostname, metrics := range s.metrics {
		timestamp, err := time.Parse(time.RFC3339, metrics.Timestamp)
		if err == nil && now.Sub(timestamp) > maxAge {
			delete(s.metrics, hostname)
		}
	}
}
