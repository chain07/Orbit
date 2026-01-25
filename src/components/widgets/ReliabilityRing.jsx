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
        width: '100%'
    }}>
      <div style={{ position: 'relative', width: '110px', height: '110px' }}>
          <RingChart
            value={value}
            size={110}
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
              pointerEvents: 'none'
          }}>
              <span style={{ fontSize: '18px', fontWeight: '700', fill: 'var(--text-primary)' }}>
                {Math.round(value)}%
              </span>
          </div>
      </div>
      <div style={{
          marginTop: '8px',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          fontWeight: '600',
          textTransform: 'uppercase'
      }}>
          {label}
      </div>
    </div>
  );
};
