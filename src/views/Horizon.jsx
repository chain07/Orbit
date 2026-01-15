import React, { useContext, useState } from 'react';
import { StorageContext } from '../context/StorageContext';
import { WidgetEngine } from '../engine/WidgetEngine';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Glass } from '../components/ui/Glass';
import { getWidgetComponent } from '../components/widgets/WidgetRegistry';

export const Horizon = () => {
  const { metrics, logEntries } = useContext(StorageContext);

  // State for time window filtering
  const [segment, setSegment] = useState('Weekly');
  const segments = ['Daily', 'Weekly', 'Monthly'];

  // Initialize widgets (passing segment ensures data updates when you toggle Daily/Weekly)
  const widgets = WidgetEngine.generateWidgets 
    ? WidgetEngine.generateWidgets(metrics, logEntries, segment) 
    : [];

  return (
    <div className="flex flex-col gap-4 p-4">
      
      {/* Segmented Control for Horizon */}
      <SegmentedControl
        options={segments}
        selected={segment}
        onSelect={setSegment}
      />

      {/* Widgets Grid */}
      <div className="widget-grid">
        {widgets.map((widget, idx) => {
          // 1. Dynamic Component Lookup
          const WidgetComponent = getWidgetComponent(widget.type);

          return (
            <Glass key={widget.id || idx}>
              {/* 2. Render the specific widget, passing the data object directly */}
              <WidgetComponent data={widget.data} />
            </Glass>
          );
        })}
      </div>
    </div>
  );
};
