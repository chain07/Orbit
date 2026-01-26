import React, { useContext, useState } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { MetricInput } from './MetricInput';

export const DailyCheckInForm = () => {
  const { metrics, addLogEntry } = useContext(StorageContext);
  const [entries, setEntries] = useState({});
  const [status, setStatus] = useState('idle'); // 'idle' | 'success'

  const handleChange = (metricId, value) => {
    setEntries(prev => ({ ...prev, [metricId]: value }));
    if (status === 'success') setStatus('idle');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty entries
    const validEntries = Object.entries(entries).filter(([_, value]) => 
      value !== '' && value !== null && value !== undefined
    );

    if (validEntries.length === 0) return;

    // Submit entries with Type Parsing
    validEntries.forEach(([metricId, value]) => {
      const metric = metrics.find(m => m.id === metricId);
      let parsedValue = value;

      if (metric) {
          if (metric.type === 'number' || metric.type === 'range') {
              parsedValue = parseFloat(value);
          } else if (metric.type === 'boolean') {
              parsedValue = value === true || value === 'true'; // Handle string/bool
          }
      }

      addLogEntry({ 
        metricId,
        value: parsedValue,
        timestamp: new Date() 
      });
    });

    setEntries({});
    setStatus('success');
    
    // Temporary feedback
    // alert('Saved'); // Removed per request for better UI feedback

    setTimeout(() => {
      setStatus('idle');
    }, 2000);
  };

  if (metrics.length === 0) {
      return (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              No metrics configured.
          </div>
      );
  }

  return (
    <div style={{
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        paddingBottom: '40px'
    }}>
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {metrics.map((metric, index) => (
                    <div key={metric.id} style={{ marginTop: index === 0 ? 0 : undefined }}>
                        <MetricInput
                            metric={metric}
                            value={entries[metric.id]}
                            onChange={(val) => handleChange(metric.id, val)}
                        />
                    </div>
                ))}
            </div>

            {/* Standard Bottom Button (No FAB) */}
            <button
                type="submit"
                disabled={status === 'success'}
                style={{
                    width: '100%',
                    height: '50px',
                    borderRadius: '14px',
                    backgroundColor: status === 'success' ? '#34C759' : '#007AFF',
                    color: '#FFF',
                    fontSize: '17px',
                    fontWeight: '600',
                    marginTop: '32px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                }}
            >
                {status === 'success' ? 'Check-In Saved' : 'Save Check-In'}
            </button>
        </form>
    </div>
  );
};
