import React from 'react';
import { Icons } from '../ui/Icons';

/**
 * CurrentStreak Widget
 * * Displays the current active streak for a metric.
 * * Refactored Phase 4.12: Atomic Visual Fixes (Header Positioning).
 */
export const CurrentStreak = ({ data, title }) => {
  if (!data) return null;

  const { current = 0, unit = 'Days' } = data;

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Atomic Header Fix: Strict Positioning */}
      <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            margin: 0,
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: 'var(--secondary)',
            zIndex: 20
      }}>
        {title || data.label || 'Streak'}
      </div>

      {/* Flame Icon - Top Right - Solid Orange */}
      <div style={{
          position: 'absolute',
          top: '16px',
          right: '20px',
          zIndex: 10
      }}>
          <Icons.Flame size={24} color="#FF9500" fill="#FF9500" style={{ opacity: 1 }} />
      </div>

      {/* Data Group - Bottom Right */}
      <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '20px',
          textAlign: 'right',
          zIndex: 10
      }}>
        <div style={{
            fontSize: '64px', // Increased size
            fontWeight: '800',
            lineHeight: '0.9',
            letterSpacing: '-2px',
            color: 'var(--text-primary)' // Dynamic text color
        }}>
            {current}
        </div>
        <div style={{
            fontSize: '14px', // Increased size
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
