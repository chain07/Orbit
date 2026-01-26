import React from 'react';

/**
 * TrendSparkline Widget
 * * Displays a rolling window trend for a metric.
 * * Refactored Phase 4.12: Atomic Visual Fixes (Padding Removal).
 */
export const TrendSparkline = ({ data, title }) => {
  if (!data || !data.data) return null;

  const { data: values = [], current = 0, color = '#4f46e5' } = data;

  // Calculate points for custom SVG render
  const svgWidth = 200;
  const svgHeight = 100;

  // Safe normalization: Find min/max and add 10% padding
  let min = Math.min(...values);
  let max = Math.max(...values);

  if (min === max) { min = 0; max = Math.max(10, max); } // Fallback for flat line

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
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
       {/* Atomic Header Fix: Strict Positioning */}
       <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            margin: 0,
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: 'var(--secondary)',
            zIndex: 20
       }}>
         {title || data.label || 'Trend'}
       </div>

       {/* Current Value (Top Right) */}
       <div style={{
           position: 'absolute',
           top: '16px',
           right: '20px',
           fontSize: '24px',
           fontWeight: '800',
           lineHeight: 1,
           zIndex: 10,
           color: 'var(--text-primary)'
       }}>
           {typeof current === 'number' ? Math.round(current * 10) / 10 : current}
       </div>

       {/* Graph Container */}
       <div style={{ position: 'relative', width: '100%', height: '100%', paddingTop: '40px', paddingRight: '24px' }}>

           {/* Grid Overlay (Manual) */}
           <div style={{ position: 'absolute', inset: 0, padding: '20px', pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ borderTop: '1px dashed var(--separator)', position: 'absolute', top: '25%', left: 0, right: 0, opacity: 0.3 }} />
                <div style={{ borderTop: '1px dashed var(--separator)', position: 'absolute', top: '50%', left: 0, right: 0, opacity: 0.3 }} />
                <div style={{ borderTop: '1px dashed var(--separator)', position: 'absolute', top: '75%', left: 0, right: 0, opacity: 0.3 }} />
           </div>

           {/* Axis Labels (Outside Right) */}
           <div style={{ position: 'absolute', top: '34px', right: 0, fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'right' }}>{Math.round(max)}</div>
           <div style={{ position: 'absolute', bottom: '-6px', right: 0, fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'right' }}>{Math.round(min)}</div>

           {/* The Graph SVG */}
           <div style={{ position: 'absolute', top: '40px', left: 0, right: '24px', bottom: 0, zIndex: 1 }}>
                <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    <path d={pathD} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" />
                </svg>
           </div>
       </div>
    </div>
  );
};
