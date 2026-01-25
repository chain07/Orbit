import React, { useContext, useMemo } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { Glass } from '../../components/ui/Glass';

export const Timeline = () => {
  const { logEntries, metrics } = useContext(StorageContext);
  
  // Refactored to use standard metricId mapping
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
        <div className="text-center text-secondary py-8 italic text-sm opacity-60">
          No logs recorded yet.
        </div>
      );
  }

  return (
      <Glass className="p-0 overflow-hidden">
        <div className="flex flex-col gap-6 pb-20 pt-4">
          {Object.entries(groupedLogs).map(([date, logs]) => (
              <div key={date} className="flex flex-col gap-2">
                  <div className="text-xs font-bold text-secondary uppercase tracking-wide px-4 sticky top-0 bg-bg-color z-10 py-2 border-b border-separator/50">
                      {date}
                  </div>
                  <div className="bg-card overflow-hidden mx-0">
                      {logs.map((log, idx) => {
                          const metric = metricMap[log.metricId];
                          const isLast = idx === logs.length - 1;
                          return (
                              <div
                                key={log.id || idx}
                                className={`flex justify-between items-center p-4 bg-card ${!isLast ? 'border-b border-separator/50' : ''}`}
                              >
                                  <div className="flex flex-col gap-1">
                                      <span className="font-semibold text-primary">{metric?.label || 'Unknown Metric'}</span>
                                      <span className="text-xs text-secondary">
                                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                  </div>
                                  <div className="font-mono font-medium text-primary bg-bg-color px-2 py-1 rounded text-sm">
                                      {typeof log.value === 'boolean' ? (log.value ? 'Done' : 'Missed') : log.value}
                                      {metric?.unit ? <span className="text-secondary ml-1 text-xs">{metric.unit}</span> : ''}
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          ))}
        </div>
      </Glass>
  );
};
