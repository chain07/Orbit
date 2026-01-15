import React, { useContext } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { Glass } from '../../components/ui/Glass';

export const Timeline = () => {
  const { logs, metrics } = useContext(StorageContext);

  const metricMap = metrics.reduce((acc, m) => ({ ...acc, [m.key]: m }), {});

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {sortedLogs.map((log, idx) => {
        const metric = metricMap[log.metricKey];
        return (
          <Glass key={idx}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{metric?.label || log.metricKey}</span>
              <span>{log.value}</span>
            </div>
            <div style={{ fontSize: 10, color: '#888' }}>
              {new Date(log.timestamp).toLocaleString()}
            </div>
          </Glass>
        );
      })}
    </div>
  );
};
