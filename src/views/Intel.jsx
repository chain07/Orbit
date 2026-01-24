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
              <div className="flex flex-row items-center gap-6 flex-1 z-10 px-2">
                <RingChart value={100} color="rgba(255,255,255,0.1)" strokeWidth={8} size={80} />
                <div className="flex flex-col">
                  <div className="text-4xl font-bold text-primary">0%</div>
                  <div className="text-sm text-secondary">Awaiting Data</div>
                </div>
              </div>
            )}
          </Glass>

          <Glass className={`flex flex-col justify-between min-h-[140px] relative overflow-hidden ${!hasData ? 'pb-4' : ''}`}>
            <div className="text-xs font-bold text-secondary uppercase tracking-wide z-10">{hasData ? 'Intensity' : 'MOMENTUM'}</div>
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
                <div className="flex-1 flex items-center z-10 w-full h-full">
                   <Sparkline
                     data={[0, 0, 0, 0, 0]}
                     showLabels={false}
                     showDots={false}
                     labels={[]}
                     lineColor="rgba(255,255,255,0.1)"
                     fillColor="transparent"
                     className="w-full h-full"
                   />
                </div>
                <div className="text-xs text-secondary text-center opacity-80 z-10">Status: Offline</div>
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
          <div className="widget-grid">
            {widgets.map((widget, idx) => {
              const { type, data, title } = widget;
              return (
                <Glass key={idx}>
                  <div className="flex flex-col gap-3 h-full">
                    <div className="text-sm font-bold text-secondary uppercase tracking-wide">{title}</div>
                    <div className="flex-1 flex items-center justify-center min-h-[100px]">
                      {type === 'ring' && <RingChart value={data.value} label={data.label} color={data.color} />}
                      {type === 'heatmap' && <HeatMap data={data.values} startDate={data.start} endDate={data.end} />}
                      {type === 'sparkline' && <Sparkline data={data.data} lineColor={data.color} fillColor={data.color} />}
                      {type === 'stackedbar' && <StackedBar data={data.entries} colors={data.colors} />}
                      {type === 'number' && (
                         <div className="text-3xl font-bold">{data.value} <span className="text-sm text-secondary">{data.unit}</span></div>
                      )}
                    </div>
                  </div>
                </Glass>
              );
            })}
          </div>
        </div>

        <ReportGenerator segment={segment} />
      </div>
    </div>
  );
};
