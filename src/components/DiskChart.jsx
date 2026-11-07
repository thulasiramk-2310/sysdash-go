import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { formatBytesPerSecond } from '../utils/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DiskChart = ({ metricsHistory, timeframe = 20 }) => {
  const data = metricsHistory.slice(-timeframe);
  const labels = data.map((_, index) => `${index + 1}`);
  const readData = data.map(m => m.disk?.read_bps || 0);
  const writeData = data.map(m => m.disk?.write_bps || 0);
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Read',
        data: readData,
        backgroundColor: '#00D4FF',
        borderRadius: 6,
      },
      {
        label: 'Write',
        data: writeData,
        backgroundColor: '#FFB86B',
        borderRadius: 6,
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
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#94A3B8',
          font: {
            family: 'Inter',
            size: 10
          },
          maxTicksLimit: 10
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
    <div className="bg-surface rounded-2xl border border-accent2/20 p-6 shadow-lg">
      <h3 className="text-text text-lg font-semibold mb-4">Disk I/O</h3>
      <div className="h-48">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DiskChart;
