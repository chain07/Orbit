// src/views/Intel.jsx
import React, { useContext, useState } from 'react';
import { StorageContext } from '../context/StorageContext';
import { WidgetEngine } from '../engine/WidgetEngine';
import { HorizonAgent } from '../lib/horizonAgent';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Glass } from '../components/ui/Glass';
import { RingChart } from '../components/ui/RingChart';
import { HeatMap } from '../components/ui/HeatMap';
import { Sparkline } from '../components/ui/Sparkline';
import { StackedBar } from '../components/ui/StackedBar';

export const Intel = () => {
  const { metrics, logEntries } = useContext(StorageContext);

  const [segment, setSegment] = useState('Weekly');
  const segments = ['Daily', 'Weekly', 'Monthly'];

  // Generate insights using Horizon Agent
  const insights = HorizonAgent.generateAllInsights(metrics, logEntries, segment);

  // Optionally generate visual widget data
  const widgets = WidgetEngine.generateWidgets(metrics, logEntries, segment);

  return (
    <div className="flex flex-col gap-4 p-4">
      
      {/* Segment Filter */}
      <SegmentedControl
        options={segments}
        selected={segment}
        onSelect={setSegment}
      />

      {/* Insights */}
      {insights.map((insight, idx) => (
        <Glass key={idx}>
          <div className="flex flex-col gap-2">
            <div className="text-lg font-bold">{insight.title}</div>
            <div className="text-sm text-secondary opacity-70">{insight.summary}</div>
          </div>
        </Glass>
      ))}

      {/* Widgets */}
      <div className="widget-grid">
        {widgets.map((widget, idx) => {
          const { type, data, title } = widget;
          return (
            <Glass key={idx}>
              <div className="flex flex-col gap-3">
                <div className="text-lg font-bold">{title}</div>
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
