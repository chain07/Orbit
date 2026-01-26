import React from 'react';
import { WidgetDataEngine } from '../../engine/WidgetDataEngine';

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
      padding: '20px',
      paddingTop: '50px', // Clear header
      boxSizing: 'border-box'
    }}>
      {/* Strict Header */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '20px',
        margin: 0,
        fontSize: '15px',
        fontWeight: '600',
        color: 'var(--text-secondary)', // #8E8E93
        zIndex: 10,
        letterSpacing: '-0.3px'
      }}>
        {title}
      </div>

      <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          height: '100%',
          overflowY: 'auto'
      }}>
        {sorted.length === 0 ? (
           <div className="flex items-center justify-center h-full text-xs text-secondary opacity-60">
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
                          backgroundColor: 'var(--bg-color)',
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
