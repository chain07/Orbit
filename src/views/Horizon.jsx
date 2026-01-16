import React, { useContext, useState, useMemo } from 'react';
import { StorageContext } from '../context/StorageContext';
import { WidgetEngine } from '../engine/WidgetEngine';
import { HorizonAgent } from '../lib/horizonAgent';
import SegmentedControl from '../components/ui/SegmentedControl';
import Glass from '../components/ui/Glass'; // Fixed Import path
import { getWidgetComponent } from '../components/widgets/WidgetRegistry';
import { EditLayoutModal } from '../components/horizon/EditLayoutModal'; // Fixed path
import { EmptyState } from '../components/ui/EmptyState'; // New Component
import '../styles/motion.css';

// ... (WidgetErrorBoundary class remains the same) ...
class WidgetErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Widget Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full min-h-[100px] p-4 bg-red-500/5 rounded-xl border border-red-500/10">
          <div className="text-xs text-red-500 font-medium">Widget Error</div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const Horizon = () => {
  const { metrics, logEntries } = useContext(StorageContext);
  const [segment, setSegment] = useState('Weekly');
  const [isEditing, setIsEditing] = useState(false);
  
  // Date Header
  const todayDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  // Insights Logic
  const topInsights = useMemo(() => {
    if (!HorizonAgent || !HorizonAgent.generateAllInsights) return [];
    try {
      const allInsights = HorizonAgent.generateAllInsights(metrics, logEntries);
      return Object.values(allInsights || {}).flat()
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
        .slice(0, 2);
    } catch (e) {
      return [];
    }
  }, [metrics, logEntries]);

  // Widget Logic
  const widgets = useMemo(() => {
    try {
      return WidgetEngine.generateWidgets 
        ? WidgetEngine.generateWidgets(metrics, logEntries, segment)
        : [];
    } catch (e) {
      return [];
    }
  }, [metrics, logEntries, segment]);

  // --- ZERO STATE LOGIC ---
  // If no metrics exist, we assume the user is new or wiped data.
  const hasMetrics = metrics && metrics.length > 0;

  return (
    <div className="flex flex-col gap-6 p-4 pb-32 fade-in">
      
      {/* Header */}
      <div className="flex flex-col gap-1 mt-2">
        <div className="text-xs font-bold text-secondary uppercase tracking-wide">
          {todayDate}
        </div>
        <div className="flex justify-between items-end">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">
            Hi, Captain.
          </h1>
          {hasMetrics && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold px-3 py-1 rounded-full border border-separator text-secondary hover:bg-bg-color hover:text-primary transition-colors active:scale-95"
            >
              Edit Layout
            </button>
          )}
        </div>
      </div>

      {/* ZERO STATE: No Metrics */}
      {!hasMetrics && (
        <EmptyState 
          icon="🚀"
          title="Welcome to ORBIT"
          message="Your dashboard is empty. Configure your first metric to start tracking."
          actionLabel="Launch Setup"
          onAction={() => document.getElementById('tab-System')?.click()} // Simple hack to switch tabs, ideally use Context
        />
      )}

      {/* Insights (Only show if we have them) */}
      {hasMetrics && topInsights.length > 0 && (
        <Glass className="p-4 border-l-4 border-blue">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-bold text-blue uppercase tracking-wider flex items-center gap-2">
              <span>✦</span> Horizon Agent
            </div>
            {topInsights.map((insight, idx) => (
              <div key={idx} className="text-sm font-medium leading-relaxed">
                {insight.message}
              </div>
            ))}
          </div>
        </Glass>
      )}

      {/* Main Content */}
      {hasMetrics && (
        <>
          <SegmentedControl
            options={['Daily', 'Weekly', 'Monthly'].map(s => ({ label: s, value: s }))}
            value={segment}
            onChange={setSegment}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {widgets.map((widget, idx) => {
              const WidgetComponent = getWidgetComponent(widget.type);
              return (
                <Glass key={widget.id || idx} className="relative overflow-hidden">
                   <WidgetErrorBoundary>
                     <WidgetComponent data={widget.data} title={widget.title} />
                   </WidgetErrorBoundary>
                </Glass>
              );
            })}
          </div>
        </>
      )}

      <EditLayoutModal 
        isOpen={isEditing} 
        onClose={() => setIsEditing(false)} 
      />
    </div>
  );
};
