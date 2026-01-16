import React, { useContext } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { Glass } from '../../components/ui/Glass';

export const Timeline = () => {
  const { logEntries, metrics } = useContext(StorageContext);
  
  // Refactored to use standard metricId mapping
  const metricMap = metrics.reduce((acc, m) => ({ ...acc, [m.id]: m }), {});

  const sortedLogs = [...logEntries].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="flex flex-col gap-3">
      {sortedLogs.length === 0 ? (
        <div className="text-center text-secondary py-4 italic text-sm">
          No logs found for today.
        </div>
      ) : (
        sortedLogs.map((log, idx) => {
          // Lookup using metricId strictly
          const metric = metricMap[log.metricId];
          return (
            <Glass key={idx}>
              <div className="flex justify-between">
                <span className="font-bold">{metric?.label || 'Unknown Metric'}</span>
                <span className="font-mono">{log.value}</span>
              </div>
              <div className="text-xs text-secondary mt-1">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </Glass>
          );
        })
      )}
    </div>
  );
};
