import React, { useContext, useState } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { MetricInput } from './MetricInput';
import { Glass } from '../../components/ui/Glass';

export const DailyCheckInForm = () => {
  const { metrics, addLogEntry } = useContext(StorageContext);
  const [entries, setEntries] = useState({});

  const handleChange = (metricKey, value) => {
    setEntries(prev => ({ ...prev, [metricKey]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Object.entries(entries).forEach(([key, value]) => {
      if (value !== '' && value != null) {
        addLogEntry({ metricKey: key, value, timestamp: new Date() });
      }
    });
    setEntries({});
    alert('Daily check-in saved!');
  };

  return (
    <Glass>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {metrics.map(metric => (
          <MetricInput
            key={metric.key}
            metric={metric}
            value={entries[metric.key] || ''}
            onChange={(val) => handleChange(metric.key, val)}
          />
        ))}
        <button type="submit">Save Check-In</button>
      </form>
    </Glass>
  );
};
