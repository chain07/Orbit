import React from 'react';

// Import all specific widget components
// Ensuring imports point to sibling files in the widgets directory
import { ReliabilityRing } from './ReliabilityRing';
import { TrendSparkline } from './TrendSparkline';
import { ConsistencyHeatmap } from './ConsistencyHeatmap';
import { CurrentStreak } from './CurrentStreak';
import { NumberWidget } from './NumberWidget';
import { RecentHistory } from './RecentHistory';
import { SegmentedBarWidget } from './SegmentedBarWidget';
import { CompoundBarWidget } from './CompoundBarWidget';
import { ProgressBarWidget } from './ProgressBarWidget';

/**
 * WidgetRegistry
 * Maps string identifiers (stored in JSON/database) to actual React Components.
 */
export const WidgetRegistry = {
  // Visual Charts
  ring: ReliabilityRing,
  sparkline: TrendSparkline,
  heatmap: ConsistencyHeatmap,
  stackedbar: SegmentedBarWidget,
  compound: CompoundBarWidget,
  progress: ProgressBarWidget,
  
  // Data Displays
  streak: CurrentStreak,
  number: NumberWidget,
  history: RecentHistory,
  
  // Fallback for development or broken types
  default: ({ data }) => (
    <div className="p-4 border border-dashed border-red rounded text-red text-sm">
      <strong>Widget Error:</strong> Unknown type "{data?.type || 'undefined'}"
    </div>
  )
};

/**
 * getWidgetComponent
 * Helper to safely retrieve a component.
 * @param {string} type - The widget type string (e.g., 'ring')
 * @returns {React.Component} - The corresponding component or the default fallback
 */
export const getWidgetComponent = (type) => {
  return WidgetRegistry[type] || WidgetRegistry.default;
};
