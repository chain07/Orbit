import React from 'react';

/**
 * ProgressBarWidget
 * Use Case: Duration or Range metrics.
 * Refactor Phase 4.9.1: Vertical Stack, Flex Header.
 */
export const ProgressBarWidget = ({ data }) => {
  if (!data) return null;

  const { value = 0, max = 100, label = '', unit = '', color = '#007AFF' } = data;

  // Calculate percentage
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box'
    }}>

      {/* Header: Flex Row */}
      <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '10px',
          width: '100%'
      }}>
          {/* Label - Standard Header Style (Relative) */}
          <div style={{
              fontSize: '15px',
              fontWeight: '600',
              letterSpacing: '-0.3px',
              color: 'var(--text-primary)'
          }}>
            {label}
          </div>

          {/* Value Stack */}
          <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '19px', fontWeight: '700', color: '#007AFF' }}>
                  {value}
              </div>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#8E8E93', display: 'block' }}>
                  / {max} {unit}
              </span>
          </div>
      </div>

      {/* Bar Container */}
      <div style={{ width: '100%' }}>
          <div style={{
              height: '12px',
              backgroundColor: '#F2F2F7',
              borderRadius: '6px',
              overflow: 'hidden'
          }}>
              <div style={{
                  height: '100%',
                  width: `${percent}%`,
                  borderRadius: '6px',
                  backgroundColor: color || '#007AFF',
                  transition: 'width 0.5s ease-out'
              }} />
          </div>
      </div>
    </div>
  );
};
