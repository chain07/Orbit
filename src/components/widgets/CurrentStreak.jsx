import React from 'react';

/**
 * CurrentStreak Widget
 * * Displays the current active streak for a metric.
 * * Refactored Phase 4.13: Icon Removal, Standard Layout, Global Color Fix.
 */
export const CurrentStreak = ({ data, title }) => {
  if (!data) return null;

  const { current = 0, unit = 'Days' } = data;

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Strict Header (Standard Top-Left) */}
      <div style={{
            position: 'absolute',
            top: '16px', // Standard Top
            left: '20px', // Standard Left
            margin: 0,
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)', // Global Fix
            zIndex: 20
      }}>
        {title || data.label || 'Streak'}
      </div>

      {/* Flame Icon REMOVED per Phase 4.13 */}

      {/* Data Group - Bottom Left */}
      <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
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
