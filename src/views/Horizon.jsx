// src/views/Horizon.jsx
import React, { useContext } from 'react';
import { StorageContext } from '../context/StorageContext';
import { WidgetEngine } from '../engine/WidgetEngine';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { RingChart } from '../components/ui/RingChart';
import { HeatMap } from '../components/ui/HeatMap';
import { Sparkline } from '../components/ui/Sparkline';
import { StackedBar } from '../components/ui/StackedBar';
import { Glass } from '../components/ui/Glass';

export const Horizon = () => {
  const { metrics, logEntries } = useContext(StorageContext);

  // Initialize widgets
  const widgets = WidgetEngine.generateWidgets(metrics, logEntries);

  // Example segmented control options
  const [segment, setSegment] = React.useState('Weekly');
  const segments = ['Daily', 'Weekly', 'Monthly'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      
      {/* Segmented Control for Horizon */}
      <SegmentedControl
        options={segments}
        selected={segment}
        onSelect={setSegment}
      />

      {/* Widgets Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16
      }}>
        {widgets.map((widget, idx) => {
          const { type, data, title } = widget;

          // Wrap each widget in Glass container for styling
          return (
            <Glass key={idx}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
                {type === 'ring' && <RingChart value={data.value} label={data.label} />}
                {type === 'heatmap' && <HeatMap data={data.values} startDate={data.start} endDate={data.end} />}
                {type === 'sparkline' && <Sparkline data={data.values} />}
                {type === 'stackedbar' && <StackedBar data={data.entries} colors={data.colors} />}
              </div>
            </Glass>
          );
        })}
      </div>
    </div>
  );
};
