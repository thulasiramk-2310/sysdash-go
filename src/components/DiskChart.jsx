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
import useChartTheme from '../utils/useChartTheme';
import useSettingsStore from '../hooks/useSettingsStore';
import { formatBytesPerSecond } from '../utils/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DiskChart = ({ metricsHistory, timeframe = 20 }) => {
  const t = useChartTheme();
  const prefs = useSettingsStore((st) => st.chartPreferences);
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
        backgroundColor: t.a2,
        borderRadius: 6,
      },
      {
        label: 'Write',
        data: writeData,
        backgroundColor: t.a3,
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
        borderColor: t.a2,
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
          color: t.sub,
          font: {
            family: 'Inter',
            size: 10
          },
          maxTicksLimit: 10
        }
      },
      y: {
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
            return formatBytesPerSecond(value);
          }
        }
      }
    }
  };
  
  return (
    <div className="p-6">
      <h3 className="text-text/90 text-[15px] font-medium tracking-tight mb-4">Disk I/O</h3>
      <div className="h-48">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DiskChart;
