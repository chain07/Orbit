import React, { useContext, useState } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { MetricInput } from './MetricInput';

export const DailyCheckInForm = () => {
  const { metrics, addLogEntry } = useContext(StorageContext);
  const [entries, setEntries] = useState({});
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (metricId, value) => {
    setEntries(prev => ({ ...prev, [metricId]: value }));
    if (isSaved) setIsSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Filter out empty entries
    const validEntries = Object.entries(entries).filter(([_, value]) => 
      value !== '' && value !== null && value !== undefined
    );

    if (validEntries.length === 0) return;

    try {
        // Submit entries with Type Parsing & Valid Timestamp
        const promises = validEntries.map(async ([metricId, value]) => {
          const metric = metrics.find(m => m.id === metricId);
          let parsedValue = value;

          if (metric) {
              if (metric.type === 'number' || metric.type === 'range') {
                  parsedValue = parseFloat(value);
              } else if (metric.type === 'boolean') {
                  parsedValue = value === true || value === 'true';
              }
          }

          // Use a fixed timestamp for the batch to ensure consistency
          const timestamp = new Date().toISOString(); // CRITICAL FIX: Explicit ISO String

          return addLogEntry({
            metricId,
            value: parsedValue,
            timestamp
          });
        });

        await Promise.all(promises);

        setEntries({});
        setIsSaved(true);

        // Native feedback
        // alert('Check-in Saved!');

        setTimeout(() => {
          setIsSaved(false);
        }, 2000);
    } catch (e) {
        alert('Error saving: ' + e.message);
    }
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
        <form onSubmit={handleSave}>
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

            {/* Standard Bottom Button */}
            <button
                type="button"
                onClick={handleSave}
                disabled={isSaved}
                style={{
                    width: '100%',
                    height: '56px',
                    borderRadius: '16px',
                    backgroundColor: isSaved ? '#34C759' : '#007AFF',
                    color: '#FFF',
                    fontSize: '17px',
                    fontWeight: '600',
                    marginTop: '32px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}
            >
                {isSaved ? 'Saved!' : 'Save Check-In'}
            </button>
        </form>
    </div>
  );
};
