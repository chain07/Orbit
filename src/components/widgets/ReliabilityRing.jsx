import React from 'react';
import { RingChart } from '../ui/charts/RingChart';

/**
 * ReliabilityRing Widget
 * * Displays a metric's progress as a ring chart.
 * Expected data structure:
 * {
 * value: number (0-100),
 * label: string,
 * color: string
 * }
 */
export const ReliabilityRing = ({ data }) => {
  // Guard clause for missing data
  if (!data) return null;

  const { value = 0, label = '', color = '#4f46e5' } = data;

  return (
    <div className="flex items-center justify-center h-full w-full relative" style={{ aspectRatio: '1/1' }}>
      <div className="absolute top-3 right-3 text-xs font-bold text-secondary">
          {label}
      </div>
      <RingChart
        value={value}
        size={110}
        strokeWidth={12}
        color={color}
        label={null}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold tracking-tighter">{Math.round(value)}%</span>
      </div>
    </div>
  );
};
