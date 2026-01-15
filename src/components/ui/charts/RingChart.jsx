// src/components/ui/RingChart.jsx
import React from 'react';
import { motion } from 'framer-motion';

/**
 * RingChart
 * Donut chart for goal completion or progress metrics
 *
 * Props:
 * - value: number 0–100 (percent completion)
 * - size: diameter in px (default 100)
 * - strokeWidth: width of the ring (default 10)
 * - color: fill color for completed portion
 * - bgColor: background ring color
 * - label: optional center label
 * - className: optional additional styling
 */
export const RingChart = ({
  value = 0,
  size = 100,
  strokeWidth = 10,
  color = '#4f46e5',
  bgColor = '#e5e7eb',
  label = '',
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {label && (
        <div className="absolute text-center text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </div>
      )}
    </div>
  );
};
