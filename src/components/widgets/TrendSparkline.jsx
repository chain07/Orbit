import React from 'react';
import { Sparkline } from '../ui/charts/Sparkline';

/**
 * TrendSparkline Widget
 * * Displays a rolling window trend for a metric.
 * Expected data structure:
 * {
 * values: number[] (normalized 0-1),
 * color: string,
 * label: string,
 * trendLabel: string (optional, e.g. "+5% vs last week")
 * }
 */
export const TrendSparkline = ({ data }) => {
  if (!data || !data.data) return null;

  const { data: values = [], current = 0, color = '#4f46e5', label = '', trendLabel = '' } = data;

  return (
    <div className="flex flex-col h-full w-full justify-between relative">
      <div className="absolute top-3 left-3 text-sm font-bold text-secondary uppercase tracking-wide z-10">
          {label}
      </div>
      
      <div className="absolute top-3 right-3 text-2xl font-bold z-10">
          {Math.round(current)}
      </div>

      <div className="w-full h-full absolute inset-0">
          <Sparkline
            data={values}
            width={300}
            height={100}
            lineColor={color}
            fillColor={color}
            strokeWidth={3}
            showDots={false}
            showLabels={false}
            className="w-full h-full"
          />
      </div>
    </div>
  );
};
