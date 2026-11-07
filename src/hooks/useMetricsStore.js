import { create } from 'zustand';

const useMetricsStore = create((set, get) => ({
  // Connection state
  isConnected: false,
  isPaused: false,
  connectionStatus: 'disconnected', // 'connected', 'disconnected', 'reconnecting'
  
  // Selected host and timeframe
  selectedHost: 'host-1',
  timeframe: 60, // seconds
  
  // Metrics data
  currentMetrics: null,
  metricsHistory: [],
  maxHistoryLength: 120,
  
  // Hosts list
  availableHosts: [],
  
  // Alerts
  alerts: [],
  
  // Actions
  setConnectionStatus: (status) => set({ 
    connectionStatus: status,
    isConnected: status === 'connected'
  }),
  
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  
  setSelectedHost: (host) => set({ selectedHost: host }),

  // Fetch hosts from backend API and set selected host to the first one
  fetchHosts: async (baseUrl = 'http://localhost:8080') => {
    try {
      const url = baseUrl ? `${baseUrl.replace(/\/$/, '')}/api/hosts` : 'http://localhost:8080/api/hosts';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Expecting an array of host names or objects with `name` field
      let hosts = [];
      if (Array.isArray(data)) {
        hosts = data.map(h => (typeof h === 'string' ? h : h.name || h.id)).filter(Boolean);
      }
      if (hosts.length > 0) {
        set({ availableHosts: hosts, selectedHost: hosts[0] });
      }
    } catch (err) {
      console.warn('Failed to fetch hosts:', err);
    }
  },
  
  setTimeframe: (timeframe) => set({ 
    timeframe,
    metricsHistory: get().metricsHistory.slice(-timeframe)
  }),
  
  addMetrics: (metrics) => {
    const state = get();
    if (state.isPaused) return;
    
    const newHistory = [...state.metricsHistory, metrics];
    if (newHistory.length > state.maxHistoryLength) {
      newHistory.shift();
    }
    
    set({
      currentMetrics: metrics,
      metricsHistory: newHistory
    });
    
    // Check for alerts
    if (metrics.cpu?.total > 80) {
      get().addAlert({
        id: Date.now(),
        type: 'danger',
        message: `High CPU usage: ${metrics.cpu.total.toFixed(1)}%`,
        timestamp: metrics.timestamp
      });
    }
    
    if (metrics.memory?.percent > 85) {
      get().addAlert({
        id: Date.now() + 1,
        type: 'danger',
        message: `High memory usage: ${metrics.memory.percent.toFixed(1)}%`,
        timestamp: metrics.timestamp
      });
    }
  },
  
  addAlert: (alert) => {
    const state = get();
    const newAlerts = [alert, ...state.alerts].slice(0, 50);
    set({ alerts: newAlerts });
  },
  
  acknowledgeAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.filter(alert => alert.id !== id)
    }));
  },

  // Clear all alerts
  clearAlerts: () => set({ alerts: [] }),
  
  clearHistory: () => set({ metricsHistory: [], currentMetrics: null }),
}));

export default useMetricsStore;
