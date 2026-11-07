# Quick Start Guide

Get SysDash up and running in 5 minutes!

## 🚀 Installation

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- React & React DOM
- Tailwind CSS
- Chart.js & react-chartjs-2
- Framer Motion
- Zustand (state management)
- Lucide React (icons)
- React Window (virtualization)

### Step 2: Start Mock Server (Optional)

If you don't have a backend, use our mock server:

```bash
# In a new terminal
cd d:\coe_project
npm install ws
node mock-server.js
```

The mock server will run on `http://localhost:8080`

### Step 3: Start Frontend

```bash
npm run dev
```

The dashboard will open at `http://localhost:3000`

## 🎯 What You'll See

### Dashboard Components

1. **Header Bar**
   - Connection status indicator
   - Play/Pause controls
   - Timeframe selector (30s, 1m, 5m, 1h)
   - Host selector

2. **Sidebar**
   - Available hosts list
   - Navigation menu
   - Alerts counter
   - Settings and export options

3. **Metric Cards** (Top Row)
   - CPU Usage with sparkline
   - Memory Usage with sparkline
   - Disk Usage with sparkline
   - Network Upload with sparkline

4. **Charts** (Middle Section)
   - CPU Utilization Line Chart
   - Memory Usage Doughnut Chart
   - Disk I/O Bar Chart
   - Network Throughput Line Chart

5. **Process Table** (Bottom Left)
   - Sortable columns (PID, Name, CPU, Memory)
   - Virtualized for performance
   - Real-time updates

6. **Alerts Panel** (Bottom Right)
   - System alerts
   - Acknowledgeable notifications
   - Color-coded severity

7. **Activity Log** (Bottom)
   - Recent metrics snapshots
   - Monospace formatted logs

## 🎨 Features to Try

### 1. Real-time Monitoring

The dashboard updates automatically every 2 seconds with fresh metrics.

### 2. Pause/Resume

Click the **Pause** button in the header to freeze updates. Click **Resume** to continue.

### 3. Change Timeframe

Select different timeframes from the dropdown:
- 30 seconds
- 1 minute
- 5 minutes
- 1 hour

### 4. Switch Hosts

Click on different hosts in the sidebar to view their metrics (demo mode cycles through mock data).

### 5. Sort Processes

Click column headers in the process table to sort by:
- Process ID
- Name
- CPU usage
- Memory usage

### 6. Acknowledge Alerts

Click the ❌ icon on alerts to acknowledge and dismiss them.

### 7. Popup Mode

Click **Popup Mode** button to see the compact Chrome extension view.

## 🔧 Customization

### Change Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  accent1: "#YOUR_COLOR",  // Purple theme
  accent2: "#YOUR_COLOR",  // Cyan theme
  accent3: "#YOUR_COLOR",  // Orange theme
}
```

### Change Update Interval

Edit `src/hooks/useWebSocket.js`:

```javascript
const HTTP_POLL_INTERVAL = 5000; // Change to 5 seconds
```

### Add More Metrics

Edit the mock data generator in `src/hooks/useWebSocket.js` or connect to your real backend.

## 📱 Chrome Extension Setup

### Build Extension

```bash
npm run build
```

### Load in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` folder
6. Click the extension icon in your toolbar

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is busy:

```bash
# Edit vite.config.js
export default defineConfig({
  server: {
    port: 3001  // Use different port
  }
})
```

### Mock Server Won't Start

```bash
# Install ws dependency
npm install ws

# Or use a different port
PORT=8081 node mock-server.js
```

Then update `src/hooks/useWebSocket.js`:

```javascript
const WS_URL = 'ws://localhost:8081/live';
```

### Blank Screen

Check browser console (F12) for errors. Common issues:
- Missing dependencies: Run `npm install`
- Port conflicts: Change port in vite.config.js

### WebSocket Not Connecting

The app automatically falls back to HTTP polling. You'll see an amber/red connection indicator, but data will still flow.

## 📚 Next Steps

1. **Connect to Real Backend**: See `API.md` for backend implementation
2. **Deploy to Production**: See `DEPLOYMENT.md` for deployment options
3. **Customize UI**: Modify components in `src/components/`
4. **Add Features**: Extend with your own metrics and visualizations

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Chart.js](https://www.chartjs.org)
- [Framer Motion](https://www.framer.com/motion)
- [Vite Guide](https://vitejs.dev)

## 💡 Pro Tips

1. **Keep Browser DevTools Open**: Monitor network requests and console logs
2. **Use React DevTools**: Install the React DevTools browser extension
3. **Check Performance**: Open Performance tab to analyze rendering
4. **Test Responsive Design**: Use device emulation in DevTools
5. **Explore Components**: Each component is self-contained and documented

## 🎉 You're All Set!

The dashboard is now running with beautiful visualizations and smooth animations. Enjoy exploring system metrics in style!

---

**Need help?** Check README.md for detailed documentation or open an issue on GitHub.
