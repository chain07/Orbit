import React from 'react';

export const MetricInput = ({ metric, value, onChange }) => {
  const handleChange = (e) => {
    const val = metric.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    onChange(val);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="font-bold">{metric.label}</label>
      <input
        type={metric.type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={handleChange}
        placeholder={metric.type === 'number' ? 'Enter a number' : 'Enter value'}
        className="p-2 rounded border border-separator text-sm bg-transparent"
      />
      {metric.goal != null && metric.type === 'number' && (
        <small className="text-secondary text-sm">Goal: {metric.goal}</small>
      )}
    </div>
  );
};
