import React from 'react';
import { Icons } from '../ui/Icons';

/**
 * CurrentStreak Widget
 * * Displays the current active streak for a metric.
 * * Visual emphasis on the counter.
 * * Expected data structure:
 * {
 * current: number,
 * best: number, (optional)
 * isActive: boolean, (did they do it today?)
 * unit: string (e.g., "days")
 * }
 */
export const CurrentStreak = ({ data, title }) => {
  if (!data) return null;

  const { current = 0, unit = 'Days' } = data;

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Standard Header */}
      <div style={{ position: 'absolute', top: '14px', left: '16px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', zIndex: 10 }}>
        {data.label || title || 'Streak'}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '56px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
            {current}
            </span>
            <Icons.Flame size={24} color="#FF9500" fill="#FF9500" style={{ marginTop: '8px' }} />
        </div>
        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '1px' }}>
          {unit}
        </span>
      </div>
    </div>
  );
};
