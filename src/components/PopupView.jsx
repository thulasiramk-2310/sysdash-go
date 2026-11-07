import { motion } from 'framer-motion';
import { Cpu, MemoryStick, HardDrive } from 'lucide-react';
import useMetricsStore from '../hooks/useMetricsStore';
import { formatBytes } from '../utils/format';

const PopupView = () => {
  const { currentMetrics, metricsHistory, isConnected } = useMetricsStore();
  
  if (!currentMetrics) {
    return (
      <div className="w-full max-w-md mx-auto bg-surface p-6 rounded-2xl">
        <p className="text-sub text-center">Loading...</p>
      </div>
    );
  }
  
  const cpuSparkline = metricsHistory.slice(-15).map(m => m.cpu?.total || 0);
  const memSparkline = metricsHistory.slice(-15).map(m => m.memory?.percent || 0);
  const diskSparkline = metricsHistory.slice(-15).map(m => m.disk?.percent || 0);
  
  const MiniSparkline = ({ data, color }) => {
    if (!data || data.length < 2) return null;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg className="w-full h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };
  
  return (
    <div className="w-full max-w-md mx-auto bg-bg min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text">SysDash</h1>
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success' : 'bg-danger'}`} />
        </div>
        
        {/* CPU Card */}
        <div className="bg-surface border border-accent1/20 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-accent1/10">
              <Cpu className="w-5 h-5 text-accent1" />
            </div>
            <div className="flex-1">
              <p className="text-sub text-xs uppercase tracking-wide">CPU Usage</p>
              <p className="text-2xl font-bold text-text">
                {currentMetrics.cpu.total.toFixed(1)}%
              </p>
            </div>
          </div>
          <MiniSparkline data={cpuSparkline} color="#7C5CFF" />
        </div>
        
        {/* Memory Card */}
        <div className="bg-surface border border-accent2/20 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-accent2/10">
              <MemoryStick className="w-5 h-5 text-accent2" />
            </div>
            <div className="flex-1">
              <p className="text-sub text-xs uppercase tracking-wide">Memory</p>
              <p className="text-2xl font-bold text-text">
                {currentMetrics.memory.percent.toFixed(1)}%
              </p>
              <p className="text-xs text-sub">
                {formatBytes(currentMetrics.memory.used)} / {formatBytes(currentMetrics.memory.total)}
              </p>
            </div>
          </div>
          <MiniSparkline data={memSparkline} color="#00D4FF" />
        </div>
        
        {/* Disk Card */}
        <div className="bg-surface border border-success/20 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-success/10">
              <HardDrive className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1">
              <p className="text-sub text-xs uppercase tracking-wide">Disk Usage</p>
              <p className="text-2xl font-bold text-text">
                {currentMetrics.disk.percent.toFixed(1)}%
              </p>
            </div>
          </div>
          <MiniSparkline data={diskSparkline} color="#10B981" />
        </div>
        
        {/* Top Process */}
        {currentMetrics.processes && currentMetrics.processes.length > 0 && (
          <div className="bg-surface border border-sub/20 rounded-xl p-4">
            <p className="text-sub text-xs uppercase tracking-wide mb-3">Top Process</p>
            <div className="flex items-center justify-between">
              <span className="text-text font-medium">{currentMetrics.processes[0].name}</span>
              <span className="text-accent1 font-bold">
                {currentMetrics.processes[0].cpu.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PopupView;
