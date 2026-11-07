import { Line } from 'react-chartjs-2';
import { formatTimestamp } from '../utils/format';
import useChartTheme from '../utils/useChartTheme';
import useSettingsStore from '../hooks/useSettingsStore';

const GpuChart = ({ metricsHistory, timeframe = 60 }) => {
  const t = useChartTheme();
  const prefs = useSettingsStore((st) => st.chartPreferences);
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
        borderColor: t.ok,
        backgroundColor: t.okA(0.12),
        borderWidth: 2,
        fill: true,
        tension: prefs.smoothLines ? 0.4 : 0,
        pointRadius: prefs.showPoints ? 3 : 0,
        pointHoverRadius: 5,
        yAxisID: 'y',
      },
      {
        label: 'Temperature',
        data: tempData,
        borderColor: t.bad,
        backgroundColor: t.badA(0.12),
        borderWidth: 2,
        fill: true,
        tension: prefs.smoothLines ? 0.4 : 0,
        pointRadius: prefs.showPoints ? 3 : 0,
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
        borderColor: t.ok,
        borderWidth: 1,
        padding: 12,
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
        type: 'linear',
        position: 'left',
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
        },
        title: {
          display: true,
          text: 'Usage (%)',
          color: t.sub
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
          color: t.sub,
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
          color: t.sub
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
