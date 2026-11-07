import { 
  Play, 
  Pause, 
  Clock, 
  User,
  Activity
} from 'lucide-react';
import useMetricsStore from '../hooks/useMetricsStore';

const Header = () => {
  const { 
    isPaused, 
    togglePause, 
    timeframe, 
    setTimeframe, 
    selectedHost,
    connectionStatus,
    isConnected 
  } = useMetricsStore();
  
  const timeframes = [
    { label: '30s', value: 30 },
    { label: '1m', value: 60 },
    { label: '5m', value: 300 },
    { label: '1h', value: 3600 },
  ];
  
  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-success';
      case 'reconnecting':
        return 'bg-accent3 animate-pulse';
      default:
        return 'bg-danger';
    }
  };
  
  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'reconnecting':
        return 'Reconnecting...';
      default:
        return 'Disconnected';
    }
  };
  
  return (
    <header className="bg-surface border-b border-sub/20 px-8 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent1 to-accent2 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text">SysDash</h1>
              <p className="text-xs text-sub">System Monitor</p>
            </div>
          </div>
          
          {/* Connection status */}
          <div className="flex items-center gap-2 px-3 py-2 bg-bg rounded-lg border border-sub/20">
            <div className={`w-2 h-2 rounded-full ${getConnectionColor()}`} />
            <span className="text-sm text-sub">{getConnectionText()}</span>
          </div>
        </div>
        
        {/* Center: Controls */}
        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={togglePause}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              isPaused
                ? 'bg-accent1 border-accent1 text-white hover:bg-accent1/90'
                : 'bg-surface border-sub/30 text-text hover:bg-bg'
            }`}
            aria-label={isPaused ? 'Resume updates' : 'Pause updates'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {isPaused ? 'Resume' : 'Pause'}
            </span>
          </button>
          
          {/* Timeframe selector */}
          <div className="flex items-center gap-2 px-3 py-2 bg-bg rounded-lg border border-sub/20">
            <Clock className="w-4 h-4 text-sub" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(Number(e.target.value))}
              className="bg-transparent text-text text-sm font-medium outline-none cursor-pointer"
            >
              {timeframes.map((tf) => (
                <option key={tf.value} value={tf.value} className="bg-surface">
                  {tf.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Host display */}
          <div className="flex items-center gap-2 px-3 py-2 bg-bg rounded-lg border border-sub/20">
            <span className="text-sm text-sub">Host:</span>
            <span className="text-sm font-semibold text-accent1">{selectedHost}</span>
          </div>
        </div>
        
        {/* Right: User menu */}
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 bg-gradient-to-br from-accent2 to-accent1 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
