import React from 'react';
import { Icons } from '../ui/Icons';

/**
 * CurrentStreak Widget
 * * Displays the current active streak for a metric.
 * * Refactored Phase 4.95: Visual Polish (Icon Inline).
 */
export const CurrentStreak = ({ data, title }) => {
  if (!data) return null;

  const { current = 0, unit = 'Days' } = data;

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Header Container: Inline Icon & Label */}
      <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            position: 'absolute',
            top: '16px', // Increased from 12px for breathing room
            left: '20px', // Increased from 12px
            zIndex: 20
      }}>
        {/* Flame Icon */}
        <Icons.Flame size={16} color="#FF9500" fill="#FF9500" style={{ opacity: 1 }} />

        {/* Label */}
        <div style={{
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: 'var(--secondary)',
            margin: 0
        }}>
            {title || data.label || 'Streak'}
        </div>
      </div>

      {/* Data Group - Bottom Left */}
      <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px', // Moved to left
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
