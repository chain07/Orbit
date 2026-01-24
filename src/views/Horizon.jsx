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
import UpdateManager from '../components/system/UpdateManager';
import { OnboardingWizard } from '../components/system/OnboardingWizard';
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
  const { metrics, logEntries, allLogs, onboardingComplete } = useContext(StorageContext);
  const { setActiveTab } = useContext(NavigationContext);
  const [segment, setSegment] = useState('Weekly');
  const [isEditing, setIsEditing] = useState(false);
  const [isNudgeDismissed, setIsNudgeDismissed] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  
  const todayDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning.';
    if (hour < 18) return 'Good Afternoon.';
    if (hour < 21) return 'Good Evening.';
    return 'Good Night.';
  }, []);

  const topInsights = useMemo(() => {
    if (!HorizonAgent || !HorizonAgent.generateAllInsights) return [];
    try {
      const allInsights = HorizonAgent.generateAllInsights(metrics, allLogs);
      return Object.values(allInsights || {}).flat()
        .filter(i => i.context === 'tactical')
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
        .slice(0, 3);
    } catch (e) {
      return [];
    }
  }, [metrics, allLogs]);

  const widgets = useMemo(() => {
    try {
      return WidgetDataEngine.generateWidgets
        ? WidgetDataEngine.generateWidgets(metrics, allLogs, segment)
        : [];
    } catch (e) {
      return [];
    }
  }, [metrics, allLogs, segment]);

  const hasMetrics = metrics && metrics.length > 0;

  const showNudge = useMemo(() => {
      if (!hasMetrics) return false;
      if (isNudgeDismissed) return false;

      const metricCount = metrics.length;
      const hasGoal = metrics.some(m => m.goal !== null && m.goal !== undefined && m.goal > 0);

      return metricCount < 3 || !hasGoal;
  }, [metrics, hasMetrics, isNudgeDismissed]);

  return (
    <div className="layout-padding fade-in">
      
      {/* Header - Fixed Gap */}
      <div className="view-header-stack">
        <div className="text-xs font-bold text-secondary uppercase tracking-wide">
          {todayDate}
        </div>
        <div className="flex justify-between items-end">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">
            {greeting}
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

      <div className="layout-content">
        <UpdateManager />

        {!hasMetrics && (
          <EmptyState
            icon={null}
            title="Welcome to ORBIT"
            message="Your dashboard is empty. Configure your first metric to start tracking."
            actionLabel={showWizard ? "Close Setup" : "Launch Setup"}
            onAction={() => setShowWizard(!showWizard)}
          />
        )}

        {showWizard && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 animate-fade-in">
            <div className="w-full max-w-lg h-[600px] relative">
               <OnboardingWizard onComplete={() => setShowWizard(false)} />
            </div>
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

        <Glass className="p-4 border-l-4 border-blue mb-4">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-bold text-blue uppercase tracking-wider flex items-center gap-2">
              <Icons.Activity className="text-blue" size={14} /> DAILY BRIEFING
            </div>
            <div className="text-secondary text-sm leading-relaxed">
              {hasMetrics && topInsights.length > 0 ? (
                topInsights.map((insight, idx) => (
                  <div key={idx} className="mb-1">
                    {insight.message}
                  </div>
                ))
              ) : (
                "Good morning. I'll scan your data for actionable tactical moves and insights once you start logging. For now, try adding a few metrics to get started."
              )}
            </div>
          </div>
        </Glass>

        {hasMetrics && (
          <>
            <SegmentedControl
              options={['Daily', 'Weekly', 'Monthly'].map(s => ({ label: s, value: s }))}
              value={segment}
              onChange={setSegment}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {widgets.map((widget, idx) => {
                const WidgetComponent = getWidgetComponent(widget.widgetType);
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
    </div>
  );
};
