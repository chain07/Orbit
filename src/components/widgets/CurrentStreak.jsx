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

  const { current = 0, best = 0, isActive = false, unit = 'Days' } = data;

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', zIndex: 2 }}>
        {data.label || title || 'Streak'}
      </div>

      {/* Background Icon */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1, pointerEvents: 'none' }}>
        <Icons.Flame size={80} className="text-orange" fill="currentColor" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
        <span style={{ fontSize: '64px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
          {current}
        </span>
        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.1em' }}>
          {unit}
        </span>
      </div>
    </div>
  );
};
