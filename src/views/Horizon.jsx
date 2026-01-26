import React, { useContext, useState, useMemo, useEffect } from 'react';
import { StorageContext } from '../context/StorageContext';
import { NavigationContext } from '../context/NavigationContext';
import { WidgetDataEngine } from '../engine/WidgetDataEngine';
import { HorizonAgent } from '../lib/horizonAgent';
import Glass from '../components/ui/Glass';
import { getWidgetComponent } from '../components/widgets/WidgetRegistry';
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
  const { metrics, logEntries, allLogs, updateWidgetLayout, widgetLayout } = useContext(StorageContext);
  const { setActiveTab } = useContext(NavigationContext);
  const [segment, setSegment] = useState('Weekly');
  const [isEditing, setIsEditing] = useState(false);
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

  const hasMetrics = metrics && metrics.length > 0;
  const [dailyMessage, setDailyMessage] = useState(null);

  // Daily Briefing Persistence
  useEffect(() => {
    if (!hasMetrics) return;

    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('dailyBriefing');

    // Check if we have a valid stored message for today
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (parsed.date === today) {
                setDailyMessage(parsed.message);
                return;
            }
        } catch (e) {
            console.error("Failed to parse daily briefing", e);
        }
    }

    // If no valid stored message, generate one
    if (HorizonAgent && HorizonAgent.generateAllInsights) {
        try {
            const allInsights = HorizonAgent.generateAllInsights(metrics, allLogs);
            const tactical = Object.values(allInsights || {}).flat()
                .filter(i => i.context === 'tactical')
                .sort((a, b) => (b.priority || 0) - (a.priority || 0));

            const msg = tactical.length > 0 ? tactical[0].message : "Good morning. Ready to track your progress today?";

            setDailyMessage(msg);
            localStorage.setItem('dailyBriefing', JSON.stringify({ date: today, message: msg }));
        } catch (e) {
            console.error("Failed to generate insights", e);
        }
    }
  }, [metrics, allLogs, hasMetrics]);

  // Merge layout order with metrics data
  const orderedWidgets = useMemo(() => {
      // Get base widgets
      const baseWidgets = WidgetDataEngine.generateWidgets(metrics, allLogs, segment);

      // Filter out widgets for metrics that no longer exist
      const validWidgets = baseWidgets.filter(w => metrics.some(m => m.id === w.id));

      // If no layout saved, return base
      const layoutOrder = widgetLayout?.Horizon;
      if (!layoutOrder || !Array.isArray(layoutOrder)) return validWidgets;

      // Map base widgets by ID for quick lookup
      const widgetMap = new Map(validWidgets.map(w => [w.id, w]));

      // Reorder based on layout
      const ordered = layoutOrder.map(id => widgetMap.get(id)).filter(Boolean);

      // Append any new metrics that aren't in the layout yet
      const processedIds = new Set(ordered.map(w => w.id));
      const remaining = validWidgets.filter(w => !processedIds.has(w.id));

      return [...ordered, ...remaining];
  }, [metrics, allLogs, segment, widgetLayout]);

  const moveWidget = (index, direction) => {
      if (!updateWidgetLayout) return;

      const newOrder = [...orderedWidgets];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= newOrder.length) return;

      // Swap
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];

      // Save ID list
      const newLayoutIds = newOrder.map(w => w.id);
      updateWidgetLayout(prev => ({ ...prev, Horizon: newLayoutIds }));
  };

  return (
    <div className="layout-padding fade-in" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      
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
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                  color: 'var(--blue)',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
              }}
            >
              {isEditing ? 'Done' : 'Edit'}
            </button>
          )}
        </div>
      </div>

      <div className="layout-content" style={{ boxSizing: 'border-box', width: '100vw', overflowX: 'hidden' }}>
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

        {!isEditing && (
            <Glass className="p-4 border-l-4 border-blue mb-4">
            <div className="flex flex-col justify-center gap-2 min-h-[80px]">
                <div className="text-xs font-bold text-blue uppercase tracking-wider flex items-center gap-2">
                <Icons.Activity className="text-blue" size={14} /> DAILY BRIEFING
                </div>
                <div className="text-md font-medium text-primary leading-relaxed">
                {dailyMessage || "Good morning. I'll scan your data for actionable tactical moves and insights once you start logging."}
                </div>
            </div>
            </Glass>
        )}

        {hasMetrics && (
          <div style={{
            display: isEditing ? 'flex' : 'grid',
            flexDirection: isEditing ? 'column' : 'initial',
            gridTemplateColumns: isEditing ? 'none' : 'repeat(2, minmax(0, 1fr))',
            gap: '16px',
            padding: '20px',
            width: '100%',
            boxSizing: 'border-box',
            overflowX: 'hidden',
            paddingBottom: '100px'
          }}>
            {orderedWidgets.map((widget, idx) => {
              const WidgetComponent = getWidgetComponent(widget.widgetType);
              const isFullWidth = ['stackedbar', 'sparkline', 'heatmap', 'progress', 'compound', 'history'].includes(widget.widgetType);

              if (isEditing) {
                  return (
                    <div
                        key={widget.id || idx}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px',
                            backgroundColor: 'var(--card-bg)',
                            marginBottom: '8px',
                            borderRadius: '12px',
                            border: '1px solid var(--separator)'
                        }}
                    >
                         <div className="flex flex-col gap-1 min-w-[120px]">
                            {/* Title */}
                            <span className="font-bold text-primary text-sm truncate">
                                {widget.label || widget.title || 'Widget'}
                            </span>
                            {/* Type Badge */}
                            <span className="text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded-full w-fit capitalize">
                                {widget.widgetType}
                            </span>
                         </div>

                        {/* Controls */}
                        <div className="flex gap-2">
                             <OrbitButton
                                variant="secondary"
                                icon={<Icons.ChevronUp size={16} />}
                                onClick={() => moveWidget(idx, -1)}
                                disabled={idx === 0}
                             />
                             <OrbitButton
                                variant="secondary"
                                icon={<Icons.ChevronDown size={16} />}
                                onClick={() => moveWidget(idx, 1)}
                                disabled={idx === orderedWidgets.length - 1}
                             />
                        </div>
                    </div>
                  );
              }

              return (
                <Glass
                  key={widget.id || idx}
                  className="relative overflow-hidden transition-transform"
                  style={{
                    gridColumn: isFullWidth ? 'span 2' : 'span 1',
                    aspectRatio: isFullWidth ? '2 / 1' : '1 / 1'
                  }}
                >
                   <WidgetErrorBoundary>
                     <WidgetComponent data={widget.data} title={widget.label || widget.name || widget.title} />
                   </WidgetErrorBoundary>
                </Glass>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
