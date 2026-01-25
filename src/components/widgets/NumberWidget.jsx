import React from 'react';

/**
 * NumberWidget
 * * Displays a single key metric value with an optional trend indicator.
 * * Expected data structure:
 * {
 * value: number | string,
 * label: string,
 * unit: string, (optional prefix/suffix)
 * trend: number, (optional percentage change)
 * trendDirection: 'up' | 'down' | 'neutral'
 * }
 */
export const NumberWidget = ({ data }) => {
  if (!data) return null;

  const { value, label, unit = '' } = data;

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Standard Header */}
      <div style={{ position: 'absolute', top: '14px', left: '16px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', zIndex: 10 }}>
        {label}
      </div>

      {/* Background Icon - Kept for visual interest, adjusted opacity */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.05, pointerEvents: 'none' }}>
        <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" className="text-secondary">
           <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.38-1.12-2.5-2.5-2.5 0-.7.7-1.33 1.5-1.75C13.5 10 14 9 14 8c0-2.5-2-3.5-2.5-4C10 5.5 8 8 8 10c0 1.5 1 3 2 4 .5.5.5 1.5 0 2z"/>
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <span style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
            {value}
          </span>
          {unit && (
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '4px' }}>
              {unit}
            </span>
          )}
      </div>
    </div>
  );
};
