import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPercent } from '../utils/format';

const MetricCard = ({ 
  title, 
  value, 
  unit = '%', 
  icon: Icon, 
  color = 'accent1', 
  sparklineData = [],
  delta = 0,
  trend = 'stable'
}) => {
  const colorClasses = {
    accent1: 'from-accent1/20 to-accent1/5 border-accent1/30',
    accent2: 'from-accent2/20 to-accent2/5 border-accent2/30',
    accent3: 'from-accent3/20 to-accent3/5 border-accent3/30',
    success: 'from-success/20 to-success/5 border-success/30',
    danger: 'from-danger/20 to-danger/5 border-danger/30',
  };
  
  const iconColorClasses = {
    accent1: 'text-accent1',
    accent2: 'text-accent2',
    accent3: 'text-accent3',
    success: 'text-success',
    danger: 'text-danger',
  };
  
  const bgColorClasses = {
    accent1: 'bg-accent1',
    accent2: 'bg-accent2',
    accent3: 'bg-accent3',
    success: 'bg-success',
    danger: 'bg-danger',
  };
  
  const getTrendIcon = () => {
    if (trend === 'up' || delta > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down' || delta < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };
  
  const getTrendColor = () => {
    if (delta > 0) return 'text-danger';
    if (delta < 0) return 'text-success';
    return 'text-sub';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-gradient-to-br ${colorClasses[color]} border rounded-2xl p-6 shadow-card overflow-hidden hover:shadow-glow transition-shadow duration-300`}
    >
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${bgColorClasses[color]}`} />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-surface/50 ${iconColorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-sub text-sm font-medium uppercase tracking-wide">
            {title}
          </h3>
        </div>
        
        {/* Delta badge */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-surface/50 ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="text-xs font-semibold">
            {delta !== 0 ? `${Math.abs(delta).toFixed(1)}${unit}` : '—'}
          </span>
        </div>
      </div>
      
      {/* Value */}
      <motion.div 
        className="mb-4"
        key={value}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-text">
            {typeof value === 'number' ? value.toFixed(1) : value}
          </span>
          <span className="text-2xl font-semibold text-sub">
            {unit}
          </span>
        </div>
      </motion.div>
      
      {/* Sparkline */}
      {sparklineData.length > 0 && (
        <div className="h-12 mt-4">
          <SparklineChart data={sparklineData} color={color} />
        </div>
      )}
    </motion.div>
  );
};

// Simple sparkline component
const SparklineChart = ({ data, color }) => {
  if (!data || data.length < 2) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  const colorMap = {
    accent1: '#22D3EE',
    accent2: '#2DD4BF',
    accent3: '#F5B861',
    success: '#34D399',
    danger: '#EF4444',
  };
  
  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={colorMap[color]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      <polyline
        points={`0,100 ${points} 100,100`}
        fill={colorMap[color]}
        opacity="0.1"
      />
    </svg>
  );
};

export default MetricCard;
