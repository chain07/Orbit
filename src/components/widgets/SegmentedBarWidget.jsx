import React from 'react';
// FIX: Correct import path relative to widgets folder
import { StackedBar } from '../ui/charts/StackedBar';

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
          height={180}
          width={null} // Let container control width
        />
      </div>
    </div>
  );
};
