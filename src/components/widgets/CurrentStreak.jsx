import React from 'react';

/**
 * CurrentStreak Widget
 * * Displays the current active streak for a metric.
 * * Refactored Phase 4.14: Value anchored to Bottom-Right.
 */
export const CurrentStreak = ({ data, title }) => {
  if (!data) return null;

  const { current = 0, unit = 'Days' } = data;

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Strict Header (Standard Top-Left) */}
      <div style={{
            position: 'absolute',
            top: '16px',
            left: '20px',
            margin: 0,
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            zIndex: 20
      }}>
        {title || data.label || 'Streak'}
      </div>

      {/* Data Group - Bottom Right */}
      <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '20px',
          textAlign: 'right',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          zIndex: 10
      }}>
        <div style={{
            fontSize: '72px',
            fontWeight: '800',
            lineHeight: '1',
            letterSpacing: '-2px',
            color: 'var(--text-primary)'
        }}>
            {current}
        </div>
        <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#FF9500',
            textTransform: 'uppercase',
            marginTop: '4px'
        }}>
            {unit}
        </div>
      </div>
    </div>
  );
};
