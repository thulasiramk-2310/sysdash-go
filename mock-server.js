// Simple mock WebSocket server for testing
// Run with: node mock-server.js

const http = require('http');
const WebSocket = require('ws');

// Create HTTP server
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === '/metrics') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(generateMockData()));
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server, path: '/live' });

// Mock data generator
function generateMockData() {
  const timestamp = Math.floor(Date.now() / 1000);
  const baseValue = Math.sin(timestamp / 10) * 20 + 50;
  
  return {
    host: 'localhost',
    timestamp: timestamp,
    cpu: {
      total: Math.max(0, Math.min(100, baseValue + Math.random() * 20 - 10)),
      per_core: Array.from({ length: 8 }, () => 
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
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send initial data
  ws.send(JSON.stringify(generateMockData()));
  
  // Send data every 2 seconds
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(generateMockData()));
    }
  }, 2000);
  
  // Cleanup on disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clearInterval(interval);
  });
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/live`);
  console.log(`HTTP endpoint: http://localhost:${PORT}/metrics`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  wss.close(() => {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});
