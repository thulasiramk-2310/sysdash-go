import { Line } from 'react-chartjs-2';
import { formatTimestamp } from '../utils/format';

const GpuChart = ({ metricsHistory, timeframe = 60 }) => {
  const data = metricsHistory.slice(-timeframe);
  const labels = data.map(m => formatTimestamp(m.timestamp));
  const gpuData = data.map(m => m.gpu?.usage || 0);
  const tempData = data.map(m => m.gpu?.temperature || 0);
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'GPU Usage',
        data: gpuData,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        yAxisID: 'y',
      },
      {
        label: 'Temperature',
        data: tempData,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        yAxisID: 'y1',
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
        borderColor: '#10B981',
        borderWidth: 1,
        padding: 12,
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
        type: 'linear',
        position: 'left',
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
        },
        title: {
          display: true,
          text: 'Usage (%)',
          color: '#94A3B8'
        }
      },
      y1: {
        type: 'linear',
        position: 'right',
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#94A3B8',
          font: {
            family: 'Inter',
            size: 10
          },
          callback: function(value) {
            return value + '°C';
          }
        },
        title: {
          display: true,
          text: 'Temp (°C)',
          color: '#94A3B8'
        }
      }
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sub text-sm">Live</span>
        </div>
      </div>
      <div className="flex-1">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default GpuChart;
