import { motion } from 'framer-motion';
import { GripVertical, Maximize2, Minimize2, X } from 'lucide-react';
import { useState } from 'react';


const DraggableCard = ({ 
  children, 
  title, 
  onRemove,
  isDragging,
  dragHandleProps = {},
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Expanded: fullscreen overlay
  const expandedStyle = isExpanded
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: 'rgba(18,24,38,0.98)',
        borderRadius: 0,
        boxShadow: '0 2px 24px rgba(11,12,20,0.45)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }
    : {};

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`draggable-card premium-card flex flex-col h-full overflow-hidden ${
        isDragging ? 'shadow-glow opacity-80' : ''
      } ${className}`}
      style={expandedStyle}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between p-3 border-b border-line/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Drag handle for react-beautiful-dnd */}
          <span className="drag-handle" {...dragHandleProps} style={{display: 'flex', alignItems: 'center'}}>
            <GripVertical className="w-5 h-5 text-sub cursor-grab active:cursor-grabbing" />
          </span>
          <h3 className="text-sub font-medium text-[11px] uppercase tracking-[0.16em]">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-line/[0.06] rounded-lg transition-colors"
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4 text-sub" />
            ) : (
              <Maximize2 className="w-4 h-4 text-sub" />
            )}
          </button>
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1.5 hover:bg-danger/20 rounded-lg transition-colors"
              title="Remove"
            >
              <X className="w-4 h-4 text-danger" />
            </button>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div
        className={`card-body flex-1 ${isExpanded ? 'overflow-auto' : 'overflow-visible'}`}
        style={isExpanded ? {height: '100%', minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'} : {}}
      >
        <div style={isExpanded ? {width: '100%', height: '100%'} : {}}>
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default DraggableCard;
