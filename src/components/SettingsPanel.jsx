import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sun, 
  Moon, 
  RefreshCw, 
  Download, 
  Upload, 
  RotateCcw,
  Bell,
  BellOff,
  Grid3x3,
  TrendingUp,
  Palette
} from 'lucide-react';
import { useState, useEffect } from 'react';
import useSettingsStore from '../hooks/useSettingsStore';

const SettingsPanel = ({ isOpen, onClose, initialTab = null }) => {
  const {
    theme,
    accentColor,
    refreshRate,
    enabledMetrics,
    alertThresholds,
    notifications,
    chartPreferences,
    setTheme,
    setAccentColor,
    setRefreshRate,
    toggleMetric,
    setMetricEnabled,
    setAlertThreshold,
    updateNotifications,
    updateChartPreferences,
    resetLayout,
    exportConfig,
    importConfig,
    resetSettings,
  } = useSettingsStore();
  

  const [importText, setImportText] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleExport = () => {
    const config = exportConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sysdash-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const success = importConfig(importText);
    if (success) {
      setImportText('');
      alert('Configuration imported successfully!');
    } else {
      alert('Failed to import configuration. Please check the format.');
    }
  };

  const refreshRateOptions = [
    { label: '1 second', value: 1000 },
    { label: '2 seconds', value: 2000 },
    { label: '5 seconds', value: 5000 },
    { label: '10 seconds', value: 10000 },
  ];

  const accentColorOptions = [
    { label: 'Electric Cyan', hint: 'Cyan + teal', value: 'cyan', colors: ['#00E5FF', '#2DD4BF'] },
    { label: 'Signal Red', hint: 'Red + silver', value: 'red', colors: ['#FF4B3E', '#C0C0C0'] },
    { label: 'Cobalt & Lime', hint: 'Blue + acid lime', value: 'cobalt', colors: ['#4D8DFF', '#D4FF24'] },
    { label: 'Amber & Sage', hint: 'Amber + sage green', value: 'sage', colors: ['#D5851F', '#87A96B'] },
  ];

  const metricOptions = [
    { id: 'cpu', label: 'CPU Usage', icon: '🔧' },
    { id: 'memory', label: 'Memory Usage', icon: '💾' },
    { id: 'disk', label: 'Disk Usage', icon: '💿' },
    { id: 'network', label: 'Network', icon: '🌐' },
    { id: 'gpu', label: 'GPU Usage', icon: '🎮' },
    { id: 'processes', label: 'Processes', icon: '📋' },
    { id: 'alerts', label: 'Alerts', icon: '🚨' },
  ];

  const tabs = [
    { id: 'general', label: 'General', icon: Grid3x3 },
    { id: 'metrics', label: 'Metrics', icon: TrendingUp },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'advanced', label: 'Advanced', icon: RefreshCw },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-surface border-l border-line/[0.07] shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-line/[0.07]">
              <h2 className="text-2xl font-bold text-text">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-bg rounded-lg transition-colors"
                aria-label="Close settings"
              >
                <X className="w-6 h-6 text-sub" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-6 py-4 border-b border-line/[0.07] overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-accent1 text-bg'
                      : 'text-sub hover:text-text hover:bg-bg'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* General Tab */}
              {activeTab === 'general' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Refresh Rate */}
                  <div>
                    <label className="block text-text font-semibold mb-3">
                      <RefreshCw className="w-4 h-4 inline mr-2" />
                      Refresh Rate
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {refreshRateOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setRefreshRate(option.value)}
                          className={`px-4 py-3 rounded-lg border-2 transition-all ${
                            refreshRate === option.value
                              ? 'border-accent1 bg-accent1/10 text-accent1'
                              : 'border-line/[0.07] text-sub hover:border-accent1/50 hover:text-text'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notifications */}
                  <div>
                    <label className="block text-text font-semibold mb-3">
                      <Bell className="w-4 h-4 inline mr-2" />
                      Notifications
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 bg-bg rounded-lg cursor-pointer hover:bg-bg/70 transition-colors">
                        <span className="text-text">Enable Notifications</span>
                        <input
                          type="checkbox"
                          checked={notifications.enabled}
                          onChange={(e) => updateNotifications({ enabled: e.target.checked })}
                          className="w-5 h-5 text-accent1 rounded focus:ring-2 focus:ring-accent1"
                        />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-bg rounded-lg cursor-pointer hover:bg-bg/70 transition-colors">
                        <span className="text-text">Sound Alerts</span>
                        <input
                          type="checkbox"
                          checked={notifications.sound}
                          onChange={(e) => updateNotifications({ sound: e.target.checked })}
                          className="w-5 h-5 text-accent1 rounded focus:ring-2 focus:ring-accent1"
                        />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-bg rounded-lg cursor-pointer hover:bg-bg/70 transition-colors">
                        <span className="text-text">Desktop Notifications</span>
                        <input
                          type="checkbox"
                          checked={notifications.desktop}
                          onChange={(e) => updateNotifications({ desktop: e.target.checked })}
                          className="w-5 h-5 text-accent1 rounded focus:ring-2 focus:ring-accent1"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Alert Thresholds */}
                  <div>
                    <label className="block text-text font-semibold mb-3">Alert Thresholds</label>
                    <div className="space-y-3">
                      {Object.entries(alertThresholds).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-4 p-4 bg-bg rounded-lg">
                          <span className="text-text capitalize flex-1">{key}</span>
                          <input
                            type="range"
                            min="50"
                            max="95"
                            step="5"
                            value={value}
                            onChange={(e) => setAlertThreshold(key, Number(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-accent1 font-bold w-12 text-right">{value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Metrics Tab */}
              {activeTab === 'metrics' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <p className="text-sub text-sm">
                    Select which metrics to display on your dashboard
                  </p>
                  <div className="flex items-center justify-between p-3 bg-bg rounded-lg">
                    <div className="text-text font-medium">Select All Metrics</div>
                    <input
                      type="checkbox"
                      checked={Object.values(enabledMetrics).every(Boolean)}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        // set each metric explicitly
                        metricOptions.forEach((m) => setMetricEnabled(m.id, enabled));
                      }}
                      className="fancy-checkbox"
                      aria-label="Select all metrics"
                    />
                  </div>

                  <div className="space-y-3">
                    {metricOptions.map((metric) => (
                      <label
                        key={metric.id}
                        className="flex items-center justify-between p-4 bg-bg rounded-lg cursor-pointer hover:bg-bg/70 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{metric.icon}</span>
                          <span className="text-text font-medium">{metric.label}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={!!enabledMetrics[metric.id]}
                          onChange={() => toggleMetric(metric.id)}
                          className="fancy-checkbox"
                          aria-label={`Toggle ${metric.label}`}
                        />
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Theme */}
                  <div>
                    <label className="block text-text font-semibold mb-3">
                      Theme Mode
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                          theme === 'dark'
                            ? 'border-accent1 bg-accent1/10 text-accent1'
                            : 'border-line/[0.07] text-sub hover:border-accent1/50 hover:text-text'
                        }`}
                      >
                        <Moon className="w-5 h-5" />
                        Dark
                      </button>
                      <button
                        onClick={() => setTheme('light')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                          theme === 'light'
                            ? 'border-accent1 bg-accent1/10 text-accent1'
                            : 'border-line/[0.07] text-sub hover:border-accent1/50 hover:text-text'
                        }`}
                      >
                        <Sun className="w-5 h-5" />
                        Light
                      </button>
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div>
                    <label className="block text-text font-semibold mb-3">
                      <Palette className="w-4 h-4 inline mr-2" />
                      Accent Color
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {accentColorOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setAccentColor(option.value)}
                          aria-pressed={accentColor === option.value}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                            accentColor === option.value
                              ? 'border-accent1 bg-accent1/10'
                              : 'border-line/[0.07] hover:border-accent1/50'
                          }`}
                        >
                          <div className="flex -space-x-2 flex-shrink-0" aria-hidden="true">
                            {option.colors.map((c) => (
                              <span key={c} className="w-6 h-6 rounded-full border-2 border-surface" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <span className="text-left leading-tight">
                            <span className="block text-text text-sm font-medium">{option.label}</span>
                            <span className="block text-sub text-xs">{option.hint}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chart Preferences */}
                  <div>
                    <label className="block text-text font-semibold mb-3">Chart Options</label>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 bg-bg rounded-lg cursor-pointer hover:bg-bg/70 transition-colors">
                        <span className="text-text">Show Grid Lines</span>
                        <input
                          type="checkbox"
                          checked={chartPreferences.showGrid}
                          onChange={(e) => updateChartPreferences({ showGrid: e.target.checked })}
                          className="w-5 h-5 text-accent1 rounded focus:ring-2 focus:ring-accent1"
                        />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-bg rounded-lg cursor-pointer hover:bg-bg/70 transition-colors">
                        <span className="text-text">Show Legend</span>
                        <input
                          type="checkbox"
                          checked={chartPreferences.showLegend}
                          onChange={(e) => updateChartPreferences({ showLegend: e.target.checked })}
                          className="w-5 h-5 text-accent1 rounded focus:ring-2 focus:ring-accent1"
                        />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-bg rounded-lg cursor-pointer hover:bg-bg/70 transition-colors">
                        <span className="text-text">Smooth Lines</span>
                        <input
                          type="checkbox"
                          checked={chartPreferences.smoothLines}
                          onChange={(e) => updateChartPreferences({ smoothLines: e.target.checked })}
                          className="w-5 h-5 text-accent1 rounded focus:ring-2 focus:ring-accent1"
                        />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-bg rounded-lg cursor-pointer hover:bg-bg/70 transition-colors">
                        <span className="text-text">Show Points</span>
                        <input
                          type="checkbox"
                          checked={chartPreferences.showPoints}
                          onChange={(e) => updateChartPreferences({ showPoints: e.target.checked })}
                          className="w-5 h-5 text-accent1 rounded focus:ring-2 focus:ring-accent1"
                        />
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Advanced Tab */}
              {activeTab === 'advanced' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Export/Import */}
                  <div>
                    <label className="block text-text font-semibold mb-3">
                      <Download className="w-4 h-4 inline mr-2" />
                      Export Configuration
                    </label>
                    <button
                      onClick={handleExport}
                      className="w-full px-4 py-3 bg-accent1 text-bg rounded-lg hover:bg-accent1/90 transition-colors font-medium"
                    >
                      <Download className="w-4 h-4 inline mr-2" />
                      Download Config File
                    </button>
                  </div>

                  <div>
                    <label className="block text-text font-semibold mb-3">
                      <Upload className="w-4 h-4 inline mr-2" />
                      Import Configuration
                    </label>
                    <textarea
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder="Paste configuration JSON here..."
                      className="w-full h-32 px-4 py-3 bg-bg text-text rounded-lg border border-line/[0.07] focus:border-accent1 focus:outline-none resize-none font-mono text-sm"
                    />
                    <button
                      onClick={handleImport}
                      disabled={!importText.trim()}
                      className="w-full mt-3 px-4 py-3 bg-accent2 text-bg rounded-lg hover:bg-accent2/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4 inline mr-2" />
                      Import Configuration
                    </button>
                  </div>

                  {/* Reset Options */}
                  <div>
                    <label className="block text-text font-semibold mb-3">
                      <RotateCcw className="w-4 h-4 inline mr-2" />
                      Reset Options
                    </label>
                    <div className="space-y-3">
                      <button
                        onClick={resetLayout}
                        className="w-full px-4 py-3 bg-bg text-text rounded-lg hover:bg-bg/70 transition-colors border border-line/[0.07]"
                      >
                        Reset Dashboard Layout
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to reset all settings? This cannot be undone.')) {
                            resetSettings();
                          }
                        }}
                        className="w-full px-4 py-3 bg-danger/20 text-danger rounded-lg hover:bg-danger/30 transition-colors border border-danger/50 font-medium"
                      >
                        Reset All Settings
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
