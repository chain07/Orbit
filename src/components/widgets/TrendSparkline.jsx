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
  if (!data || !data.values) return null;

  const { values = [], color = '#4f46e5', label = '', trendLabel = '' } = data;

  return (
    <div className="flex flex-col h-full w-full justify-between">
      <div className="flex justify-between items-baseline mb-2 px-1">
        <span className="text-sm font-bold text-secondary uppercase tracking-wide">
          {label}
        </span>
        {trendLabel && (
          <span className="text-xs font-medium text-secondary">
            {trendLabel}
          </span>
        )}
      </div>
      
      <div className="flex-1 w-full min-h-[60px] relative">
        {/* We use a container to ensure the SVG scales correctly */}
        <div className="absolute inset-0">
          <Sparkline
            data={values}
            width={300} // Base width for aspect ratio
            height={100} // Base height for aspect ratio
            lineColor={color}
            fillColor={color}
            strokeWidth={3}
            showDots={true}
          />
        </div>
      </div>
    </div>
  );
};
