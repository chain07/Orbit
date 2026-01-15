import { ReliabilityRing } from './ReliabilityRing';
import { TrendSparkline } from './TrendSparkline';
import { ConsistencyHeatmap } from './ConsistencyHeatmap';
import { StackedBarWidget } from './StackedBarWidget'; // We'll add a placeholder for this

// The Registry Object mapping 'type' strings to Components
export const WidgetRegistry = {
  ring: ReliabilityRing,
  sparkline: TrendSparkline,
  heatmap: ConsistencyHeatmap,
  stackedbar: StackedBarWidget,
  // Fallback for unknown types
  default: ({ data }) => <div className="p-4 text-secondary">Unknown Widget Type: {data?.type}</div>
};

// Helper function to get the correct component
export const getWidgetComponent = (type) => {
  return WidgetRegistry[type] || WidgetRegistry.default;
};
