import React from 'react';

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
      <div style={{ position: 'absolute', top: '12px', left: '14px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', zIndex: 2 }}>
        {title || 'Streak'}
      </div>

      {/* Background Icon */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isActive ? 0.1 : 0.05, pointerEvents: 'none' }}>
        <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" className={isActive ? "text-orange" : "text-gray-400"}>
           <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.38-1.12-2.5-2.5-2.5 0-.7.7-1.33 1.5-1.75C13.5 10 14 9 14 8c0-2.5-2-3.5-2.5-4C10 5.5 8 8 8 10c0 1.5 1 3 2 4 .5.5.5 1.5 0 2z"/>
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
        <span style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
          {current}
        </span>
        <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '4px' }}>
          {unit}
        </span>
      </div>
    </div>
  );
};
