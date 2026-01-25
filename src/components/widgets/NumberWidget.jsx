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

  // Determine trend color
  const getTrendColor = () => {
    if (trendDirection === 'up') return 'text-green';
    if (trendDirection === 'down') return 'text-red';
    return 'text-secondary';
  };

  const trendIcon = trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '→';

  return (
    <div className="flex flex-col h-full w-full justify-between p-1 aspect-square">
      <div className="text-sm font-bold text-secondary uppercase tracking-wide">
        {label}
      </div>

      <div className="flex flex-col gap-1 my-auto">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-lg text-secondary font-medium">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Footer / Trend Info */}
      {trend != null && (
        <div className={`flex items-center gap-1 text-xs font-bold ${getTrendColor()}`}>
          <span>{trendIcon}</span>
          <span>{Math.abs(trend)}%</span>
          <span className="text-secondary font-medium opacity-70 ml-1">vs last period</span>
        </div>
      )}
    </div>
  );
};
