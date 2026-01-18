import React, { useContext, useState, useMemo } from 'react';
import { StorageContext } from '../context/StorageContext';
import { NavigationContext } from '../context/NavigationContext';
import { WidgetDataEngine } from '../engine/WidgetDataEngine';
import { HorizonAgent } from '../lib/horizonAgent';
import SegmentedControl from '../components/ui/SegmentedControl';
import Glass from '../components/ui/Glass';
import { getWidgetComponent } from '../components/widgets/WidgetRegistry';
import { EditLayoutModal } from '../components/horizon/EditLayoutModal';
import { EmptyState } from '../components/ui/EmptyState';
import { Icons } from '../components/ui/Icons';
import '../styles/motion.css';

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
  const { metrics, logEntries, onboardingComplete } = useContext(StorageContext);
  const { setActiveTab } = useContext(NavigationContext);
  const [segment, setSegment] = useState('Weekly');
  const [isEditing, setIsEditing] = useState(false);
  const [isNudgeDismissed, setIsNudgeDismissed] = useState(false);
  
  const todayDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

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

  const widgets = useMemo(() => {
    try {
      return WidgetDataEngine.generateWidgets
        ? WidgetDataEngine.generateWidgets(metrics, logEntries, segment)
        : [];
    } catch (e) {
      return [];
    }
  }, [metrics, logEntries, segment]);

  const hasMetrics = metrics && metrics.length > 0;

  const showNudge = useMemo(() => {
      if (!hasMetrics) return false;
      if (isNudgeDismissed) return false;

      const metricCount = metrics.length;
      const hasGoal = metrics.some(m => m.goal !== null && m.goal !== undefined && m.goal > 0);

      return metricCount < 3 || !hasGoal;
  }, [metrics, hasMetrics, isNudgeDismissed]);

  return (
    <div className="flex flex-col gap-6 p-4 pb-32 fade-in">
      
      {/* Header - Fixed Gap */}
      <div className="flex flex-col gap-0 safe-pt">
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
              className="btn-secondary h-8 min-h-[32px] px-3 text-xs"
            >
              Edit Layout
            </button>
          )}
        </div>
      </div>

      {!hasMetrics && (
        <EmptyState 
          icon="🚀"
          title="Welcome to ORBIT"
          message="Your dashboard is empty. Configure your first metric to start tracking."
          actionLabel="Launch Setup"
          onAction={() => setActiveTab('System')}
        />
      )}

      {showNudge && (
          <Glass
            className="relative mb-6"
            style={{
              background: 'linear-gradient(to right, rgba(0,122,255,0.1), rgba(175,82,222,0.1))',
              borderColor: 'rgba(0,122,255,0.2)'
            }}
          >
              <button
                  onClick={() => setIsNudgeDismissed(true)}
                  className="absolute top-2 right-2 p-1 text-secondary hover:text-primary transition-colors"
              >
                  <Icons.X size={14} />
              </button>
              <div className="flex justify-between items-center pr-6">
                  <div>
                      <div className="font-bold text-blue">Complete Your Orbit</div>
                      <div className="text-xs text-secondary mt-1">Add at least 3 metrics and 1 goal for better insights.</div>
                  </div>
                  <button
                    onClick={() => setActiveTab('System')}
                    className="px-3 py-2 bg-blue text-white text-xs font-bold rounded-lg shadow-sm active:scale-95 transition-transform"
                  >
                      Setup
                  </button>
              </div>
          </Glass>
      )}

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
