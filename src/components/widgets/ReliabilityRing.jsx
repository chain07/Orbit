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
    <div className="flex flex-col items-center justify-center h-full w-full py-2">
      <RingChart
        value={value}
        size={120}
        strokeWidth={12}
        color={color}
        label={`${Math.round(value)}%`}
        className="mb-2"
      />
      <div className="text-sm font-medium text-secondary text-center">
        {label}
      </div>
    </div>
  );
};
