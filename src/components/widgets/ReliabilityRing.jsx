import React from 'react';
import { RingChart } from '../ui/charts/RingChart';

/**
 * ReliabilityRing Widget
 * * Displays a metric's progress as a ring chart.
 * * Refactored Phase 4.9.1: Global Header.
 */
export const ReliabilityRing = ({ data }) => {
  if (!data) return null;

  const { value = 0, label = '' } = data;

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
      {/* Global Standard Header */}
      <div style={{
          position: 'absolute',
          top: '16px',
          left: '20px',
          fontSize: '15px',
          fontWeight: '600',
          letterSpacing: '-0.3px',
          color: 'var(--text-primary)',
          zIndex: 10
      }}>
        {label}
      </div>

      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '16px' }}>
          <RingChart
            value={value}
            size={140}
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
              paddingTop: '16px'
          }}>
              <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {Math.round(value)}%
              </span>
          </div>
      </div>
    </div>
  );
};
