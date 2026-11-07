import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import useChartTheme from '../utils/useChartTheme';
import useSettingsStore from '../hooks/useSettingsStore';
import { formatBytes } from '../utils/format';

ChartJS.register(ArcElement, Tooltip, Legend);

const MemoryChart = ({ currentMetrics }) => {
  const t = useChartTheme();
  const prefs = useSettingsStore((st) => st.chartPreferences);
  const memPercent = currentMetrics?.memory?.percent || 0;
  const memUsed = currentMetrics?.memory?.used || 0;
  const memTotal = currentMetrics?.memory?.total || 0;
  const memFree = memTotal - memUsed;
  
  const data = {
    labels: ['Used', 'Free'],
    datasets: [
      {
        data: [memPercent, 100 - memPercent],
        backgroundColor: [t.a2, t.grid],
        borderColor: [t.a2, t.border],
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
       display: prefs.showLegend,
        display: false
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
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value.toFixed(1)}%`;
          }
        }
      }
    }
  };
  
  return (
    <div className="p-6">
      <h3 className="text-text/90 text-[15px] font-medium tracking-tight mb-6">Memory Usage</h3>
      
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
          <div className="border-t border-line/[0.07] pt-3">
            <div className="text-sub text-xs">Total</div>
            <div className="text-text font-semibold">{formatBytes(memTotal)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryChart;
