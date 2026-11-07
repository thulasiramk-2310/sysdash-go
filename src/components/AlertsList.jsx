import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { formatRelativeTime } from '../utils/format';
import useMetricsStore from '../hooks/useMetricsStore';

const AlertsList = () => {
  const { alerts, acknowledgeAlert } = useMetricsStore();
  
  const getAlertIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };
  
  const getAlertColor = (type) => {
    switch (type) {
      case 'danger':
        return 'border-danger bg-danger/10 text-danger';
      case 'warning':
        return 'border-accent3 bg-accent3/10 text-accent3';
      default:
        return 'border-accent2 bg-accent2/10 text-accent2';
    }
  };
  
  return (
    <div className="p-6">
      <h3 className="text-text text-lg font-semibold mb-4">Alerts</h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <p className="text-sub text-sm">No alerts</p>
            </motion.div>
          ) : (
            alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`flex items-start gap-3 p-4 rounded-lg border ${getAlertColor(alert.type)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatRelativeTime(alert.timestamp)}
                  </p>
                </div>
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
                  aria-label="Acknowledge alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertsList;
