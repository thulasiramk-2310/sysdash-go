import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Settings } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DraggableCard from './components/DraggableCard';
import CpuChart from './components/CpuChart';
import MemoryChart from './components/MemoryChart';
import DiskChart from './components/DiskChart';
import NetworkChart from './components/NetworkChart';
import GpuChart from './components/GpuChart';
import ProcessTable from './components/ProcessTable';
import AlertsList from './components/AlertsList';
import SettingsPanel from './components/SettingsPanel';
import useMetricsStore from './hooks/useMetricsStore';
import useSettingsStore from './hooks/useSettingsStore';
import useWebSocket from './hooks/useWebSocket';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState(null);
  const { currentMetrics, metricsHistory, clearAlerts } = useMetricsStore();
  const { theme, enabledMetrics, exportConfig, setMetricEnabled } = useSettingsStore();

  const chartHeightClass = 'h-64 md:h-80'; // Increased chart height for full visibility
  const metricOrder = ['cpu','memory','disk','network','gpu','processes','alerts'];

  const renderMetricCard = (metricId) => {
    switch (metricId) {
      case 'cpu':
        return (
          <div className={`${chartHeightClass} w-full`} style={{overflow: 'visible'}}>
            <CpuChart metricsHistory={metricsHistory} />
          </div>
        );
      case 'memory':
        return (
          <div className={`${chartHeightClass} w-full flex items-center justify-center`}>
            <MemoryChart currentMetrics={currentMetrics} />
          </div>
        );
      case 'disk':
        return (
          <div className={`${chartHeightClass} w-full`} style={{overflow: 'visible'}}>
            <DiskChart metricsHistory={metricsHistory} />
          </div>
        );
      case 'network':
        return (
          <div className={`w-full`} style={{height: '100%'}}>
            <NetworkChart metricsHistory={metricsHistory} />
          </div>
        );
      case 'gpu':
        return (
          <div className={`${chartHeightClass} w-full`}>
            <GpuChart metricsHistory={metricsHistory} />
          </div>
        );
      case 'processes':
        return (
          <div className="w-full">
            <ProcessTable processes={currentMetrics?.processes || []} />
          </div>
        );
      case 'alerts':
        return (
          <div className="w-full">
            <AlertsList />
          </div>
        );
      default:
        return null;
    }
  };

  // Initialize websocket connection (connects on mount)
  useWebSocket();

  const handleOpenSettings = (tab = 'general') => {
    setSettingsInitialTab(tab);
    setIsSettingsOpen(true);
  };

  const handleExport = () => {
    try {
      const config = exportConfig();
      const blob = new Blob([config], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sysdash-config-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const handleAlertsClick = () => {
    // Clear notifications and ensure alerts card is enabled and scroll into view
    clearAlerts();
    setMetricEnabled('alerts', true);
    setTimeout(() => {
      const el = document.getElementById('card-alerts');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  };

  return (
    <div className={`flex h-screen ${'bg-bg'} overflow-hidden`}>
      <Sidebar onOpenSettings={handleOpenSettings} onExport={handleExport} onOpenAlerts={handleAlertsClick} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-accent1 text-bg rounded-md hover:bg-accent1/90 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Customize Dashboard</span>
            </button>
          </div>
          <div className="max-w-full mx-auto">
            <DragDropContext onDragEnd={() => {}}>
              <Droppable droppableId="dashboard-grid" direction="horizontal">
                {(provided) => (
                  <div
                    className="dashboard-grid grid grid-cols-1 md:grid-cols-2 gap-6"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {metricOrder.filter(id => !!enabledMetrics[id]).map((id, index) => (
                      <Draggable key={id} draggableId={id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="card-cell min-h-0"
                            id={`card-${id}`}
                          >
                            <DraggableCard
                              title={id}
                              isDragging={snapshot.isDragging}
                              dragHandleProps={provided.dragHandleProps}
                            >
                              {renderMetricCard(id)}
                            </DraggableCard>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </main>
      </div>

      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} initialTab={settingsInitialTab || 'metrics'} />
    </div>
  );
}

export default App;

