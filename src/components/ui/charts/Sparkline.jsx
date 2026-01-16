import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Sparkline
 * Smooth line chart with grid, axis labels, and gradient fill.
 *
 * Props:
 * - data: array of numbers (raw values)
 * - labels: array of strings for X-axis (optional, defaults to index)
 * - height: chart height in px (default 120)
 * - lineColor: color of the line
 * - fillColor: color for gradient fill under line
 */
export const Sparkline = ({
  data = [],
  labels = [],
  height = 120,
  lineColor = '#4f46e5',
  fillColor = 'rgba(79, 70, 229, 0.3)',
  showDots = true,
}) => {
  // 1. Calculations & Normalization
  const { points, max, min, normalizedData, stepX } = useMemo(() => {
    if (!data.length) return { points: '', max: 0, min: 0, normalizedData: [], stepX: 0 };

    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    // Add 10% padding to top, ensure baseline is at least 0 if data is positive
    const ceiling = maxVal === minVal ? maxVal + 10 : maxVal + (maxVal - minVal) * 0.1;
    const floor = minVal > 0 ? 0 : minVal; 
    const range = ceiling - floor;

    const normalized = data.map(v => (v - floor) / (range || 1));
    
    // SVG Coordinate mapping
    // We use a viewBox of 0 0 100 100 for easy scaling, preserving aspect ratio via CSS
    const svgWidth = 100;
    const svgHeight = 100;
    const step = svgWidth / (data.length - 1 || 1);

    const pts = normalized.map((n, i) => {
      const x = i * step;
      const y = svgHeight - (n * svgHeight); // Invert Y for SVG
      return `${x},${y}`;
    }).join(' ');

    return { 
      points: pts, 
      max: ceiling, 
      min: floor, 
      normalizedData: normalized,
      stepX: step
    };
  }, [data]);

  if (!data.length) return null;

  const uniqueId = React.useId(); // Unique ID for gradient definition

  return (
    <div className="w-full flex flex-col select-none" style={{ height: 'auto' }}>
      
      {/* Chart Container */}
      <div className="relative w-full flex" style={{ height }}>
        
        {/* Y-Axis Labels (Left side overlay or separate column) */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] font-mono text-secondary pointer-events-none z-10">
          <span>{Math.round(max)}</span>
          <span className="opacity-50">{Math.round((max + min) / 2)}</span>
          <span>{Math.round(min)}</span>
        </div>

        {/* The Graph */}
        <div className="flex-1 ml-6 relative">
            <svg 
              viewBox="0 0 100 100" 
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
