import React, { useContext, useState, useMemo } from 'react';
import { StorageContext } from '../context/StorageContext';
import { WidgetDataEngine } from '../engine/WidgetDataEngine';
import { HorizonAgent } from '../lib/horizonAgent';
import { AnalyticsEngine } from '../engine/AnalyticsEngine';
import SegmentedControl from '../components/ui/SegmentedControl';
import Glass from '../components/ui/Glass';
import { ReportGenerator } from '../components/intel/ReportGenerator';
import { RingChart } from '../components/ui/charts/RingChart';
import { HeatMap } from '../components/ui/charts/Heatmap';
import { Sparkline } from '../components/ui/charts/Sparkline';
import { StackedBar } from '../components/ui/charts/StackedBar';
import '../styles/motion.css';

export const Intel = () => {
  const { metrics, logEntries, allLogs } = useContext(StorageContext);
  const [segment, setSegment] = useState('Daily');

  const hasData = allLogs && allLogs.length > 0;
  const segments = ['Daily', 'Weekly', 'Monthly'];

  const insights = useMemo(() => {
    if (!HorizonAgent || !HorizonAgent.generateAllInsights) return [];
    try {
      const all = HorizonAgent.generateAllInsights(metrics, allLogs, segment);
      return Object.values(all).flat();
    } catch (e) {
      console.warn("Horizon Agent failed:", e);
      return [];
    }
  }, [metrics, allLogs, segment]);

  const widgets = useMemo(() => 
    WidgetDataEngine.generateWidgets(metrics, allLogs, segment),
  [metrics, allLogs, segment]);

  const stats = useMemo(() => {
    const health = AnalyticsEngine.calculateSystemHealth(metrics, allLogs, segment);

    // Calculate Momentum (Daily Volume History for Sparkline)
    // We want the last 7 days of total activity count
    const momentumData = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];

        // Count logs for this day
        const count = allLogs.filter(l => l.timestamp.startsWith(dayStr)).length;
        momentumData.push(count);
    }

    return { ...health, momentumHistory: momentumData };
  }, [metrics, allLogs, segment]);

  const telemetrySubtitle = useMemo(() => {
    if (segment === 'Daily') return 'Today (4h Blocks)';
    if (segment === 'Weekly') return 'Last 7 Days';
    if (segment === 'Monthly') return 'Last 4 Weeks';
    return '';
  }, [segment]);

  return (
    <div className="layout-padding fade-in">
      <div className="view-header-stack">
        <h1 className="text-3xl font-extrabold tracking-tight">Intelligence</h1>
        <p className="text-secondary font-medium">Pattern and telemetry analysis.</p>
        <div className="system-toggle-wrapper">
          <SegmentedControl
            options={segments.map(s => ({ label: s, value: s }))}
            value={segment}
            onChange={setSegment}
          />
        </div>
      </div>

      <div className="layout-content flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Glass className="flex flex-col justify-center min-h-[140px] relative overflow-hidden !p-0">
            <div className="flex flex-col w-full px-5 py-4 z-10 gap-3">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-secondary uppercase tracking-wide">System Health</span>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold">{stats.reliability}%</span>
                        <div className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${stats.trend.startsWith('-') ? 'bg-red/10 text-red' : 'bg-green/10 text-green'}`}>
                            {stats.trend}
                        </div>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 bg-separator/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue transition-all duration-500"
                        style={{ width: `${stats.reliability}%` }}
                    />
                </div>
                <span className="text-xs text-secondary self-end opacity-70">Operational Baseline</span>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue opacity-5 rounded-full blur-2xl z-0"></div>
          </Glass>

          <Glass className={`flex flex-col justify-between min-h-[140px] relative overflow-hidden !p-0`}>
            {hasData ? (
              <>
                <div className="flex justify-between items-start mb-2 px-4 pt-4 z-20">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wide">Momentum</span>
                  <span className={`text-2xl font-bold font-mono ${
                     stats.intensity === 'Peak' ? 'text-red' :
                     stats.intensity === 'High' ? 'text-orange' :
                     stats.intensity === 'Moderate' ? 'text-blue' : 'text-secondary'
                   }`}>{stats.intensity}</span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-orange opacity-5 rounded-full blur-2xl"></div>
                {/* Momentum Sparkline using real history */}
                <div className="w-full h-[60px] relative mt-auto">
                   <Sparkline
                     data={stats.momentumHistory}
                     height={60}
                     showLabels={false}
                     showDots={false}
                     lineColor="rgba(255,165,0,0.5)"
                     fillColor="transparent"
                     className="w-full h-full opacity-50"
                   />
                   <div className="text-xs text-secondary text-center opacity-80 absolute bottom-2 w-full">Status: {stats.status}</div>
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-between h-full overflow-hidden relative">
                <div className="flex justify-between items-start z-10 px-4 pt-4">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wide">Momentum</span>
                  <span className="text-2xl font-bold font-mono text-zinc-400">0.0</span>
                </div>

                {/* Graph Wrapper - Force Height */}
                <div style={{ height: '60px', width: '100%', marginTop: 'auto' }}>
                  <Sparkline data={[0, 0, 0, 0, 0, 0, 0]} height={60} showLabels={false} showDots={false} lineColor="rgba(255,255,255,0.1)" fillColor="transparent" className="w-full h-full" />
                </div>
              </div>
            )}
          </Glass>
        </div>

        {insights.length > 0 && (
          <div className="flex flex-col gap-2">
             <Glass className="flex flex-col gap-2 border-l-4 border-purple/50">
                <div className="section-label px-0 text-secondary font-bold text-xs uppercase mb-0">Horizon Agent</div>
                {insights.slice(0, 1).map((insight, idx) => (
                    <div key={idx} className="text-sm font-bold text-primary">{insight.message}</div>
                ))}
             </Glass>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Glass className="!p-4 !flex !flex-col !gap-4">
             <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-secondary uppercase tracking-wide">Activity Volume</span>
                <span className="text-xs text-secondary">{telemetrySubtitle}</span>
             </div>
             {(() => {
                const sbWidget = hasData ? widgets.find(w => w.type === 'stackedbar') : null;
                if(sbWidget) {
                    return <StackedBar data={sbWidget.data.entries} colors={sbWidget.data.colors} title={sbWidget.title} />;
                }
                return <StackedBar data={[]} />;
             })()}
          </Glass>
        </div>

        <ReportGenerator segment={segment} />

        <div className="mt-12 mb-8 px-4">
            <h4 className="text-xs font-bold text-secondary uppercase tracking-wide mb-3">About Metrics</h4>
            <div className="space-y-3 text-xs text-secondary leading-relaxed opacity-80">
                <p><strong className="text-primary">System Health:</strong> The heartbeat of your OS. Represents your daily reliability score, calculated as the average completion percentage of all active goals.</p>
                <p><strong className="text-primary">Momentum:</strong> Your velocity vector. Measures the rate of change in your activity volume compared to the previous 7-day window.</p>
                <p><strong className="text-primary">Activity Volume:</strong> Your raw output. The total accumulation of logged hours and repetitions, regardless of specific goals.</p>
            </div>
        </div>
      </div>
    </div>
  );
};
