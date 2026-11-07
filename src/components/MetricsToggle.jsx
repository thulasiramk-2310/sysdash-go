import { motion } from 'framer-motion';
import { Cpu, MemoryStick, HardDrive, Network, Activity } from 'lucide-react';
import MetricCard from './MetricCard';
import useMetricsStore from '../hooks/useMetricsStore';
import { getStatusColor } from '../utils/format';

const MetricsToggle = () => {
  const { currentMetrics, metricsHistory } = useMetricsStore();
  
  if (!currentMetrics) {
    return (
      <div className="text-center py-8">
        <p className="text-sub text-sm">Waiting for metrics data...</p>
      </div>
    );
  }
  
  // Get previous metrics for delta calculation
  const previousMetrics = metricsHistory.length > 1 
    ? metricsHistory[metricsHistory.length - 2] 
    : null;
  
  // Calculate deltas
  const cpuDelta = previousMetrics 
    ? currentMetrics.cpu.total - previousMetrics.cpu.total 
    : 0;
  const memDelta = previousMetrics 
    ? currentMetrics.memory.percent - previousMetrics.memory.percent 
    : 0;
  const diskDelta = previousMetrics 
    ? currentMetrics.disk.percent - previousMetrics.disk.percent 
    : 0;
  const netUpDelta = previousMetrics 
    ? (currentMetrics.network.up_bps - previousMetrics.network.up_bps) / 1024 / 1024 
    : 0;
  
  // Get sparkline data
  const cpuSparkline = metricsHistory.slice(-20).map(m => m.cpu?.total || 0);
  const memSparkline = metricsHistory.slice(-20).map(m => m.memory?.percent || 0);
  const diskSparkline = metricsHistory.slice(-20).map(m => m.disk?.percent || 0);
  const netSparkline = metricsHistory.slice(-20).map(m => m.network?.up_bps / 1024 / 1024 || 0);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <MetricCard
        title="CPU Usage"
        value={currentMetrics.cpu.total}
        unit="%"
        icon={Cpu}
        color={getStatusColor(currentMetrics.cpu.total)}
        sparklineData={cpuSparkline}
        delta={cpuDelta}
      />
      
      <MetricCard
        title="Memory Usage"
        value={currentMetrics.memory.percent}
        unit="%"
        icon={MemoryStick}
        color={getStatusColor(currentMetrics.memory.percent)}
        sparklineData={memSparkline}
        delta={memDelta}
      />
      
      <MetricCard
        title="Disk Usage"
        value={currentMetrics.disk.percent}
        unit="%"
        icon={HardDrive}
        color="success"
        sparklineData={diskSparkline}
        delta={diskDelta}
      />
      
      <MetricCard
        title="Network Upload"
        value={currentMetrics.network.up_bps / 1024 / 1024}
        unit="MB/s"
        icon={Network}
        color="accent3"
        sparklineData={netSparkline}
        delta={netUpDelta}
      />
    </div>
  );
};

export default MetricsToggle;
