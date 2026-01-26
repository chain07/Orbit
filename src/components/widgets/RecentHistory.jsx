import React from 'react';

/**
 * RecentHistory Widget
 * * Displays a list of recent log entries for a metric.
 * * Refactored Phase 4.13: Global Color Fix.
 */
export const RecentHistory = ({ data, title }) => {
  // If data is just the raw array (from engine), use it.
  // Otherwise try to extract from typical structure
  const entries = Array.isArray(data) ? data : (data?.entries || []);

  // Sort by timestamp descending
  const sorted = [...entries].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      // No padding
      boxSizing: 'border-box'
    }}>
      {/* Strict Header */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        margin: 0,
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        color: 'var(--text-secondary)', // Global Fix
        zIndex: 20
      }}>
        {title || 'History'}
      </div>

      <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          height: '100%',
          overflowY: 'auto',
          padding: '40px 20px 20px 20px', // Top padding clears header
          boxSizing: 'border-box'
      }}>
        {sorted.length === 0 ? (
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.6 }}>
               No history yet
           </div>
        ) : (
            sorted.map((entry) => {
                const dateObj = new Date(entry.timestamp);
                const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                    <div
                      key={entry.id}
                      style={{
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: '10px',
                          padding: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '14px'
                      }}
                    >
                        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                            {dateStr} <span style={{ opacity: 0.5 }}>{timeStr}</span>
                        </span>
                        <span style={{ fontWeight: '500', color: 'var(--text-primary)', maxWidth: '60%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {String(entry.value)}
                        </span>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};
