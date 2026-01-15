import React, { useContext, useState, useMemo } from 'react';
import { StorageContext } from '../context/StorageContext';
import { WidgetEngine } from '../engine/WidgetEngine';
import { HorizonAgent } from '../lib/horizonAgent';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Glass } from '../components/ui/Glass';
import { getWidgetComponent } from '../components/widgets/WidgetRegistry';
import '../styles/motion.css';

export const Horizon = () => {
  const { metrics, logEntries } = useContext(StorageContext);

  // State
  const [segment, setSegment] = useState('Weekly');
  const [isEditing, setIsEditing] = useState(false); // Edit Layout Mode
  const segments = ['Daily', 'Weekly', 'Monthly'];

  // 1. Hero Data (Date & Greeting)
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // 2. Horizon Agent Insights
  // Flatten the insights object into an array and take top 2 high-priority ones
  const topInsights = useMemo(() => {
    const allInsights = HorizonAgent.generateAllInsights(metrics, logEntries);
    const flattened = Object.values(allInsights).flat();
    // Simple heuristic: Prioritize 'streak' or 'trend' types for the dashboard
    return flattened
      .sort((a, b) => {
        if (a.type === 'streak') return -1;
        if (b.type === 'streak') return 1;
        return 0;
      })
      .slice(0, 2);
  }, [metrics, logEntries]);

  // 3. Widget Generation
  const widgets = useMemo(() => {
    return WidgetEngine.generateWidgets 
      ? WidgetEngine.generateWidgets(metrics, logEntries, segment) 
      : [];
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
            onClick={() => setIsEditing(!isEditing)}
            className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors ${
              isEditing 
                ? 'bg-blue text-white border-blue' 
                : 'border-separator text-secondary'
            }`}
          >
            {isEditing ? 'Done' : 'Edit Layout'}
          </button>
        </div>
      </div>

      {/* HORIZON AGENT INSIGHTS */}
      {topInsights.length > 0 && (
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
      <div className="widget-grid">
        {widgets.map((widget, idx) => {
          const WidgetComponent = getWidgetComponent(widget.type);
          
          return (
            <Glass key={widget.id || idx} className={`relative ${isEditing ? 'animate-pulse ring-1 ring-blue' : ''}`}>
              {isEditing && (
                <div className="absolute top-2 right-2 text-xs bg-bg-color px-2 py-1 rounded-full text-secondary z-10">
                  Drag
                </div>
              )}
              <WidgetComponent data={widget.data} />
            </Glass>
          );
        })}
        
        {/* Empty State / Onboarding Hint */}
        {widgets.length === 0 && (
          <Glass className="p-6 flex flex-col items-center justify-center text-center gap-2 text-secondary opacity-60 dashed-border">
            <div className="text-2xl">⊕</div>
            <div className="text-sm font-bold">No widgets active</div>
            <div className="text-xs">Add metrics in System tab</div>
          </Glass>
        )}
      </div>
    </div>
  );
};
