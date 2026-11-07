import { Line } from 'react-chartjs-2';
import { formatBytesPerSecond } from '../utils/format';
import useChartTheme from '../utils/useChartTheme';
import useSettingsStore from '../hooks/useSettingsStore';

const NetworkChart = ({ metricsHistory, timeframe = 60 }) => {
  const t = useChartTheme();
  const prefs = useSettingsStore((st) => st.chartPreferences);
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
        borderColor: t.a3,
        backgroundColor: t.a3a(0.12),
        borderWidth: 2,
        fill: true,
        tension: prefs.smoothLines ? 0.4 : 0,
        pointRadius: prefs.showPoints ? 3 : 0,
        pointHoverRadius: 5,
      },
      {
        label: 'Download',
        data: downloadData,
        borderColor: t.a2,
        backgroundColor: t.a2a(0.12),
        borderWidth: 2,
        fill: true,
        tension: prefs.smoothLines ? 0.4 : 0,
        pointRadius: prefs.showPoints ? 3 : 0,
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
    <div className="p-5">
      <h3 className="text-text/90 text-[15px] font-medium tracking-tight mb-2">Network Throughput</h3>
      <div className="h-48" style={{marginBottom: 0}}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default NetworkChart;
