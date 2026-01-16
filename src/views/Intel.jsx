import React, { useContext, useState, useMemo } from 'react';
import { StorageContext } from '../context/StorageContext';
import { WidgetDataEngine } from '../engine/WidgetDataEngine';
import { HorizonAgent } from '../lib/horizonAgent';
import { MetricEngine } from '../engine/MetricEngine';
import { AnalyticsEngine } from '../engine/AnalyticsEngine';
import SegmentedControl from '../components/ui/SegmentedControl';
import Glass from '../components/ui/Glass';
import { ReportGenerator } from '../components/intel/ReportGenerator';
// Charts
import { RingChart } from '../components/ui/charts/RingChart';
import { HeatMap } from '../components/ui/charts/Heatmap';
import { Sparkline } from '../components/ui/charts/Sparkline';
import { StackedBar } from '../components/ui/charts/StackedBar';
import '../styles/motion.css';

export const Intel = () => {
  const { metrics, logEntries } = useContext(StorageContext);
  const [segment, setSegment] = useState('Weekly');
  const segments = ['Daily', 'Weekly', 'Monthly'];

  // Generate insights
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

  // Generate widgets
  const widgets = useMemo(() => 
    WidgetDataEngine.generateWidgets(metrics, logEntries, segment),
  [metrics, logEntries, segment]);

  // Calculate Real System Health & Stats
  const stats = useMemo(() => {
    return AnalyticsEngine.calculateSystemHealth(metrics, logEntries, segment);
  }, [metrics, logEntries, segment]);

  return (
    <div className="flex flex-col gap-6 p-4 pb-32 fade-in">
      
      {/* Header */}
      <div className="flex flex-col gap-1 mt-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Intelligence</h1>
        <p className="text-secondary font-medium">Pattern and telemetry analysis.</p>
      </div>

      <SegmentedControl
        options={segments.map(s => ({ label: s, value: s }))}
        value={segment}
        onChange={setSegment}
      />

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 gap-4">
        {/* System Health Card */}
        <Glass className="flex flex-col justify-between min-h-[140px]">
          <div className="text-xs font-bold text-secondary uppercase tracking-wide">System Health</div>
          <div className="flex flex-col items-center my-2">
             <div className="text-4xl font-black text-primary">{stats.reliability}%</div>
             <div className={`text-xs font-bold mt-1 ${stats.trend.startsWith('-') ? 'text-red' : 'text-green'}`}>
               {stats.trend}
             </div>
          </div>
          <div className="text-xs text-secondary text-center opacity-80">Operational Baseline</div>
        </Glass>

        {/* Intensity Card */}
        <Glass className="flex flex-col justify-between min-h-[140px]">
          <div className="text-xs font-bold text-secondary uppercase tracking-wide">Intensity</div>
          <div className="flex flex-col items-center my-2">
             <div className={`text-4xl font-black ${
               stats.intensity === 'Peak' ? 'text-red' : 
               stats.intensity === 'High' ? 'text-orange' : 
               stats.intensity === 'Moderate' ? 'text-blue' : 'text-secondary'
             }`}>
               {stats.intensity}
             </div>
          </div>
          <div className="text-xs text-secondary text-center opacity-80">Status: {stats.status}</div>
        </Glass>
      </div>

      {/* REPORT GENERATOR */}
      <ReportGenerator segment={segment} />

      {/* ANALYSIS STREAM */}
      {insights.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="section-label px-1 text-secondary font-bold text-xs uppercase">Analysis Stream</div>
          {insights.map((insight, idx) => (
            <Glass key={idx} className="flex flex-col gap-1 border-l-2 border-purple">
              <div className="text-sm font-bold text-primary">{insight.message}</div>
              {insight.value && <div className="text-xs text-secondary font-mono">Delta: {insight.value.toFixed(2)}</div>}
            </Glass>
          ))}
        </div>
      )}

      {/* TELEMETRY GRIDS */}
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
