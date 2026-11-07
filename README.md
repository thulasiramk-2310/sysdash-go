# SysDash Frontend

A colorful, modern system-monitoring dashboard UI built with React, Tailwind CSS, and Chart.js. Visualizes real-time system metrics including CPU, memory, disk, network, and processes.

![SysDash Dashboard](screenshot.png)

## 🎨 Features

- **Real-time Monitoring**: Live WebSocket connection with HTTP polling fallback
- **Beautiful UI**: Dark theme with neon accents and smooth animations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Chrome Extension**: Compact popup view for quick monitoring
- **Interactive Charts**: CPU, memory, disk I/O, and network throughput visualization
- **Process Monitoring**: Sortable, virtualized table of running processes
- **Smart Alerts**: Automatic notifications for high resource usage
- **Accessibility**: WCAG compliant with keyboard navigation

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will open at `http://localhost:3000`

## 🔌 Backend Connection

### WebSocket Endpoint

By default, the app connects to `ws://localhost:8080/live`

### HTTP Fallback

If WebSocket is unavailable, falls back to polling `http://localhost:8080/metrics`

### Data Format

The backend should send JSON data in this format:

```json
{
  "host": "host-1",
  "timestamp": 1710000000,
  "cpu": {
    "total": 12.3,
    "per_core": [10.5, 14.4, 11.2, 13.8]
  },
  "memory": {
    "percent": 62.3,
    "used": 5324567890,
    "total": 8589934592
  },
  "disk": {
    "percent": 32.7,
    "read_bps": 123456,
    "write_bps": 23456
  },
  "network": {
    "up_bps": 12345,
    "down_bps": 54321
  },
  "processes": [
    {
      "pid": 1234,
      "name": "chrome",
      "cpu": 12.1,
      "memory": 512345678
    }
  ]
}
```

### Mock Data

For demo purposes, the app includes a mock data generator that runs automatically when no backend is available.

## 🎭 Chrome Extension Setup

### Build Extension

```bash
npm run build
```

### Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `dist` folder from this project
5. The extension icon will appear in your toolbar

### Configure WebSocket URL

Edit `src/hooks/useWebSocket.js` to change the connection URL:

```javascript
const WS_URL = 'ws://your-server:8080/live';
const HTTP_FALLBACK_URL = 'http://your-server:8080/metrics';
```


## 📁 Project Structure

```
src/
├── components/
│   ├── MetricCard.jsx       # Individual metric display card
│   ├── CpuChart.jsx        # CPU utilization line chart
│   ├── MemoryChart.jsx     # Memory usage doughnut chart
│   ├── DiskChart.jsx       # Disk I/O bar chart
│   ├── NetworkChart.jsx    # Network throughput chart
│   ├── ProcessTable.jsx    # Virtualized process table
│   ├── AlertsList.jsx      # System alerts panel
│   ├── MetricsToggle.jsx   # Metric cards container
│   ├── Header.jsx          # Top navigation bar
│   ├── Sidebar.jsx         # Left sidebar navigation
│   └── PopupView.jsx       # Compact extension view
├── hooks/
│   ├── useWebSocket.js     # WebSocket connection handler
│   ├── useMetricsStore.js  # Zustand state management
│   └── useSettingsStore.js # Dashboard settings state
├── utils/
│   ├── format.js           # Data formatting utilities
│   └── downsample.js       # Chart data optimization
├── App.jsx                 # Main application component
├── main.jsx                # React entry point
└── index.css               # Global styles
```

python/
├── sys_metrics_collector.py # Main metrics collector script
├── cli.py                  # CLI dashboard (optional)
├── cli_remote.py           # Remote CLI dashboard (optional)
├── requirements.txt        # Python dependencies

backend/
├── main.go                 # Go backend entry point
├── handlers.go             # API handlers
├── models.go               # Data models
├── websocket.go            # WebSocket server
├── Dockerfile              # Container build file

Other folders and files have been cleaned up for production use.

## 🎨 Customization

### Color Theme

Edit `tailwind.config.js` to customize colors:

```javascript
colors: {
  bg: "#0f1724",        // page background
  surface: "#0b1220",   // card bg
  accent1: "#7C5CFF",   // purple
  accent2: "#00D4FF",   // cyan
  accent3: "#FFB86B",   // orange
  success: "#10B981",
  danger: "#EF4444",
}
```

### Chart Update Rate

Modify in `src/hooks/useWebSocket.js`:

```javascript
const HTTP_POLL_INTERVAL = 2000; // milliseconds
```

### History Length

Adjust in `src/hooks/useMetricsStore.js`:

```javascript
maxHistoryLength: 120, // data points to keep
```

## 🔧 Development

### Tech Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Chart.js**: Data visualization
- **Framer Motion**: Smooth animations
- **Zustand**: Lightweight state management
- **Lucide React**: Icon library
- **React Window**: Virtualized lists

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests (when configured)

### Mock Server (Optional)

Create a simple mock WebSocket server:

```javascript
// mock-server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080, path: '/live' });

wss.on('connection', (ws) => {
  const interval = setInterval(() => {
    ws.send(JSON.stringify({
      host: 'localhost',
      timestamp: Math.floor(Date.now() / 1000),
      cpu: { total: Math.random() * 100, per_core: [50, 45, 60, 55] },
      memory: { percent: 65, used: 5e9, total: 8e9 },
      disk: { percent: 32, read_bps: 1e6, write_bps: 5e5 },
      network: { up_bps: 1e5, down_bps: 5e5 },
      processes: [
        { pid: 1234, name: 'chrome', cpu: 15, memory: 5e8 }
      ]
    }));
  }, 1000);
  
  ws.on('close', () => clearInterval(interval));
});
```

Run: `node mock-server.js`

## 📊 Features Detail

### Real-time Updates

- WebSocket connection with automatic reconnection
- HTTP polling fallback for reliability
- Configurable update intervals
- Play/pause functionality

### Responsive Design

- Desktop: Full dashboard with sidebar
- Tablet: Optimized layout with collapsible sidebar
- Mobile: Stacked layout for easy viewing
- Extension: Compact 420px max-width view

### Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support (Tab, Enter)
- High contrast color scheme (WCAG AA)
- Screen reader friendly

### Performance

- Virtualized process table for large datasets
- Chart data downsampling for smooth rendering
- Throttled updates (2-4 FPS) to reduce CPU usage
- Lazy loading for off-screen components

## 🐛 Troubleshooting

### WebSocket Connection Failed

- Check if backend is running
- Verify WebSocket URL in `useWebSocket.js`
- App will automatically fall back to HTTP polling

### Charts Not Displaying

- Ensure Chart.js is properly installed
- Check browser console for errors
- Verify data format matches expected schema

### Extension Not Loading

- Rebuild with `npm run build`
- Check `manifest.json` is in `dist` folder
- Ensure all required icons exist

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---