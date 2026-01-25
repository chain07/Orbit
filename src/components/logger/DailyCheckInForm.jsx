import React, { useContext, useState } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { MetricInput } from './MetricInput';
import { OrbitButton } from '../ui/OrbitButton';

export const DailyCheckInForm = () => {
  const { metrics, addLogEntry } = useContext(StorageContext);
  const [entries, setEntries] = useState({});
  const [status, setStatus] = useState('idle'); // 'idle' | 'success'

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Reset status when user types to allow resubmission
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
          <div style={{ textAlign: 'center', padding: '40px', color: '#8E8E93', fontStyle: 'italic' }}>
              No metrics configured.
          </div>
      );
  }

  return (
    <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        padding: '32px',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto'
    }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{todayDate}</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#000000', marginTop: '4px' }}>Check-In</div>
        </div>

        <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {metrics.map(metric => (
                    <MetricInput
                        key={metric.id}
                        metric={metric}
                        value={entries[metric.id]}
                        onChange={(val) => handleChange(metric.id, val)}
                    />
                ))}
            </div>

            <div style={{ marginTop: '32px' }}>
                <OrbitButton
                    type="submit"
                    disabled={status === 'success'}
                    variant="primary"
                    className={`w-full ${status === 'success' ? '!bg-green !shadow-none !text-white' : ''}`}
                    style={{ width: '100%', height: '50px', fontSize: '17px', fontWeight: '600' }}
                >
                    {status === 'success' ? 'Check-In Saved ✓' : 'Save Check-In'}
                </OrbitButton>
            </div>
        </form>
    </div>
  );
};
