import { Line } from 'react-chartjs-2';
import { formatBytesPerSecond } from '../utils/format';

const NetworkChart = ({ metricsHistory, timeframe = 60 }) => {
  const data = metricsHistory.slice(-timeframe);
  const labels = data.map((_, index) => `${index + 1}`);
  const uploadData = data.map(m => m.network?.up_bps || 0);
  const downloadData = data.map(m => m.network?.down_bps || 0);
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Upload',
        data: uploadData,
        borderColor: '#FFB86B',
        backgroundColor: 'rgba(255, 184, 107, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
      {
        label: 'Download',
        data: downloadData,
        borderColor: '#00D4FF',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        borderColor: '#00D4FF',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatBytesPerSecond(context.parsed.y)}`;
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
            return formatBytesPerSecond(value);
          }
        }
      }
    }
  };
  
  return (
    <div className="bg-surface rounded-2xl border border-accent3/20 p-4 shadow-lg">
      <h3 className="text-text text-lg font-semibold mb-2">Network Throughput</h3>
      <div className="h-48" style={{marginBottom: 0}}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default NetworkChart;
