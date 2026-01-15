import React from 'react';
[span_1](start_span)// CRITICAL FIX: Update import to point to charts directory[span_1](end_span)
import { StackedBar } from '../ui/charts/StackedBar';

/**
 * SegmentedBarWidget
 * * Displays categorical data distribution over time.
 * * Wraps the complex StackedBar UI primitive.
 * * Expected data structure:
 * {
 * title: string,
 * entries: Array<{ label: string, values: { [category]: number } }>,
 * colors: { [category]: string }
 * }
 */
export const SegmentedBarWidget = ({ data }) => {
  if (!data || !data.entries) return null;

  const { title = 'Distribution', entries = [], colors = {} } = data;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="text-sm font-bold text-secondary uppercase tracking-wide mb-2">
        {title}
      </div>

      <div className="flex-1 w-full">
        <StackedBar
          data={entries}
          colors={colors}
          height={180} // Fixed height for widget context
          width={null} // Let container define width
        />
      </div>
    </div>
  );
};
