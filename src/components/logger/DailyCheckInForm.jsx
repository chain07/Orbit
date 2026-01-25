import React, { useContext, useState, useEffect } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { MetricInput } from './MetricInput';
import { Glass } from '../../components/ui/Glass';
import { OrbitButton } from '../ui/OrbitButton';

export const DailyCheckInForm = () => {
  const { metrics, addLogEntry } = useContext(StorageContext);
  const [entries, setEntries] = useState({});
  const [status, setStatus] = useState('idle'); // 'idle' | 'success'

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

    [span_0](start_span)// Validation: Check if entries has values before submitting[span_0](end_span)
    if (validEntries.length === 0) {
      // Optional: Add shake animation or error toast here if strict validation is needed
      return;
    }

    // Submit entries
    validEntries.forEach(([metricId, value]) => {
      addLogEntry({ 
        metricId, // Using metricId consistent with StorageContext
        value, 
        timestamp: new Date() 
      });
    });

    [span_1](start_span)// Reset form after successful submit[span_1](end_span)
    setEntries({});
    
    [span_2](start_span)// UX: Replace Alert with status message[span_2](end_span)
    setStatus('success');
    
    // Reset status after delay
    setTimeout(() => {
      setStatus('idle');
    }, 2000);
  };

  return (
    <Glass>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '20px', padding: '24px' }} className="flex flex-col">
            {metrics.length === 0 ? (
            <div className="text-center text-secondary py-4 italic text-sm p-4 bg-card">
                No metrics defined. Go to System to add metrics.
            </div>
            ) : (
            metrics.map(metric => (
                <MetricInput
                key={metric.id}
                metric={metric}
                value={entries[metric.id] || ''}
                onChange={(val) => handleChange(metric.id, val)}
                />
            ))
            )}
        </div>
        
        <OrbitButton
          type="submit" 
          disabled={status === 'success' || metrics.length === 0}
          variant="primary"
          className={`w-full ${status === 'success' ? '!bg-green !shadow-none !text-white' : ''}`}
        >
          {status === 'success' ? 'Check-In Saved ✓' : 'Save Check-In'}
        </OrbitButton>
      </form>
    </Glass>
  );
};
