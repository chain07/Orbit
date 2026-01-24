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
  const { metrics, logEntries } = useContext(StorageContext);
  const [segment, setSegment] = useState('Weekly');

  const hasData = logEntries && logEntries.length > 0;
  const segments = ['Daily', 'Weekly', 'Monthly'];

  const insights = useMemo(() => {
    if (!HorizonAgent || !HorizonAgent.generateAllInsights) return [];
    try {
      const all = HorizonAgent.generateAllInsights(metrics, logEntries, segment);
      return Object.values(all).flat();
    } catch (e) {
      console.warn("Horizon Agent failed:", e);
      return [];
    }
  }, [metrics, logEntries, segment]);

  const widgets = useMemo(() => 
    WidgetDataEngine.generateWidgets(metrics, logEntries, segment),
  [metrics, logEntries, segment]);

  const stats = useMemo(() => {
    return AnalyticsEngine.calculateSystemHealth(metrics, logEntries, segment);
  }, [metrics, logEntries, segment]);

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
          <Glass className="flex flex-col justify-between min-h-[140px] relative overflow-hidden">
            <div className="text-xs font-bold text-secondary uppercase tracking-wide z-10">System Health</div>
            {hasData ? (
              <>
                <div className="flex flex-col items-center my-2 z-10">
                   <div className="text-5xl font-black text-primary tracking-tighter">{stats.reliability}%</div>
                   <div className={`text-sm font-bold mt-1 px-2 py-0.5 rounded-full ${stats.trend.startsWith('-') ? 'bg-red/10 text-red' : 'bg-green/10 text-green'}`}>
                     {stats.trend}
                   </div>
                </div>
                <div className="text-xs text-secondary text-center opacity-80 z-10">Operational Baseline</div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue opacity-5 rounded-full blur-2xl"></div>
              </>
            ) : (
              <div className="flex flex-col justify-center w-full h-full px-5 py-4 z-10">
                <div className="flex justify-between items-end mb-3">
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-secondary uppercase tracking-wide">System Health</span>
                      <span className="text-2xl font-bold mt-1">0%</span>
                   </div>
                   <span className="text-xs text-secondary mb-1">Awaiting Data</span>
                </div>
                {/* Progress Track */}
                <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                   <div
                     className="h-full bg-blue transition-all duration-500 ease-out"
                     style={{ width: '0%' }}
                   />
                </div>
              </div>
            )}
          </Glass>

          <Glass className={`flex flex-col justify-between min-h-[140px] relative overflow-hidden ${!hasData ? '!p-0' : ''}`}>
            <div className={`text-xs font-bold text-secondary uppercase tracking-wide z-20 ${!hasData ? 'absolute top-5 left-5' : ''}`}>{hasData ? 'Intensity' : 'MOMENTUM'}</div>
            {hasData ? (
              <>
                <div className="flex flex-col items-center my-2 z-10">
                   <div className={`text-4xl font-black tracking-tight ${
                     stats.intensity === 'Peak' ? 'text-red' :
                     stats.intensity === 'High' ? 'text-orange' :
                     stats.intensity === 'Moderate' ? 'text-blue' : 'text-secondary'
                   }`}>
                     {stats.intensity}
                   </div>
                </div>
                <div className="text-xs text-secondary text-center opacity-80 z-10">Status: {stats.status}</div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-orange opacity-5 rounded-full blur-2xl"></div>
              </>
            ) : (
              <>
                <div className="absolute top-5 right-5 z-20 text-4xl font-bold text-secondary opacity-20">0.0</div>
                <div className="absolute inset-0 w-full h-full flex items-end">
                   <Sparkline
                     data={[0, 0, 0, 0, 0]}
                     showLabels={false}
                     showDots={false}
                     labels={[]}
                     lineColor="rgba(255,255,255,0.1)"
                     fillColor="transparent"
                     className="w-full h-full"
                     height={60}
                   />
                </div>
                <div className="absolute bottom-5 w-full text-center text-xs text-secondary opacity-60 z-20">Status: Offline</div>
              </>
            )}
          </Glass>
        </div>

        {insights.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="section-label px-1 text-secondary font-bold text-xs uppercase">Analysis Stream</div>
            {insights.map((insight, idx) => (
              <Glass key={idx} className="flex flex-col gap-1 border-l-4 border-purple/50">
                <div className="text-sm font-bold text-primary">{insight.message}</div>
                {insight.value && <div className="text-xs text-secondary font-mono">Delta: {insight.value.toFixed(2)}</div>}
              </Glass>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="section-label px-1 text-secondary font-bold text-xs uppercase">Telemetry</div>
          {/* Note: In a real implementation, we would transform 'widgets' or use specific logic for StackedBar.
              Here we assume 'widgets' contains formatted data for charts or we fallback to empty if none.
              For phase 2.9, we explicitly render StackedBar if data exists or skeleton.
          */}
          {hasData ? (
             <Glass>
               {/* We find the stackedbar widget data if it exists, else mock or use the component directly */}
               {(() => {
                  const sbWidget = widgets.find(w => w.type === 'stackedbar');
                  if(sbWidget) {
                      return <StackedBar data={sbWidget.data.entries} colors={sbWidget.data.colors} title={sbWidget.title} />;
                  }
                  // Fallback if no specific widget generated but we have data
                  return <div className="text-center text-secondary py-8">Telemetry data processing...</div>;
               })()}
             </Glass>
          ) : (
            <Glass className="min-h-[200px] flex items-center justify-center">
                 <div className="text-secondary text-sm">Awaiting Telemetry Data</div>
            </Glass>
          )}
        </div>

        <ReportGenerator segment={segment} />
      </div>
    </div>
  );
};
