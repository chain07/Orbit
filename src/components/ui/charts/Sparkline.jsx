import React, { useMemo } from 'react';

/**
 * Sparkline
 * Smooth line chart with grid, axis labels, and gradient fill.
 * Replaced Framer Motion with CSS transitions for interaction.
 *
 * Props:
 * - data: array of numbers (raw values)
 * - comparisonData: array of numbers (optional, dashed line)
 * - labels: array of strings for X-axis (optional, defaults to index)
 * - height: chart height in px (default 120)
 * - lineColor: color of the line
 * - fillColor: color for gradient fill under line
 * - showDots: boolean
 */
export const Sparkline = ({
  data = [],
  comparisonData = [],
  labels = [],
  height = 120,
  lineColor = '#4f46e5',
  fillColor = 'rgba(79, 70, 229, 0.3)',
  showDots = true,
  showLabels = true,
  className = '',
}) => {
  // 1. Calculations & Normalization
  const { points, comparisonPoints, max, min, normalizedData, stepX } = useMemo(() => {
    if (!data.length) return { points: '', comparisonPoints: '', max: 0, min: 0, normalizedData: [], stepX: 0 };

    const allValues = [...data, ...comparisonData];
    const maxVal = Math.max(...allValues);
    const minVal = Math.min(...allValues);
    // Add 10% padding to top, ensure baseline is at least 0 if data is positive
    const ceiling = maxVal === minVal ? maxVal + 10 : maxVal + (maxVal - minVal) * 0.1;
    const floor = minVal > 0 ? 0 : minVal; 
    const range = ceiling - floor;

    const normalize = (val) => (val - floor) / (range || 1);
    
    // SVG Coordinate mapping
    // We use a viewBox of 0 0 100 100 for easy scaling, preserving aspect ratio via CSS
    const svgWidth = 100;
    const svgHeight = 100;
    const step = svgWidth / (data.length - 1 || 1);

    const pts = data.map((v, i) => {
      const x = i * step;
      const y = svgHeight - (normalize(v) * svgHeight); // Invert Y for SVG
      return `${x},${y}`;
    }).join(' ');

    let compPts = '';
    if (comparisonData.length > 0) {
        compPts = comparisonData.map((v, i) => {
            const x = i * step; // Assuming comparison data aligns with data length/step
            const y = svgHeight - (normalize(v) * svgHeight);
            return `${x},${y}`;
        }).join(' ');
    }

    return { 
      points: pts, 
      comparisonPoints: compPts,
      max: ceiling, 
      min: floor, 
      normalizedData: data.map(normalize),
      stepX: step
    };
  }, [data, comparisonData]);

  if (!data.length) return null;

  const uniqueId = React.useId(); // Unique ID for gradient definition

  return (
    <div className={`w-full flex flex-col select-none group ${className}`} style={{ height: className.includes('h-full') ? '100%' : 'auto' }}>
      
      {/* Chart Container */}
      <div className="relative w-full flex" style={{ height: className.includes('h-full') ? '100%' : height }}>
        
        {/* Y-Axis Labels (Left side overlay or separate column) */}
        {showLabels && (
          <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] font-mono text-secondary pointer-events-none z-10 transition-opacity duration-300 opacity-50 group-hover:opacity-100">
            <span>{Math.round(max)}</span>
            <span className="opacity-50">{Math.round((max + min) / 2)}</span>
            <span>{Math.round(min)}</span>
          </div>
        )}

        {/* The Graph */}
        <div className={`flex-1 relative ${showLabels ? 'ml-6' : ''}`}>
            <svg 
              viewBox="0 0 100 100" 
              width="100%"
              height="100%"
              className="w-full h-full overflow-visible" 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`gradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* GRID LINES */}
              {/* Horizontal */}
              <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3,3" vectorEffect="non-scaling-stroke" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3,3" vectorEffect="non-scaling-stroke" />
              <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3,3" vectorEffect="non-scaling-stroke" />

              {/* Vertical (aligned with data points) */}
              {normalizedData.map((_, i) => (
                <line 
                  key={i} 
                  x1={i * stepX} y1="0" 
                  x2={i * stepX} y2="100" 
                  stroke="currentColor" 
                  strokeOpacity="0.05" 
                  vectorEffect="non-scaling-stroke" 
                />
              ))}

              {/* COMPARISON LINE (Dashed) */}
              {comparisonPoints && (
                  <polyline
                    fill="none"
                    stroke={lineColor}
                    strokeOpacity="0.3"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                    points={comparisonPoints}
                    vectorEffect="non-scaling-stroke"
                  />
              )}

              {/* MAIN DATA AREA */}
              <polyline
                fill={`url(#gradient-${uniqueId})`}
                stroke="none"
                points={`0,100 ${points} 100,100`}
              />

              {/* MAIN LINE */}
              <polyline
                fill="none"
                stroke={lineColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                vectorEffect="non-scaling-stroke"
                className="transition-all duration-300 ease-out"
              />

              {/* DOTS */}
              {showDots && normalizedData.map((n, i) => {
                  const x = i * stepX;
                  const y = 100 - (n * 100);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="3" // Default radius (scaled by CSS if needed, but here it's SVG unit, using vector-effect to keep size constant?)
                      fill={lineColor}
                      stroke="white"
                      strokeWidth="1.5"
                      className="transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 origin-center"
                      style={{ transformBox: 'fill-box' }}
                    />
                  );
              })}
            </svg>
        </div>
      </div>
    </div>
  );
};
