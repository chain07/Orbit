import React from 'react';
import { RingChart } from '../ui/charts/RingChart';

/**
 * ReliabilityRing Widget
 * * Displays a metric's progress as a ring chart.
 * Expected data structure:
 * {
 * value: number (0-100),
 * label: string,
 * color: string
 * }
 */
export const ReliabilityRing = ({ data }) => {
  // Guard clause for missing data
  if (!data) return null;

  const { value = 0, label = '', color = '#4f46e5' } = data;

  return (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: '12px', left: '14px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', zIndex: 2 }}>
        {label}
      </div>

      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '16px' }}>
          <RingChart
            value={value}
            size={140}
            strokeWidth={12}
            color={color}
            label={null}
          />
          <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              paddingTop: '16px'
          }}>
              <span style={{ fontSize: '24px', fontWeight: '800', fill: 'var(--text-primary)' }}>
                {Math.round(value)}%
              </span>
          </div>
      </div>
    </div>
  );
};
