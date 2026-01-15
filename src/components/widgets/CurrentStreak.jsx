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
export const CurrentStreak = ({ data }) => {
  if (!data) return null;

  const { current = 0, best = 0, isActive = false, unit = 'Days' } = data;

  return (
    <div className="flex flex-col h-full w-full justify-center items-center py-2">
      {/* Icon / Status Indicator */}
      <div className={`mb-2 text-2xl ${isActive ? 'opacity-100' : 'opacity-40 grayscale'}`}>
        🔥
      </div>

      {/* Main Counter */}
      <div className="flex flex-col items-center">
        <span className="text-4xl font-bold tracking-tight">
          {current}
        </span>
        <span className="text-sm font-bold text-secondary uppercase tracking-wider mt-1">
          {unit}
        </span>
      </div>

      {/* Best Streak Context */}
      {best > 0 && (
        <div className="mt-4 py-1 px-3 rounded-full bg-separator bg-opacity-20 text-xs font-medium text-secondary">
          Best: {best} {unit}
        </div>
      )}
    </div>
  );
};
