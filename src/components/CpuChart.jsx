import { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { formatTimestamp } from '../utils/format';
import useChartTheme from '../utils/useChartTheme';
import useSettingsStore from '../hooks/useSettingsStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CpuChart = ({ metricsHistory, timeframe = 60 }) => {
  const t = useChartTheme();
  const prefs = useSettingsStore((st) => st.chartPreferences);
  const chartRef = useRef(null);
  
  // Prepare data
  const data = metricsHistory.slice(-timeframe);
  const labels = data.map(m => formatTimestamp(m.timestamp));
  const cpuData = data.map(m => m.cpu?.total || 0);
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'CPU Usage',
        data: cpuData,
        borderColor: t.a1,
        backgroundColor: t.a1a(0.12),
        borderWidth: 2,
        fill: true,
        tension: prefs.smoothLines ? 0.4 : 0,
        pointRadius: prefs.showPoints ? 3 : 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: t.a1,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: prefs.showLegend,
        position: 'top',
        labels: {
          color: t.text,
          font: {
            family: 'Inter',
            size: 12
          },
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: t.surface,
        titleColor: t.text,
        bodyColor: t.sub,
        borderColor: t.a1,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: prefs.showGrid,
          color: t.grid,
          drawBorder: false,
        },
        ticks: {
          color: t.sub,
          font: {
            family: 'Inter',
            size: 10
          },
          maxTicksLimit: 10,
          maxRotation: 0
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          display: prefs.showGrid,
          color: t.grid,
          drawBorder: false,
        },
        ticks: {
          color: t.sub,
          font: {
            family: 'Inter',
            size: 10
          },
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text/90 text-[15px] font-medium tracking-tight">CPU Utilization</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent1 animate-pulse" />
          <span className="text-sub text-sm">Live</span>
        </div>
      </div>
      <div className="h-48">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default CpuChart;
