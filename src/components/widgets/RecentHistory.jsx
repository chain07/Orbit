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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', padding: '16px' }}>
      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
        History
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {recentItems.length === 0 ? (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', opacity: 0.6 }}>
            No recent entries
          </div>
        ) : (
          recentItems.map((entry, idx) => (
            <div 
              key={entry.id || idx} 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                {formatDate(entry.timestamp)}
              </span>
              
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {entry.value} {unit}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
