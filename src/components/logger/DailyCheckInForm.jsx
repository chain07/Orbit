import React, { useContext, useState } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { MetricInput } from './MetricInput';

export const DailyCheckInForm = () => {
  const { metrics, addLogEntry } = useContext(StorageContext);
  const [entries, setEntries] = useState({});
  const [status, setStatus] = useState('idle'); // 'idle' | 'success'

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

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

    // Submit entries
    validEntries.forEach(([metricId, value]) => {
      addLogEntry({ 
        metricId,
        value, 
        timestamp: new Date() 
      });
    });

    setEntries({});
    setStatus('success');
    
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
        paddingBottom: '100px' // Space for FAB
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

            {/* Fixed FAB Save Button */}
            <button
                type="submit"
                disabled={status === 'success'}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '30px',
                    backgroundColor: status === 'success' ? '#34C759' : '#1C1C1E',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    zIndex: 100,
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                    transform: status === 'success' ? 'scale(1.1)' : 'scale(1)'
                }}
            >
                {status === 'success' ? (
                     <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                     </svg>
                ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                         <polyline points="20 6 9 17 4 12" />
                    </svg>
                )}
            </button>
        </form>
    </div>
  );
};
