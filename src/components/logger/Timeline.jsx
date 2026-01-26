import React, { useContext, useMemo } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { Glass } from '../../components/ui/Glass';

export const Timeline = () => {
  const { logEntries, metrics } = useContext(StorageContext);
  
  const metricMap = metrics.reduce((acc, m) => ({ ...acc, [m.id]: m }), {});

  const groupedLogs = useMemo(() => {
      const groups = {};
      [...logEntries].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .forEach(log => {
          const dateKey = new Date(log.timestamp).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
          if (!groups[dateKey]) groups[dateKey] = [];
          groups[dateKey].push(log);
      });
      return groups;
  }, [logEntries]);

  if (logEntries.length === 0) {
      return (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px', fontStyle: 'italic', fontSize: '14px', opacity: 0.6 }}>
          No logs recorded yet.
        </div>
      );
  }

  return (
      <div style={{ paddingBottom: '80px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(groupedLogs).map(([date, logs], groupIdx) => (
              <details key={date} open={groupIdx === 0} style={{ width: '100%' }}>
                  <summary style={{
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: '800',
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      userSelect: 'none',
                      position: 'sticky',
                      top: 0,
                      backgroundColor: 'var(--bg-color)',
                      zIndex: 10,
                      borderBottom: '1px solid var(--separator)',
                      listStyle: 'none' // Hide default arrow
                  }}>
                      {date}
                  </summary>

                  <div style={{
                      backgroundColor: 'var(--card-bg)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      marginTop: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                      {logs.map((log, idx) => {
                          const metric = metricMap[log.metricId];
                          const isLast = idx === logs.length - 1;
                          return (
                              <div
                                key={log.id || idx}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '16px',
                                    backgroundColor: 'var(--card-bg)',
                                    borderBottom: !isLast ? '1px solid var(--separator)' : 'none'
                                }}
                              >
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '15px' }}>
                                        {metric?.label || 'Unknown Metric'}
                                      </span>
                                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                  </div>
                                  <div style={{
                                      fontFamily: 'ui-monospace, monospace',
                                      fontWeight: '600',
                                      color: 'var(--text-primary)',
                                      backgroundColor: 'var(--bg-secondary)',
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      fontSize: '14px'
                                  }}>
                                      {typeof log.value === 'boolean' ? (log.value ? 'Done' : 'Missed') : log.value}
                                      {metric?.unit ? <span style={{ color: 'var(--text-secondary)', marginLeft: '4px', fontSize: '12px' }}>{metric.unit}</span> : ''}
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </details>
          ))}
      </div>
  );
};
