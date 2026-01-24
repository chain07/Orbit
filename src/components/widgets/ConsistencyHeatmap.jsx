import React, { useMemo } from 'react';
import { HeatMap } from '../ui/charts/Heatmap';
import { dateUtils } from '../../lib/dateUtils';

/**
 * ConsistencyHeatmap Widget
 * * Displays a contribution-graph style heatmap.
 * Expected data structure:
 * {
 * values: { [date]: number }, // 0-100 values
 * startDate: string (YYYY-MM-DD),
 * endDate: string (YYYY-MM-DD),
 * color: string
 * }
 */
export const ConsistencyHeatmap = ({ data }) => {
  if (!data || !data.values) return null;

  // Default to last 12 weeks/90 days if range not provided
  const { startDate, endDate } = useMemo(() => {
    if (data.startDate && data.endDate) {
      return { startDate: data.startDate, endDate: data.endDate };
    }
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 84); // 12 weeks approx
    return {
      startDate: dateUtils.formatDate(start),
      endDate: dateUtils.formatDate(end)
    };
  }, [data.startDate, data.endDate]);

  // Custom color scale based on the metric's primary color
  // We can create a simple opacity-based scale or use the passed color
  const colorScale = (value) => {
    if (!value) return 'bg-gray-100 dark:bg-white/5'; // Empty state
    
    // If specific classes aren't available, we fallback to styles (though HeatMap expects classes usually)
    // Here we map normalized values to opacity buckets if using Tailwind classes
    // Assuming the parent passes a base color class is tricky in Tailwind without safelisting.
    // Instead, we will rely on the HeatMap's default scale or allow injection.
    
    // For now, let's use the HeatMap's default scale but strictly mapped to 0-100
    if (value >= 100) return 'bg-green-500';
    if (value >= 75) return 'bg-green-400';
    if (value >= 50) return 'bg-green-300';
    if (value > 0) return 'bg-green-200';
    return 'bg-gray-100 dark:bg-white/5';
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-secondary uppercase tracking-wide">
          Consistency
        </span>
        <span className="text-xs text-secondary opacity-70">
          Last 90 Days
        </span>
      </div>
      
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <HeatMap
          data={data.values}
          startDate={startDate}
          endDate={endDate}
          size={14} // Slightly smaller squares for density
          className="justify-start pb-2"
          colorScale={colorScale}
        />
      </div>
    </div>
  );
};
