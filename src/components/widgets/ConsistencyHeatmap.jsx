import React, { useMemo } from 'react';
import { HeatMap } from '../ui/charts/Heatmap';
import { dateUtils } from '../../lib/dateUtils';

/**
 * ConsistencyHeatmap Widget
 * * Displays a contribution-graph style heatmap.
 * Expected data structure:
 * {
 * values: { [date]: number }, // 0-1 values
 * startDate: string (YYYY-MM-DD),
 * endDate: string (YYYY-MM-DD),
 * color: string
 * }
 */
export const ConsistencyHeatmap = ({ data }) => {
  if (!data || !data.values) return null;

  // Default to last 35 days (7x5 grid)
  const { startDate, endDate } = useMemo(() => {
    if (data.startDate && data.endDate) {
      return { startDate: data.startDate, endDate: data.endDate };
    }
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 34); // 35 days total (including today)
    return {
      startDate: dateUtils.formatDate(start),
      endDate: dateUtils.formatDate(end)
    };
  }, [data.startDate, data.endDate]);

  // Custom color scale
  const colorScale = (value) => {
    if (value === null || value === undefined || value === 0) return 'bg-gray-100 dark:bg-white/5';
    
    // Check if it's potentially a non-boolean scalar (e.g. 5, 8, or 100) or normalized
    // If it's effectively > 0, we color it.
    if (value > 0) {
        // Simple heuristic: if it's big, it's 100%. If normalized 0-1, map to buckets.
        const n = value > 1 ? value / 100 : value; // normalize to 0-1 if > 1

        if (n >= 0.8) return 'bg-green-500';
        if (n >= 0.5) return 'bg-green-400';
        if (n >= 0.2) return 'bg-green-300';
        return 'bg-green-200';
    }
    return 'bg-gray-100 dark:bg-white/5';
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-secondary uppercase tracking-wide">
          Consistency
        </span>
        <span className="text-xs text-secondary opacity-70">
          Last 5 Weeks
        </span>
      </div>
      
      <div className="flex-1 overflow-hidden flex items-center justify-center">
        <HeatMap
          data={data.values}
          startDate={startDate}
          endDate={endDate}
          size={16}
          className="justify-center"
          colorScale={colorScale}
        />
      </div>
    </div>
  );
};
