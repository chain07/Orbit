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

// Helper for Momentum Sparkline (Catmull-Rom)
const MomentumSparkline = ({ data, color = '#FF9500' }) => {
    if (!data || data.length === 0) return null;

    const svgWidth = 200;
    const svgHeight = 60;

    let min = Math.min(...data);
    let max = Math.max(...data);
    if (min === max) { min = 0; max = Math.max(10, max); }

    const range = max - min;
    const padding = range * 0.1;
    const paddedMin = min - padding;
    const paddedMax = max + padding;
    const paddedRange = paddedMax - paddedMin;

    const points = data.map((val, i) => ({
        x: (i / (data.length - 1)) * svgWidth,
        y: svgHeight - ((val - paddedMin) / paddedRange) * svgHeight
    }));

    const getSplinePath = (points) => {
        if (points.length === 0) return "";
        if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

        let d = `M ${points[0].x} ${points[0].y}`;
        const tension = 0.25;

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const prev = points[i - 1] || p0;
            const next = points[i + 2] || p1;

            const cp1x = p0.x + (p1.x - prev.x) * tension;
            const cp1y = p0.y + (p1.y - prev.y) * tension;
            const cp2x = p1.x - (next.x - p0.x) * tension;
            const cp2y = p1.y - (next.y - p0.y) * tension;

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
        }
        return d;
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px' }}>
           <div style={{ position: 'absolute', inset: 0, padding: '0', pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ borderTop: '1px dashed var(--separator)', position: 'absolute', top: '0', left: 0, right: 0, opacity: 0.3 }} />
                <div style={{ borderTop: '1px dashed var(--separator)', position: 'absolute', top: '50%', left: 0, right: 0, opacity: 0.3 }} />
                <div style={{ borderTop: '1px dashed var(--separator)', position: 'absolute', bottom: '0', left: 0, right: 0, opacity: 0.3 }} />
           </div>
             <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none" style={{ overflow: 'visible', zIndex: 1, position: 'relative' }}>
                  <path d={getSplinePath(points)} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" />
             </svg>
        </div>
    );
};

export const Intel = () => {
  const { metrics, logEntries, allLogs, timeLogs } = useContext(StorageContext);
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

  const stats = useMemo(() => {
    return AnalyticsEngine.calculateSystemHealth(metrics, logEntries, segment, timeLogs);
  }, [metrics, logEntries, timeLogs, segment]);

  const telemetrySubtitle = useMemo(() => {
    if (segment === 'Daily') return 'Today';
    if (segment === 'Weekly') return 'Last 7 Days';
    if (segment === 'Monthly') return 'Last 30 Days';
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

        {/* 1. Horizon Agent (Top) */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 2. System Health */}
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
                {/* Manual Progress Bar */}
                <div style={{ marginTop: '16px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                         <span style={{ fontSize: '13px', fontWeight: '600', color: '#8E8E93' }}>Operational Status</span>
                         <span style={{ fontSize: '13px', fontWeight: '700', color: stats.reliability > 80 ? '#34C759' : '#FF9500' }}>{stats.reliability}%</span>
                     </div>
                     <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                         <div style={{ width: `${stats.reliability}%`, height: '100%', backgroundColor: stats.reliability > 80 ? '#34C759' : '#FF9500', transition: 'width 0.5s ease' }} />
                     </div>
                </div>
                <span className="text-xs text-secondary self-end opacity-70 mt-2">Operational Baseline</span>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue opacity-5 rounded-full blur-2xl z-0"></div>
          </Glass>

          {/* 3. Momentum */}
          <Glass className={`flex flex-col justify-between min-h-[140px] relative overflow-hidden !p-0`}>
                <div className="flex justify-between items-start mb-2 px-4 pt-4 z-20">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wide">Momentum</span>
                  <span className={`text-2xl font-bold font-mono ${
                     stats.intensity === 'Peak' ? 'text-red' :
                     stats.intensity === 'High' ? 'text-orange' :
                     stats.intensity === 'Moderate' ? 'text-blue' : 'text-secondary'
                   }`}>{stats.intensity}</span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-orange opacity-5 rounded-full blur-2xl"></div>
                {/* Momentum Sparkline */}
                <div className="w-full h-[60px] relative mt-auto px-4 pb-4">
                   <MomentumSparkline data={stats.momentumHistory} color="#FF9500" />
                   <div className="text-xs text-secondary text-center opacity-80 absolute bottom-2 w-full left-0">Status: {stats.status}</div>
                </div>
          </Glass>
        </div>

        {/* 4. Activity Volume Stacked Bar */}
        <div className="flex flex-col gap-2">
          <Glass className="!p-4 !flex !flex-col !gap-4">
             <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-secondary uppercase tracking-wide">Activity Volume</span>
                <span className="text-xs text-secondary">{telemetrySubtitle}</span>
             </div>
             {/* Wrapper with borders and margin */}
             <div style={{ marginTop: '40px', borderLeft: '1px solid rgba(0,0,0,0.1)', borderRight: '1px solid rgba(0,0,0,0.1)', width: '100%', height: '220px' }}>
                <StackedBar data={stats.activityVolume?.entries || []} colors={stats.activityVolume?.colors || {}} height={220} />
             </div>
          </Glass>
        </div>

        <ReportGenerator segment={segment} />

        <div className="mt-12 mb-8 px-4">
            <h4 className="text-xs font-bold text-secondary uppercase tracking-wide mb-3">About Metrics</h4>
            <div className="space-y-3 text-xs text-secondary leading-relaxed opacity-80">
                <p><strong className="text-secondary">System Health:</strong> The heartbeat of your OS. Represents your daily reliability score, calculated as the average completion percentage of all active goals.</p>
                <p><strong className="text-secondary">Momentum:</strong> Your velocity vector. Measures the rate of change in your activity volume compared to the previous 7-day window.</p>
                <p><strong className="text-secondary">Activity Volume:</strong> Your raw output. The total accumulation of logged hours and repetitions, regardless of specific goals.</p>
            </div>
        </div>
      </div>
    </div>
  );
};
