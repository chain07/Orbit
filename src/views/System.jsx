import React, { useContext, useState, useMemo } from 'react';
import { StorageContext } from '../context/StorageContext';
import { Glass } from '../components/ui/Glass';
import { MetricBuilder } from '../components/system/MetricBuilder';
import { DataManagement } from '../components/system/DataManagement';
import SegmentedControl from '../components/ui/SegmentedControl';
import { Icons } from '../components/ui/Icons';
import { OrbitButton } from '../components/ui/OrbitButton';
import '../styles/index.css';

// Widget descriptions for Helper Text
const WIDGET_DESCRIPTIONS = {
  "Ring Progress": "Visualizes progress towards a daily numeric goal.",
  "Sparkline Trend": "Shows the trajectory of values over the last 7 days.",
  "Consistency Grid": "Heatmap tracking for daily habits and completion.",
  "Stacked Bar": "Breaks down total activity by category.",
  "Simple Number": "Displays the raw total or latest value.",
  "Streak Counter": "Highlights consecutive days of activity.",
  "History Log": "A chronological list of all entries."
};

export const System = ({ onNavigate }) => {
  const {
    metrics,
    addMetric,
    updateMetric,
    logEntries,
    addLogEntry
  } = useContext(StorageContext);

  const [viewMode, setViewMode] = useState('Metrics'); // 'Metrics' | 'Settings'
  const [isDebugMode, setIsDebugMode] = useState(false);

  // Metric Management State
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingMetric, setEditingMetric] = useState(null);

  // Unified List Logic (From Remediation Branch - UI Polish)
  const unifiedList = useMemo(() => {
    return metrics.map(m => ({
      ...m,
      isMetric: true,
      category: 'Metric',
      title: m.name,
      icon: getTypeIcon(m.type)
    }));
  }, [metrics]);

  // Handler Functions (From Main Branch - Security Fixes)
  const handleEditMetric = (metric) => {
    setEditingMetric(metric);
    setShowBuilder(true);
  };

  const handleAddMetric = () => {
    setEditingMetric(null);
    setShowBuilder(true);
  };

  const handleSaveMetric = (metric) => {
    if (!metric.id) {
      // Secure ID generation from incoming branch
      metric.id = metric.label.toLowerCase().replace(/\s+/g, '_') + '_' + Math.random().toString(36).substr(2, 5);
    }
    
    if (editingMetric) updateMetric(metric);
    else addMetric(metric);
    setShowBuilder(false);
  };

  const seedTestData = () => {
    if (!confirm("Inject random test data? This will affect your stats.")) return;
    
    const now = new Date();
    metrics.forEach(m => {
      for(let i=0; i<7; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const val = m.type === 'boolean' ? Math.random() > 0.5 : Math.floor(Math.random() * 10);
        
        addLogEntry({
          metricId: m.id,
          value: val,
          timestamp: date.toISOString()
        });
      }
    });
    alert("Test data seeded.");
  };

  const exportArchive = () => {
    const archive = {
      timestamp: new Date().toISOString(),
      metrics,
      logs: logEntries
    };
    const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orbit-debug-archive.json';
    a.click();
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-32 fade-in">
      
      {/* Header */}
      <div className="view-header-stack">
        <div className="flex flex-col gap-0">
          <h1 className="text-3xl font-extrabold tracking-tight leading-none">System</h1>
          <p className="text-secondary font-medium system-subheader mt-0">Configuration</p>
        </div>

        <SegmentedControl
          options={['Metrics', 'Settings']}
          value={viewMode}
          onChange={setViewMode}
          className="mt-4"
        />
      </div>

      {/* --- METRICS VIEW --- */}
      {viewMode === 'Metrics' && (
        <div className="flex flex-col gap-4">
          <OrbitButton 
            onClick={handleAddMetric}
            variant="primary"
            className="w-full"
            icon={<span className="text-xl leading-none">+</span>}
          >
            Add New Metric
          </OrbitButton>

          {metrics.length === 0 ? (
            <Glass className="flex flex-col items-center justify-center p-8 text-center gap-3 opacity-80">
              <div className="w-12 h-12 rounded-full bg-separator/20 flex items-center justify-center mb-1">
                <Icons.Activity size={24} className="text-secondary" />
              </div>
              <div className="w-full text-center">
                <div className="font-bold text-lg">No Metrics</div>
                <div className="text-secondary text-sm max-w-[200px] mx-auto leading-relaxed">
                  Create your first metric to start tracking your data.
                </div>
              </div>
            </Glass>
          ) : (
            <Glass className="p-2">
              <div className="flex flex-col gap-2">
                {unifiedList.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleEditMetric(item)}
                    className="p-3 rounded-xl border border-separator bg-card flex justify-between items-center cursor-pointer active:scale-[0.99] transition-transform hover:bg-bg-color/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg bg-bg-color text-blue">
                         {item.icon}
                      </div>
                      <div>
                        <div className="font-bold text-primary">{item.title}</div>
                        <div className="text-xs text-secondary flex items-center gap-1">
                          {item.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-secondary opacity-30">
                      <Icons.ChevronRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </Glass>
          )}
        </div>
      )}

      {/* --- SETTINGS VIEW --- */}
      {viewMode === 'Settings' && (
        <div className="flex flex-col gap-6 animate-fade-in">
            <DataManagement />

            <Glass className="p-0 overflow-hidden">
                <div className="font-bold text-lg p-4 border-b border-separator/50">App Preferences</div>
                <div className="flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b border-separator/50">
                        <span className="font-medium">Notifications</span>
                        <div className="w-10 h-6 bg-separator/30 rounded-full relative">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-4 border-b border-separator/50">
                        <span className="font-medium">Haptics</span>
                        <div className="w-10 h-6 bg-green rounded-full relative">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-4">
                        <span className="font-medium">Developer Mode</span>
                        <button 
                            onClick={() => setIsDebugMode(!isDebugMode)}
                            className={`w-10 h-6 rounded-full relative transition-colors ${isDebugMode ? 'bg-blue' : 'bg-separator/30'}`}
                        >
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isDebugMode ? 'right-1' : 'left-1'}`}></div>
                        </button>
                    </div>
                </div>
            </Glass>

            {isDebugMode && (
                <Glass className="p-4 border-l-4 border-orange">
                    <div className="text-xs font-bold text-orange uppercase tracking-wide mb-3">Developer Tools</div>
                    <div className="flex gap-2">
                        <OrbitButton onClick={seedTestData} variant="secondary" className="flex-1 !text-xs">Seed Test Data</OrbitButton>
                        <OrbitButton onClick={exportArchive} variant="secondary" className="flex-1 !text-xs">Export Debug Archive</OrbitButton>
                    </div>
                </Glass>
            )}

            <div className="text-center text-xs text-secondary mt-8">
                ORBIT v1.1.0 • Liquid Native
            </div>
        </div>
      )}

      {showBuilder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <MetricBuilder 
            metric={editingMetric} 
            onSave={handleSaveMetric} 
            onCancel={() => setShowBuilder(false)} 
          />
        </div>
      )}
    </div>
  );
};

const getTypeIcon = (type) => {
  switch(type) {
    case 'number': return '#';
    case 'boolean': return '✓';
    case 'duration': return '⏱';
    case 'range': return '↔';
    case 'select': return '☰';
    case 'text': return 'Aa';
    default: return '?';
  }
};