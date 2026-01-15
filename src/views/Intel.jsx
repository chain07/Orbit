import React, { useContext, useState, useMemo } from 'react';
import { StorageContext } from '../context/StorageContext';
import { WidgetEngine } from '../engine/WidgetEngine';
import { HorizonAgent } from '../lib/horizonAgent';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Glass } from '../components/ui/Glass';
// CRITICAL FIX: Correct import paths for Charts
import { RingChart } from '../components/ui/charts/RingChart';
import { HeatMap } from '../components/ui/charts/Heatmap';
import { Sparkline } from '../components/ui/charts/Sparkline';
import { StackedBar } from '../components/ui/charts/StackedBar';
import '../styles/motion.css';

export const Intel = () => {
  const { metrics, logEntries } = useContext(StorageContext);
  const [segment, setSegment] = useState('Weekly');
  const segments = ['Daily', 'Weekly', 'Monthly'];

  // Generate insights & widgets
  const insights = useMemo(() => {
    const all = HorizonAgent.generateAllInsights(metrics, logEntries, segment);
    return Object.values(all).flat();
  }, [metrics, logEntries, segment]);

  const widgets = useMemo(() => 
    WidgetEngine.generateWidgets(metrics, logEntries, segment), 
  [metrics, logEntries, segment]);

  // Calculations for "System Health" density card
  const systemHealth = useMemo(() => {
    // Mock calculation for visual parity - requires real AnalyticsEngine integration
    const reliability = 85; 
    const trend = '+5%';
    return { reliability, trend };
  }, [logEntries]);

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

      {/* HIGH DENSITY SPLIT ROW (Visual Parity with dispatch.html) */}
      <div className="grid grid-cols-2 gap-4">
        {/* System Health Card */}
        <Glass className="flex flex-col justify-between min-h-[140px]">
          <div className="text-xs font-bold text-secondary uppercase tracking-wide">System Health</div>
          <div className="flex flex-col items-center my-2">
             <div className="text-4xl font-black text-primary">{systemHealth.reliability}%</div>
             <div className="text-xs font-bold text-green mt-1">{systemHealth.trend}</div>
          </div>
          <div className="text-xs text-secondary text-center opacity-80">Operational Baseline</div>
        </Glass>

        {/* Intensity / Vibe Card */}
        <Glass className="flex flex-col justify-between min-h-[140px]">
          <div className="text-xs font-bold text-secondary uppercase tracking-wide">Intensity</div>
          <div className="flex flex-col items-center my-2">
             <div className="text-4xl font-black text-orange">High</div>
          </div>
          <div className="text-xs text-secondary text-center opacity-80">Masking Detected</div>
        </Glass>
      </div>

      {/* ANALYSIS STREAM (Insights) */}
      {insights.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="section-label px-1">Analysis Stream</div>
          {insights.map((insight, idx) => (
            <Glass key={idx} className="flex flex-col gap-1 border-l-2 border-purple">
              <div className="text-sm font-bold text-primary">{insight.message}</div>
              {insight.value && <div className="text-xs text-secondary font-mono">Delta: {insight.value.toFixed(2)}</div>}
            </Glass>
          ))}
        </div>
      )}

      {/* TELEMETRY GRIDS (Widgets) */}
      <div className="flex flex-col gap-2">
        <div className="section-label px-1">Telemetry</div>
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
                    {type === 'sparkline' && <Sparkline data={data.values} lineColor={data.color} fillColor={data.color} />}
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
