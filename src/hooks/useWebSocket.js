import { useEffect, useRef, useCallback } from 'react';
import useMetricsStore from './useMetricsStore';
import useSettingsStore from './useSettingsStore';
import config from '../config/backend';

const { WS_URL, HTTP_URL, RECONNECT_DELAY, USE_REAL_BACKEND } = config;
const HTTP_FALLBACK_URL = HTTP_URL;

const useWebSocket = () => {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const httpIntervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const useFallbackRef = useRef(false);
  
  const { setConnectionStatus, addMetrics, selectedHost } = useMetricsStore();
  const { refreshRate } = useSettingsStore();
  
  // Transform backend data format to frontend format
  const transformBackendData = useCallback((backendData) => {
    return {
      host: backendData.hostname || 'unknown',
      timestamp: new Date(backendData.timestamp).getTime() / 1000 || Date.now() / 1000,
      cpu: {
        total: backendData.cpu?.total || 0,
        per_core: backendData.cpu?.per_core || []
      },
      memory: {
        percent: backendData.memory?.percent || 0,
        used: backendData.memory?.used || 0,
        total: backendData.memory?.total || 0
      },
      disk: {
        percent: backendData.disk?.partitions?.[0]?.percent || 0,
        read_bps: backendData.disk?.io?.read_rate || 0,
        write_bps: backendData.disk?.io?.write_rate || 0
      },
      network: {
        up_bps: backendData.network?.bytes_sent_rate || 0,
        down_bps: backendData.network?.bytes_recv_rate || 0
      },
      gpu: {
        usage: backendData.gpu?.usage || 0,
        temperature: backendData.gpu?.temperature || 0,
        memory: {
          used: backendData.gpu?.memory?.used || 0,
          total: backendData.gpu?.memory?.total || 0,
          percent: backendData.gpu?.memory?.percent || 0
        }
      },
      processes: (backendData.processes || []).map(p => ({
        pid: p.pid,
        name: p.name,
        cpu: p.cpu,
        memory: p.memory // Already in bytes from backend
      }))
    };
  }, []);
  
  // Mock data generator for demo
  const generateMockData = useCallback(() => {
    const timestamp = Math.floor(Date.now() / 1000);
    const baseValue = Math.sin(timestamp / 10) * 20 + 50;
    
    return {
      host: selectedHost,
      timestamp: timestamp,
      cpu: {
        total: Math.max(0, Math.min(100, baseValue + Math.random() * 20 - 10)),
        per_core: Array.from({ length: 4 }, () => 
          Math.max(0, Math.min(100, baseValue + Math.random() * 30 - 15))
        )
      },
      memory: {
        percent: Math.max(0, Math.min(100, 65 + Math.sin(timestamp / 15) * 15)),
        used: 5324567890,
        total: 8589934592
      },
      disk: {
        percent: 32 + Math.sin(timestamp / 20) * 5,
        read_bps: Math.floor(Math.random() * 500000 + 100000),
        write_bps: Math.floor(Math.random() * 300000 + 50000)
      },
      network: {
        up_bps: Math.floor(Math.random() * 1000000 + 100000),
        down_bps: Math.floor(Math.random() * 5000000 + 500000)
      },
      gpu: {
        usage: Math.max(0, Math.min(100, 45 + Math.sin(timestamp / 12) * 25)),
        temperature: Math.max(30, Math.min(85, 55 + Math.sin(timestamp / 8) * 15)),
        memory: {
          used: 3221225472,
          total: 8589934592,
          percent: Math.max(0, Math.min(100, 37.5 + Math.sin(timestamp / 14) * 20))
        }
      },
      processes: [
        { pid: 1234, name: 'chrome', cpu: Math.random() * 30, memory: 512345678 },
        { pid: 2345, name: 'vscode', cpu: Math.random() * 20, memory: 412345678 },
        { pid: 3456, name: 'node', cpu: Math.random() * 15, memory: 256789012 },
        { pid: 4567, name: 'docker', cpu: Math.random() * 10, memory: 812345678 },
        { pid: 5678, name: 'postgres', cpu: Math.random() * 8, memory: 345678901 },
        { pid: 6789, name: 'firefox', cpu: Math.random() * 25, memory: 678901234 },
        { pid: 7890, name: 'slack', cpu: Math.random() * 12, memory: 234567890 },
        { pid: 8901, name: 'spotify', cpu: Math.random() * 5, memory: 123456789 },
      ].sort((a, b) => b.cpu - a.cpu)
    };
  }, [selectedHost]);
  
  // HTTP Fallback polling
  const startHttpPolling = useCallback(() => {
    useFallbackRef.current = true;
    setConnectionStatus('connected');
    
    const poll = async () => {
      if (!isMountedRef.current) return;
      
      if (USE_REAL_BACKEND) {
        // Fetch real metrics from Go backend
        try {
          const response = await fetch(HTTP_FALLBACK_URL);
          if (response.ok) {
            const data = await response.json();
            // Backend returns { hosts: N, data: [...] } for all metrics
            // or single metrics object for specific host
            if (data.data && Array.isArray(data.data) && data.data.length > 0) {
              // Get first host's metrics (or specific host if selectedHost is set)
              const metrics = selectedHost 
                ? data.data.find(m => m.hostname === selectedHost) || data.data[0]
                : data.data[0];
              
              // Transform backend format to frontend format
              const transformed = transformBackendData(metrics);
              addMetrics(transformed);
            } else if (data.hostname) {
              // Single host response
              const transformed = transformBackendData(data);
              addMetrics(transformed);
            }
          } else {
            console.warn('HTTP fallback failed, using mock data');
            const mockData = generateMockData();
            addMetrics(mockData);
          }
        } catch (error) {
          console.error('HTTP polling error:', error);
          // Fallback to mock data on error
          const mockData = generateMockData();
          addMetrics(mockData);
        }
      } else {
        // Use mock data
        const mockData = generateMockData();
        addMetrics(mockData);
      }
    };
    
    poll(); // Initial poll
    httpIntervalRef.current = setInterval(poll, refreshRate);
  }, [generateMockData, addMetrics, setConnectionStatus, refreshRate, selectedHost]);
  
  const stopHttpPolling = useCallback(() => {
    if (httpIntervalRef.current) {
      clearInterval(httpIntervalRef.current);
      httpIntervalRef.current = null;
    }
  }, []);
  
  // WebSocket connection
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    if (!USE_REAL_BACKEND) {
      // Use mock data immediately if backend is disabled
      console.log('Using mock data (backend disabled)');
      startHttpPolling();
      return;
    }
    
    try {
      console.log('Attempting WebSocket connection to:', WS_URL);
      
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('✓ WebSocket connected to Go backend');
        setConnectionStatus('connected');
        useFallbackRef.current = false;
        stopHttpPolling();
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const backendData = JSON.parse(event.data);
          console.log('Received metrics from backend:', backendData.hostname);
          
          // Transform and add metrics
          const transformed = transformBackendData(backendData);
          addMetrics(transformed);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
        wsRef.current = null;
        
        if (isMountedRef.current && !useFallbackRef.current) {
          console.log('Switching to HTTP fallback...');
          setConnectionStatus('reconnecting');
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              startHttpPolling(); // Fallback to HTTP
            }
          }, RECONNECT_DELAY);
        }
      };
      
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      console.log('Falling back to HTTP polling');
      startHttpPolling();
    }
  }, [setConnectionStatus, addMetrics, startHttpPolling, stopHttpPolling, transformBackendData]);
  
  const disconnect = useCallback(() => {
    isMountedRef.current = false;
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    stopHttpPolling();
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setConnectionStatus('disconnected');
  }, [setConnectionStatus, stopHttpPolling]);
  
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  
  return {
    connect,
    disconnect,
    isConnected: useMetricsStore(state => state.isConnected),
    connectionStatus: useMetricsStore(state => state.connectionStatus),
  };
};

export default useWebSocket;
  