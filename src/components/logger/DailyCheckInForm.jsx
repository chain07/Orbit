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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {metrics.map(metric => (
          <MetricInput
            key={metric.key}
            metric={metric}
            value={entries[metric.key] || ''}
            onChange={(val) => handleChange(metric.key, val)}
          />
        ))}
        <button type="submit" className="py-2 px-4 rounded bg-blue text-white font-bold">
          Save Check-In
        </button>
      </form>
    </Glass>
  );
};
