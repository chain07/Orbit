import React from 'react';
import { Icons } from '../ui/Icons';

/**
 * CurrentStreak Widget
 * * Displays the current active streak for a metric.
 * * Refactored Phase 4.9.1: Flame Top-Right, Data Bottom-Right.
 */
export const CurrentStreak = ({ data, title }) => {
  if (!data) return null;

  const { current = 0, unit = 'Days' } = data;

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Standard Header */}
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
        {data.label || title || 'Streak'}
      </div>

      {/* Flame Icon - Top Right */}
      <div style={{
          position: 'absolute',
          top: '14px',
          right: '16px',
          zIndex: 10
      }}>
          <Icons.Flame size={20} color="#FF9500" fill="#FF9500" />
      </div>

      {/* Data Group - Bottom Right */}
      <div style={{
          position: 'absolute',
          bottom: '14px',
          right: '16px',
          textAlign: 'right',
          zIndex: 10
      }}>
        <div style={{
            fontSize: '58px',
            fontWeight: '800',
            lineHeight: '0.9',
            letterSpacing: '-2px',
            color: '#1C1C1E'
        }}>
            {current}
        </div>
        <div style={{
            fontSize: '11px',
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
