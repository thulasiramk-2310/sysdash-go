// Format bytes to human readable format
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  if (bytes < k) return bytes + ' Bytes';
  if (bytes < k ** 2) return (bytes / k).toFixed(dm) + ' KB';
  if (bytes < k ** 3) return (bytes / k ** 2).toFixed(dm) + ' MB';
  // Always show GB for values >= 1 GB and < 1 TB
  if (bytes < k ** 4) return (bytes / k ** 3).toFixed(dm) + ' GB';
  // Only show TB for values >= 1 TB
  if (bytes < k ** 5) return (bytes / k ** 4).toFixed(dm) + ' TB';
  // Only show PB for values >= 1 PB
  return (bytes / k ** 5).toFixed(dm) + ' PB';
};

// Format bytes per second to human readable format
export const formatBytesPerSecond = (bps, decimals = 2) => {
  if (bps === 0) return '0 B/s';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s'];
  
  const i = Math.floor(Math.log(bps) / Math.log(k));
  
  return parseFloat((bps / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Format percentage
export const formatPercent = (value, decimals = 1) => {
  return value.toFixed(decimals) + '%';
};

// Format timestamp
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString();
};

// Format relative time
export const formatRelativeTime = (timestamp) => {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// Get status color based on percentage
export const getStatusColor = (percent) => {
  if (percent >= 90) return 'danger';
  if (percent >= 75) return 'accent3';
  if (percent >= 50) return 'accent2';
  return 'success';
};

// Calculate delta between two values
export const calculateDelta = (current, previous) => {
  if (!previous) return 0;
  return current - previous;
};

// Format number with commas
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
