// Downsample data points for better performance
export const downsample = (data, maxPoints = 60) => {
  if (!data || data.length <= maxPoints) return data;
  
  const step = Math.ceil(data.length / maxPoints);
  const downsampled = [];
  
  for (let i = 0; i < data.length; i += step) {
    const chunk = data.slice(i, i + step);
    const avg = chunk.reduce((sum, val) => sum + val, 0) / chunk.length;
    downsampled.push(avg);
  }
  
  return downsampled;
};

// Largest Triangle Three Buckets (LTTB) algorithm for better downsampling
export const lttbDownsample = (data, threshold = 60) => {
  if (!data || data.length <= threshold) return data;
  
  const sampled = [];
  const bucketSize = (data.length - 2) / (threshold - 2);
  
  sampled.push(data[0]); // Always keep first point
  
  for (let i = 0; i < threshold - 2; i++) {
    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
    const avgRangeLength = avgRangeEnd - avgRangeStart;
    
    let avgX = 0;
    let avgY = 0;
    
    for (let j = avgRangeStart; j < avgRangeEnd; j++) {
      avgX += j;
      avgY += data[j];
    }
    avgX /= avgRangeLength;
    avgY /= avgRangeLength;
    
    const rangeStart = Math.floor(i * bucketSize) + 1;
    const rangeEnd = Math.floor((i + 1) * bucketSize) + 1;
    
    let maxArea = -1;
    let maxAreaPoint = null;
    const pointAX = i;
    const pointAY = sampled[sampled.length - 1];
    
    for (let j = rangeStart; j < rangeEnd; j++) {
      const area = Math.abs(
        (pointAX - avgX) * (data[j] - pointAY) -
        (pointAX - j) * (avgY - pointAY)
      ) * 0.5;
      
      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = data[j];
      }
    }
    
    sampled.push(maxAreaPoint);
  }
  
  sampled.push(data[data.length - 1]); // Always keep last point
  
  return sampled;
};

// Simple moving average
export const movingAverage = (data, windowSize = 5) => {
  if (!data || data.length < windowSize) return data;
  
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = data.slice(start, i + 1);
    const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
    result.push(avg);
  }
  
  return result;
};
