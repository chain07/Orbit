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
    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', padding: '16px', alignItems: 'center', gap: '10px', height: '100%', width: '100%' }}>
        {/* Left Col: Data */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '32px', fontWeight: '700', lineHeight: '1', color: 'var(--text-primary)' }}>{Math.round(current)}%</span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Current</span>
        </div>
        {/* Right Col: SVG */}
        <div style={{ height: '50px', width: '100%' }}>
            <Sparkline
                data={values}
                width={200}
                height={50}
                lineColor={color}
                fillColor="transparent"
                strokeWidth={3}
                showDots={false}
                showLabels={false}
                preserveAspectRatio="none"
                className="w-full h-full"
            />
        </div>
    </div>
  );
};
