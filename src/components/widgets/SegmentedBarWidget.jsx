import React from 'react';
import { StackedBar } from '../ui/charts/StackedBar';

/**
 * SegmentedBarWidget
 * Wrapper around StackedBar for displaying categorical distributions.
 * * Expected Data Prop Structure:
 * {
 * title: "Metric Distribution",
 * entries: [
 * { label: "Mon", values: { CategoryA: 2, CategoryB: 5 } },
 * { label: "Tue", values: { CategoryA: 3, CategoryB: 4 } }
 * ],
 * colors: { CategoryA: "#...", CategoryB: "#..." }
 * }
 */
export const SegmentedBarWidget = ({ data }) => {
  if (!data || !data.entries || data.entries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-secondary italic opacity-50">
        No data available
      </div>
    );
  }
  
  const { title = 'Distribution', entries, colors = {} } = data;

  return (
    <div className="flex flex-col w-full">
      <div className="text-sm font-bold text-secondary uppercase tracking-wide mb-4">
        {title}
      </div>
      <div className="w-full">
        {/* StackedBar handles its own height/layout */}
        <StackedBar
          data={entries}
          colors={colors}
          height={180} 
        />
      </div>
    </div>
  );
};
