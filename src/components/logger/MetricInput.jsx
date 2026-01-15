
import React from 'react';

/**
 * MetricInput
 * Props:
 * - metric: { key, label, type, goal }
 * - value: current value
 * - onChange: callback to update value
 */
export const MetricInput = ({ metric, value, onChange }) => {
  const handleChange = (e) => {
    const val = metric.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    onChange(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontWeight: 600 }}>{metric.label}</label>
      <input
        type={metric.type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={handleChange}
        placeholder={metric.type === 'number' ? 'Enter a number' : 'Enter value'}
        style={{
          padding: 6,
          borderRadius: 6,
          border: '1px solid #ccc',
          fontSize: 14,
        }}
      />
      {metric.goal != null && metric.type === 'number' && (
        <small style={{ color: '#666' }}>Goal: {metric.goal}</small>
      )}
    </div>
  );
};
