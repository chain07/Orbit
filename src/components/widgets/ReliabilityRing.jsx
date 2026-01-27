import React from 'react';
import { RingChart } from '../ui/charts/RingChart';

/**
 * ReliabilityRing Widget
 * * Displays a metric's progress as a ring chart.
 * * Refactored Phase 4.13: Global Color Fix (text-secondary).
 */
export const ReliabilityRing = ({ data, title }) => {
  if (!data) return null;

  const { value = 0 } = data;

  // Traffic Light Logic
  let ringColor = '#34C759'; // Green (76-100)
  if (value <= 25) ringColor = '#FF3B30'; // Red
  else if (value <= 50) ringColor = '#FF9500'; // Orange
  else if (value <= 75) ringColor = '#FFCC00'; // Yellow

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
      {/* Strict Header */}
      <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            margin: 0,
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)', // Global Fix
            zIndex: 20
      }}>
        {title || data.label}
      </div>

      {/* Ring Container with padding to clear header and reduced size */}
      <div style={{
          position: 'relative',
          width: '80%',
          height: '80%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '20px'
      }}>
          <RingChart
            value={value}
            size={120}
            strokeWidth={12}
            color={ringColor}
            label={null}
          />
          <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              paddingTop: '20px'
          }}>
              <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {Math.round(value)}%
              </span>
          </div>
      </div>
    </div>
  );
};
