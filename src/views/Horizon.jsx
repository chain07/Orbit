import React, { useContext, useState, useMemo } from 'react';
import { StorageContext } from '../context/StorageContext';
import { WidgetEngine } from '../engine/WidgetEngine';
import { HorizonAgent } from '../lib/horizonAgent';
import SegmentedControl from '../components/ui/SegmentedControl';
import { Glass } from '../components/ui/Glass.jsx'; // Audit Fix: Added .jsx extension
import { getWidgetComponent } from '../components/widgets/WidgetRegistry';
import { EditLayoutModal } from '../components/modals/EditLayoutModal'; // Audit Fix: Integrated Modal
import '../styles/motion.css';

// Audit Fix: Simple Error Boundary for Widget Rendering Failures
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

  // State
  const [segment, setSegment] = useState('Weekly');
  const [isEditing, setIsEditing] = useState(false); // Controls Modal
  const segments = ['Daily', 'Weekly', 'Monthly'];

  // 1. Hero Data
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // 2. Horizon Agent Insights
  // Audit Fix: Robust null checks and error handling
  const topInsights = useMemo(() => {
    if (!metrics || !logEntries || !HorizonAgent || !HorizonAgent.generateAllInsights) {
      return [];
    }

    try {
      const allInsights = HorizonAgent.generateAllInsights(metrics, logEntries);
      if (!allInsights) return [];

      const flattened = Object.values(allInsights).flat();
      
      // Simple heuristic: Prioritize 'streak' or 'trend' types
      return flattened
        .sort((a, b) => {
          if (a.type === 'streak') return -1;
          if (b.type === 'streak') return 1;
          return 0;
        })
        .slice(0, 2);
    } catch (e) {
      console.warn("Horizon Agent failed to generate insights:", e);
      return [];
    }
  }, [metrics, logEntries]);

  // 3. Widget Generation
  const widgets = useMemo(() => {
    try {
      return WidgetEngine.generateWidgets 
        ? WidgetEngine.generateWidgets(metrics, logEntries, segment) 
        : [];
    } catch (e) {
      console.error("Widget generation failed:", e);
      return [];
    }
  }, [metrics, logEntries, segment]);

  return (
    <div className="flex flex-col gap-6 p-4 pb-32 fade-in">
      
      {/* HERO SECTION */}
      <div className="flex flex-col gap-1 mt-2">
        <div className="text-xs font-bold text-secondary uppercase tracking-wide">
          {todayDate}
        </div>
        <div className="flex justify-between items-end">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">
            Hi, Captain.
          </h1>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-xs font-bold px-3 py-1 rounded-full border border-separator text-secondary hover:bg-bg-color hover:text-primary transition-colors"
          >
            Edit Layout
          </button>
        </div>
      </div>

      {/* HORIZON AGENT INSIGHTS */}
      {/* Audit Fix: Added null check before mapping */}
      {topInsights && topInsights.length > 0 && (
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

      {/* CONTROLS */}
      <SegmentedControl
        options={segments.map(s => ({ label: s, value: s }))}
        value={segment}
        onChange={setSegment}
      />

      {/* WIDGET GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {widgets.map((widget, idx) => {
          const WidgetComponent = getWidgetComponent(widget.type);
          
          return (
            <Glass key={widget.id || idx} className="relative overflow-hidden">
               {/* Audit Fix: Error Boundary wrapper */}
               <WidgetErrorBoundary>
                 <WidgetComponent data={widget.data} title={widget.title} />
               </WidgetErrorBoundary>
            </Glass>
          );
        })}
        
        {/* Empty State / Onboarding Hint */}
        {widgets.length === 0 && (
          <Glass className="p-6 flex flex-col items-center justify-center text-center gap-2 text-secondary opacity-60 dashed-border col-span-full">
            <div className="text-2xl">⊕</div>
            <div className="text-sm font-bold">No widgets active</div>
            <div className="text-xs">Add metrics in System tab</div>
          </Glass>
        )}
      </div>

      {/* EDIT LAYOUT MODAL */}
      <EditLayoutModal 
        isOpen={isEditing} 
        onClose={() => setIsEditing(false)} 
      />
    </div>
  );
};
