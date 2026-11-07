import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Server, 
  Settings, 
  Bell, 
  Download,
  Home
} from 'lucide-react';
import { useState } from 'react';
import { useEffect } from 'react';
import useMetricsStore from '../hooks/useMetricsStore';

const Sidebar = ({ onOpenSettings = () => {}, onExport = () => {}, onOpenAlerts = () => {} }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { availableHosts, selectedHost, setSelectedHost, alerts, fetchHosts } = useMetricsStore();

  useEffect(() => {
    // try to fetch hosts from backend when the sidebar mounts
    fetchHosts();
  }, [fetchHosts]);
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', action: () => { /* placeholder - could navigate home */ } , active: true },
    { icon: Bell, label: 'Alerts', action: onOpenAlerts, badge: alerts.length },
    { icon: Settings, label: 'Settings', action: () => onOpenSettings('general') },
    { icon: Download, label: 'Export', action: onExport },
  ];
  
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="bg-surface/80 backdrop-blur-xl border-r border-line/[0.06] flex flex-col relative"
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-raised border border-line/[0.12] rounded-full flex items-center justify-center text-text hover:border-accent1/60 transition-colors z-10"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
      
      {/* Hosts section (show only selected host; fetched from backend) */}
      <div className="p-6 border-b border-line/[0.07]">
        {!isCollapsed ? (
          <>
            <h3 className="text-sub text-xs font-semibold uppercase tracking-wide mb-3">
              Host
            </h3>
            <div>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  selectedHost
                    ? 'bg-accent1/[0.08] text-accent1 border border-accent1/30'
                    : 'text-sub hover:bg-line/[0.04] hover:text-text'
                }`}
                onClick={() => {/* noop or future host picker */}}
              >
                <Server className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium truncate">{selectedHost || 'No host'}</span>
                <div className={`w-2 h-2 rounded-full ml-auto flex-shrink-0 ${
                  selectedHost ? 'bg-success' : 'bg-sub/50'
                }`} />
              </button>
            </div>
          </>
        ) : (
          <div className="p-3">
            <button
              className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
                selectedHost
                  ? 'bg-accent1/20 text-accent1'
                  : 'text-sub hover:bg-line/[0.04] hover:text-text'
              }`}
              title={selectedHost || 'No host'}
            >
              <Server className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      
      {/* Menu items */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                item.active
                  ? 'bg-line/[0.06] text-text shadow-[inset_2px_0_0_0_rgb(var(--c-accent1))]'
                  : 'text-sub hover:bg-line/[0.04] hover:text-text'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="text-sm font-medium flex-1 text-left">
                    {item.label}
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </nav>
      
      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-line/[0.07]">
          <div className="text-xs text-sub">
            <p>SysDash v1.0.0</p>
            <p className="mt-1">© 2025</p>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
