import React, { useContext, useState, useMemo } from 'react';
import { StorageContext } from '../context/StorageContext';
import { WidgetEngine } from '../engine/WidgetEngine';
import { HorizonAgent } from '../lib/horizonAgent';
import { MetricEngine } from '../engine/MetricEngine';
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
    WidgetEngine.generateWidgets(metrics, logEntries, segment), 
  [metrics, logEntries, segment]);

  // Calculate Real System Health & Stats
  const stats = useMemo(() => {
    if (!metrics.length) return { reliability: 0, trend: '0%', intensity: 'None', status: 'Offline' };

    // Determine window size in days
    let days = 7;
    if (segment === 'Daily') days = 1;
    if (segment === 'Monthly') days = 30;
    
    // Filter logs for current window
    const currentLogs = MetricEngine.getLogsForWindow(logEntries, days, 0);

    // Filter logs for previous window (for trend comparison)
    const prevLogs = MetricEngine.getLogsForWindow(logEntries, days, 1);

    // 1. Reliability (Average Goal Completion)
    let totalCompletion = 0;
    metrics.forEach(m => {
       // MetricEngine.goalCompletion handles 0-100 logic
       const comp = MetricEngine.goalCompletion ? MetricEngine.goalCompletion(m, currentLogs) : 0;
       totalCompletion += Math.min(comp, 100); // Cap individual impact at 100%
    });
    const reliability = Math.round(totalCompletion / metrics.length);

    // 2. Trend Calculation
    let prevTotal = 0;
    metrics.forEach(m => {
       const comp = MetricEngine.goalCompletion ? MetricEngine.goalCompletion(m, prevLogs) : 0;
       prevTotal += Math.min(comp, 100);
    });
    const prevReliability = Math.round(prevTotal / metrics.length);
    const trendVal = reliability - prevReliability;
    const trend = trendVal >= 0 ? `+${trendVal}%` : `${trendVal}%`;

    // 3. Intensity (Log Volume Heuristic)
    // Baseline: We expect roughly 1 log per metric per day (very rough heuristic)
    const expectedVolume = metrics.length * (days > 1 ? days : 1); 
    const ratio = currentLogs.length / (expectedVolume || 1);
    
    let intensity = 'Low';
    if (ratio > 0.4) intensity = 'Moderate';
    if (ratio > 0.8) intensity = 'High';
    if (ratio > 1.2) intensity = 'Peak';

    // 4. Operational Baseline Status
    const status = reliability > 80 ? 'Optimal' : reliability > 50 ? 'Functional' : 'Degraded';

    return { reliability, trend, intensity, status };
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
