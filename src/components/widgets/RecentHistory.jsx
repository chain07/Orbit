import React from 'react';
import { dateUtils } from '../../lib/dateUtils'; // Assuming utility exists, or we use native Date

/**
 * RecentHistory Widget
 * * Lists the last N entries for a metric.
 * * Expected data structure:
 * {
 * entries: Array<{
 * id: string,
 * value: number,
 * timestamp: string,
 * note: string (optional)
 * }>,
 * unit: string
 * }
 */
export const RecentHistory = ({ data }) => {
  if (!data || !data.entries) return null;

  const { entries = [], unit = '' } = data;
  const recentItems = entries.slice(0, 5); // Max 5 items

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="text-sm font-bold text-secondary uppercase tracking-wide mb-3">
        Recent Activity
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {recentItems.length === 0 ? (
          <div className="text-sm text-secondary italic opacity-60 text-center py-4">
            No recent activity
          </div>
        ) : (
          recentItems.map((entry, idx) => (
            <div 
              key={entry.id || idx} 
              className="flex justify-between items-center py-2 border-b border-separator border-opacity-10 last:border-0"
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-secondary">
                  {formatDate(entry.timestamp)}
                </span>
                <span className="text-[10px] text-secondary opacity-60">
                  {formatTime(entry.timestamp)}
                </span>
              </div>
              
              <div className="font-mono font-medium text-sm">
                {entry.value} <span className="text-xs text-secondary">{unit}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
