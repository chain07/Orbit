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

  const hasData = metrics.length > 0 && logEntries.length > 0;

  return (
    <div className="flex flex-col gap-6 p-4 pb-32 fade-in">
      
      <div className="view-header-stack">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Intelligence</h1>
          <p className="text-secondary font-medium">Pattern and telemetry analysis.</p>
        </div>

        <SegmentedControl
          options={segments.map(s => ({ label: s, value: s }))}
          value={segment}
          onChange={setSegment}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Glass className="flex flex-col justify-between min-h-[140px] relative overflow-hidden">
          <div className="text-xs font-bold text-secondary uppercase tracking-wide z-10">System Health</div>
          {hasData ? (
             <div className="flex flex-col items-center my-2 z-10 gap-2">
               <div className="text-6xl font-black text-primary tracking-tighter">{stats.reliability}%</div>
               <div className={`text-sm font-bold mt-1 px-2 py-0.5 rounded-full ${stats.trend.startsWith('-') ? 'bg-red/10 text-red' : 'bg-green/10 text-green'}`}>
                 {stats.trend}
               </div>
             </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative flex items-center justify-center opacity-40 grayscale">
                 <div className="text-6xl font-black text-secondary opacity-30 tracking-tighter">0%</div>
              </div>
            </div>
          )}
          <div className="flex flex-col items-center justify-center text-xs text-secondary opacity-60 z-10 relative mt-auto">
            {hasData ? 'Operational Baseline' : 'Log data to initialize.'}
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue opacity-5 rounded-full blur-2xl"></div>
        </Glass>

        <Glass className="flex flex-col justify-between min-h-[140px] relative overflow-hidden gap-4">
          <div className="text-xs font-bold text-secondary uppercase tracking-wide z-10">Momentum</div>

          {/* Background Grid - Always Visible */}
          <div className="absolute inset-x-4 top-10 bottom-0 flex items-center justify-center opacity-20 pointer-events-none">
               <svg viewBox="0 0 100 60" className="w-full h-full text-secondary" preserveAspectRatio="none">
                  <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="30" x2="100" y2="30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" vectorEffect="non-scaling-stroke" />
                  {[0, 16.6, 33.3, 50, 66.6, 83.3, 100].map(x => (
                     <line key={x} x1={x} y1="0" x2={x} y2="60" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" vectorEffect="non-scaling-stroke" />
                  ))}
               </svg>
          </div>

          {hasData && (
            <div className="flex flex-col items-center my-2 z-10">
               <div className={`text-4xl font-black tracking-tight ${
                 stats.intensity === 'Peak' ? 'text-red' :
                 stats.intensity === 'High' ? 'text-orange' :
                 stats.intensity === 'Moderate' ? 'text-blue' : 'text-secondary'
               }`}>
                 {stats.intensity}
               </div>
            </div>
          )}

          {hasData && (
             <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-between text-[8px] font-mono text-secondary py-4 pointer-events-none">
                 <span>10</span>
                 <span>5</span>
                 <span>0</span>
             </div>
          )}

          <div className="text-xs text-secondary text-center opacity-80 z-10 relative mt-auto pb-1">Status: {hasData ? stats.status : 'Offline'}</div>
           <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-orange opacity-5 rounded-full blur-2xl"></div>
        </Glass>
      </div>

      <ReportGenerator segment={segment} />

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
    </div>
  );
};
