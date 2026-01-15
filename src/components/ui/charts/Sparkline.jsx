// src/components/ui/Sparkline.jsx
import React from 'react';
import { motion } from 'framer-motion';

/**
 * Sparkline
 * Smooth line chart with dots, vertical intersections, and gradient fill
 *
 * Props:
 * - data: array of numeric values (normalized 0–1)
 * - width: chart width in px (default 200)
 * - height: chart height in px (default 50)
 * - strokeWidth: line thickness (default 2)
 * - lineColor: color of the line
 * - fillColor: color for gradient fill under line
 * - showDots: boolean to display dots at vertical intersections
 */
export const Sparkline = ({
  data = [],
  width = 200,
  height = 50,
  strokeWidth = 2,
  lineColor = '#4f46e5',
  fillColor = 'rgba(79, 70, 229, 0.3)',
  showDots = true,
}) => {
  if (!data.length) return null;

  const step = width / (data.length - 1 || 1);
  const points = data.map((v, i) => `${i * step},${height - v * height}`).join(' ');

  const latestPoint = data.length - 1;

  return (
    <svg width={width} height={height}>
      {/* Gradient under the line */}
      <defs>
        <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity={0.6} />
          <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Fill area */}
      <motion.polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill="url(#sparkline-gradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      {/* Sparkline path */}
      <motion.polyline
        points={points}
        fill="none"
        stroke={lineColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />

      {/* Dots at vertical intersections */}
      {showDots &&
        data.map((v, i) => (
          <motion.circle
            key={i}
            cx={i * step}
            cy={height - v * height}
            r={i === latestPoint ? 4 : 2}
            fill={i === latestPoint ? lineColor : 'white'}
            stroke={i === latestPoint ? 'white' : lineColor}
            strokeWidth={1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          />
        ))}
    </svg>
  );
};
