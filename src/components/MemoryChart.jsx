import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { formatBytes } from '../utils/format';

ChartJS.register(ArcElement, Tooltip, Legend);

const MemoryChart = ({ currentMetrics }) => {
  const memPercent = currentMetrics?.memory?.percent || 0;
  const memUsed = currentMetrics?.memory?.used || 0;
  const memTotal = currentMetrics?.memory?.total || 0;
  const memFree = memTotal - memUsed;
  
  const data = {
    labels: ['Used', 'Free'],
    datasets: [
      {
        data: [memPercent, 100 - memPercent],
        backgroundColor: ['#00D4FF', 'rgba(148, 163, 184, 0.1)'],
        borderColor: ['#00D4FF', 'rgba(148, 163, 184, 0.2)'],
        borderWidth: 2,
        cutout: '75%',
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value.toFixed(1)}%`;
          }
        }
      }
    }
  };
  
  return (
    <div className="bg-surface rounded-2xl border border-accent2/20 p-6 shadow-lg">
      <h3 className="text-text text-lg font-semibold mb-6">Memory Usage</h3>
      
      <div className="flex items-center justify-center gap-8">
        {/* Chart */}
        <div className="relative w-48 h-48">
          <Doughnut data={data} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-accent2">
              {memPercent.toFixed(1)}%
            </span>
            <span className="text-sm text-sub">Used</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-accent2" />
            <div>
              <div className="text-sub text-xs">Used</div>
              <div className="text-text font-semibold">{formatBytes(memUsed)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-sub/20" />
            <div>
              <div className="text-sub text-xs">Free</div>
              <div className="text-text font-semibold">{formatBytes(memFree)}</div>
            </div>
          </div>
          <div className="border-t border-sub/20 pt-3">
            <div className="text-sub text-xs">Total</div>
            <div className="text-text font-semibold">{formatBytes(memTotal)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryChart;
