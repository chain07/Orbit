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
import { OrbitButton } from '../components/ui/OrbitButton';
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
  const { metrics, logEntries, onboardingComplete, resetOnboarding } = useContext(StorageContext);
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
            {new Date().getHours() < 12 ? 'Good Morning,' : new Date().getHours() < 18 ? 'Good Afternoon,' : 'Good Evening,'}
          </h1>
          {hasMetrics && (
            <OrbitButton
              onClick={() => setIsEditing(true)}
              variant="secondary"
              className="!w-auto !h-9 !px-4 !text-xs"
            >
              Edit Layout
            </OrbitButton>
          )}
        </div>
      </div>

      {!hasMetrics && (
        <div className="flex flex-col gap-4">
          <Glass className="p-4 border-l-4 border-purple/50">
             <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-purple/70">
                   <Icons.Sparkles size={16} />
                   <span className="text-xs font-bold uppercase tracking-wider">Horizon Agent</span>
                </div>
                <p className="text-secondary text-sm leading-relaxed">
                  I am your Horizon Agent. I work privately on your device to uncover patterns in your habits. Once you start logging, I'll reveal trends, momentum shifts, and correlations to help you optimize your routine.
                </p>
             </div>
          </Glass>

          {!onboardingComplete && (
            <OrbitButton
              onClick={resetOnboarding}
              variant="primary"
              className="w-full"
            >
              Launch Setup
            </OrbitButton>
          )}
        </div>
      )}

      {showNudge && (
          <Glass
            className="relative mb-6"
            style={{
              background: 'linear-gradient(to right, rgba(0,122,255,0.1), rgba(175,82,222,0.1))',
              borderColor: 'rgba(0,122,255,0.2)'
            }}
          >
              <OrbitButton
                  onClick={() => setIsNudgeDismissed(true)}
                  variant="secondary"
                  className="absolute top-2 right-2 !w-8 !h-8 !p-0"
                  icon={<Icons.X size={14} />}
              />
              <div className="flex justify-between items-center pr-6">
                  <div>
                      <div className="font-bold text-blue">Complete Your Orbit</div>
                      <div className="text-xs text-secondary mt-1">Add at least 3 metrics and 1 goal for better insights.</div>
                  </div>
                  <OrbitButton
                    onClick={() => setActiveTab('System')}
                    variant="primary"
                    className="!w-auto !h-8 !px-4 !text-xs"
                  >
                      Setup
                  </OrbitButton>
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
