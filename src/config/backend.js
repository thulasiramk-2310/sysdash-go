// Backend Configuration
export const config = {
  // Set to true to connect to real Go backend
  // Set to false to use mock data
  USE_REAL_BACKEND: true,
  
  // Backend URLs
  WS_URL: 'ws://localhost:8080/ws',
  HTTP_URL: 'http://localhost:8080/api/metrics',
  HEALTH_URL: 'http://localhost:8080/health',
  
  // Connection settings
  RECONNECT_DELAY: 3000,
  HTTP_POLL_INTERVAL: 2000,
  WS_PING_INTERVAL: 30000,
  
  // Development mode
  DEBUG: import.meta.env.DEV,
};

// Helper to check if backend is available
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(config.HEALTH_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✓ Backend health check passed:', data);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('✗ Backend health check failed:', error.message);
    return false;
  }
};

export default config;
