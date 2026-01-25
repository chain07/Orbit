import React from 'react';
import { MetricType } from '../../types/schemas';

export const MetricInput = ({ metric, value, onChange }) => {
  const handleChange = (e) => {
    let val = e.target.value;
    if (metric.type === MetricType.NUMBER || metric.type === MetricType.RANGE) {
        val = parseFloat(val);
    } else if (metric.type === MetricType.BOOLEAN) {
        val = e.target.checked;
    }
    onChange(val);
  };

  const renderInput = () => {
    switch (metric.type) {
        case MetricType.BOOLEAN:
            // Toggle Switch
            return (
                <label style={{ position: 'relative', display: 'inline-block', width: '51px', height: '31px' }}>
                    <input
                        type="checkbox"
                        checked={!!value}
                        onChange={handleChange}
                        style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: value ? '#34C759' : '#e9e9ea',
                        borderRadius: '34px',
                        transition: '.4s'
                    }}></span>
                    <span style={{
                        position: 'absolute',
                        height: '27px',
                        width: '27px',
                        left: '2px',
                        bottom: '2px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '.4s',
                        transform: value ? 'translateX(20px)' : 'translateX(0)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}></span>
                </label>
            );

        case MetricType.RANGE:
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <span style={{ fontSize: '12px', color: 'var(--text-secondary)', minWidth: '12px' }}>{metric.range?.min || 1}</span>
                   <input
                        type="range"
                        min={metric.range?.min || 1}
                        max={metric.range?.max || 10}
                        step={metric.range?.step || 1}
                        value={value || metric.range?.min || 0}
                        onChange={handleChange}
                        style={{ width: '120px', accentColor: '#007AFF' }}
                    />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', minWidth: '12px', textAlign: 'right' }}>{metric.range?.max || 10}</span>
                </div>
            );

        case MetricType.SELECT:
            return (
                <select
                    value={value}
                    onChange={handleChange}
                    style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        backgroundColor: 'var(--bg-color)',
                        fontSize: '14px'
                    }}
                >
                    <option value="" disabled>Select</option>
                    {(metric.options || []).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            );

        case MetricType.NUMBER:
        case MetricType.DURATION:
            return (
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <button
                     type="button"
                     onClick={() => onChange(Math.max(0, (parseFloat(value) || 0) - 1))}
                     style={{
                         width: '28px', height: '28px', borderRadius: '50%',
                         border: '1px solid rgba(0,0,0,0.1)',
                         backgroundColor: 'var(--bg-color)',
                         display: 'flex', alignItems: 'center', justifyContent: 'center',
                         fontSize: '18px', color: '#007AFF', cursor: 'pointer'
                     }}
                   >
                       -
                   </button>
                   <span style={{ fontSize: '16px', fontWeight: '600', minWidth: '24px', textAlign: 'center' }}>
                       {value || 0}
                   </span>
                    <button
                     type="button"
                     onClick={() => onChange((parseFloat(value) || 0) + 1)}
                     style={{
                         width: '28px', height: '28px', borderRadius: '50%',
                         border: '1px solid rgba(0,0,0,0.1)',
                         backgroundColor: 'var(--bg-color)',
                         display: 'flex', alignItems: 'center', justifyContent: 'center',
                         fontSize: '18px', color: '#007AFF', cursor: 'pointer'
                     }}
                   >
                       +
                   </button>
               </div>
            );

        default:
            return (
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder="Value"
                    style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        width: '100px',
                        textAlign: 'right'
                    }}
                />
            );
    }
  };

  return (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '0.5px solid rgba(0,0,0,0.1)',
        backgroundColor: 'var(--card-bg)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '16px', fontWeight: '500' }}>{metric.label}</span>
          {metric.unit && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{metric.unit}</span>}
      </div>
      <div>
        {renderInput()}
      </div>
    </div>
  );
};
