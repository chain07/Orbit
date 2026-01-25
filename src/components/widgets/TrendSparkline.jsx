import React from 'react';
import { Sparkline } from '../ui/charts/Sparkline';

/**
 * TrendSparkline Widget
 * * Displays a rolling window trend for a metric.
 * Expected data structure:
 * {
 * values: number[] (normalized 0-1),
 * color: string,
 * label: string,
 * trendLabel: string (optional, e.g. "+5% vs last week")
 * }
 */
export const TrendSparkline = ({ data }) => {
  if (!data || !data.data) return null;

  const { data: values = [], current = 0, color = '#4f46e5', label = '', trendLabel = '' } = data;

  // Calculate points for custom SVG render
  const svgWidth = 200;
  const svgHeight = 100;

  // Safe normalization: Find min/max and add padding
  let min = Math.min(...values);
  let max = Math.max(...values);

  if (min === max) { min = 0; max = Math.max(100, max); } // Fallback for flat line

  const range = max - min;
  const padding = range * 0.1; // 10% padding
  const paddedMin = min - padding;
  const paddedMax = max + padding;
  const paddedRange = paddedMax - paddedMin;

  const points = values.map((val, i) => ({
      x: (i / (values.length - 1)) * svgWidth,
      y: svgHeight - ((val - paddedMin) / paddedRange) * svgHeight
  }));

  // Catmull-Rom Spline Generation
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

  const pathD = getSplinePath(points);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px', alignItems: 'center', height: '100%', width: '100%', padding: '16px', position: 'relative' }}>
       <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', zIndex: 2 }}>
         {label || 'Trend'}
       </div>

       {/* Left Column: Stats */}
       <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '16px' }}>
           <span style={{ fontSize: '32px', fontWeight: '800', lineHeight: 1 }}>{Math.round(current)}%</span>
           <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Current</span>
       </div>
       {/* Right Column: Graph */}
       <div style={{ position: 'relative', width: '100%', height: '60px', marginTop: '16px' }}>
           {/* 5 Background Lines (0, 25, 50, 75, 100%) */}
           <div style={{ position: 'absolute', top: '0%', width: '100%', borderTop: '1px dashed currentColor', opacity: 0.1 }} />
           <div style={{ position: 'absolute', top: '25%', width: '100%', borderTop: '1px dashed currentColor', opacity: 0.1 }} />
           <div style={{ position: 'absolute', top: '50%', width: '100%', borderTop: '1px dashed currentColor', opacity: 0.1 }} />
           <div style={{ position: 'absolute', top: '75%', width: '100%', borderTop: '1px dashed currentColor', opacity: 0.1 }} />
           <div style={{ position: 'absolute', bottom: '0%', width: '100%', borderTop: '1px dashed currentColor', opacity: 0.1 }} />

           {/* Axis Labels */}
           <div style={{ position: 'absolute', top: '-14px', right: 0, fontSize: '10px', color: 'var(--text-secondary)' }}>Max</div>
           <div style={{ position: 'absolute', bottom: '-14px', right: 0, fontSize: '10px', color: 'var(--text-secondary)' }}>0</div>

           {/* The SVG */}
           <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
               <path d={pathD} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" />
           </svg>
       </div>
    </div>
  );
};
