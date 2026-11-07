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
        borderColor: '#7C5CFF',
        backgroundColor: 'rgba(124, 92, 255, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#7C5CFF',
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
        display: true,
        position: 'top',
        labels: {
          color: '#E6EEF8',
          font: {
            family: 'Inter',
            size: 12
          },
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: '#0b1220',
        titleColor: '#E6EEF8',
        bodyColor: '#94A3B8',
        borderColor: '#7C5CFF',
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
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#94A3B8',
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
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#94A3B8',
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
    <div className="bg-surface rounded-2xl border border-accent1/20 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text text-lg font-semibold">CPU Utilization</h3>
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
