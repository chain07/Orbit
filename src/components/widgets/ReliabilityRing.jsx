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
    <div className="flex flex-row items-center justify-center h-full w-full gap-4 aspect-square">
      <RingChart
        value={value}
        size={90}
        strokeWidth={10}
        color={color}
        label={null}
      />
      <div className="flex flex-col">
        <div className="text-2xl font-bold tracking-tight">
          {Math.round(value)}%
        </div>
        <div className="text-xs font-medium text-secondary">
          {label}
        </div>
      </div>
    </div>
  );
};
