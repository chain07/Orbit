import React from 'react';

/**
 * RecentHistory Widget
 * * Lists the last N entries for a metric.
 */
export const RecentHistory = ({ data }) => {
  if (!data || !data.entries) return null;

  const { entries = [], unit = '' } = data;
  const recentItems = entries.slice(0, 5); // Max 5 items

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
      {/* Standard Header */}
      <div style={{ position: 'absolute', top: '14px', left: '16px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', zIndex: 10 }}>
        History
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '32px', overflowY: 'auto' }}>
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
