import { useState, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { formatBytes } from '../utils/format';

const ProcessTable = ({ processes = [] }) => {
  const [sortField, setSortField] = useState('cpu');
  const [sortDirection, setSortDirection] = useState('desc');
  
  const sortedProcesses = useMemo(() => {
    if (!processes || processes.length === 0) return [];
    
    return [...processes].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'name') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [processes, sortField, sortDirection]);
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4" /> : 
      <ArrowDown className="w-4 h-4" />;
  };
  
  const Row = ({ index, style }) => {
    const process = sortedProcesses[index];
    const isEven = index % 2 === 0;
    
    return (
      <div 
        style={style} 
        className={`flex items-center px-4 ${isEven ? 'bg-surface/50' : 'bg-transparent'} hover:bg-accent1/10 transition-colors`}
      >
        <div className="w-20 text-sub text-sm font-mono">{process.pid}</div>
        <div className="flex-1 text-text text-sm font-medium truncate">{process.name}</div>
        <div className="w-24 text-right">
          <span className={`text-sm font-semibold ${
            process.cpu > 50 ? 'text-danger' : 
            process.cpu > 25 ? 'text-accent3' : 
            'text-success'
          }`}>
            {process.cpu.toFixed(1)}%
          </span>
        </div>
        <div className="w-32 text-right text-sub text-sm">
          {formatBytes(process.memory)}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-surface rounded-2xl border border-accent1/20 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-sub/20 bg-bg/50">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => handleSort('pid')}
            className="w-20 flex items-center gap-1 text-sub text-xs font-semibold uppercase tracking-wide hover:text-text transition-colors"
          >
            PID
            <SortIcon field="pid" />
          </button>
          <button
            onClick={() => handleSort('name')}
            className="flex-1 flex items-center gap-1 text-sub text-xs font-semibold uppercase tracking-wide hover:text-text transition-colors"
          >
            Process
            <SortIcon field="name" />
          </button>
          <button
            onClick={() => handleSort('cpu')}
            className="w-24 flex items-center justify-end gap-1 text-sub text-xs font-semibold uppercase tracking-wide hover:text-text transition-colors"
          >
            CPU
            <SortIcon field="cpu" />
          </button>
          <button
            onClick={() => handleSort('memory')}
            className="w-32 flex items-center justify-end gap-1 text-sub text-xs font-semibold uppercase tracking-wide hover:text-text transition-colors"
          >
            Memory
            <SortIcon field="memory" />
          </button>
        </div>
      </div>
      
      {/* Table body */}
      <div className="h-96">
        {sortedProcesses.length > 0 ? (
          <List
            height={384}
            itemCount={sortedProcesses.length}
            itemSize={48}
            width="100%"
          >
            {Row}
          </List>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sub text-sm">No processes data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessTable;
