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

  const { value, label, unit = '', trend, trendDirection = 'neutral' } = data;

  // Flame Icon SVG
  const FlameIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.38-1.12-2.5-2.5-2.5 0-.7.7-1.33 1.5-1.75C13.5 10 14 9 14 8c0-2.5-2-3.5-2.5-4C10 5.5 8 8 8 10c0 1.5 1 3 2 4 .5.5.5 1.5 0 2z"/>
    </svg>
  );

  return (
    <div className="flex flex-col h-full w-full justify-center items-center relative p-1" style={{ aspectRatio: '1/1' }}>
      <div className="absolute top-3 right-3 text-xs font-bold text-secondary">
        {label}
      </div>

      <div className="flex items-center gap-2">
          <FlameIcon />
          <span className="text-5xl font-bold tracking-tight">
            {value}
          </span>
      </div>

      {unit && (
        <span className="text-xs text-secondary font-bold uppercase tracking-wider mt-1">
          {unit}
        </span>
      )}
    </div>
  );
};
