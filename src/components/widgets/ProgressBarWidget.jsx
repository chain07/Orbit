import React from 'react';

/**
 * ProgressBarWidget
 * Use Case: Duration or Range metrics.
 * Refactor Phase 4.9.2: Atomic Visual Fixes.
 */
export const ProgressBarWidget = ({ data, title }) => {
  if (!data) return null;

  const { value = 0, max = 100, unit = '', color = '#007AFF' } = data;

  // Calculate percentage
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '16px 20px',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative'
    }}>

      {/* Atomic Header Fix */}
      <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            margin: '12px',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: 'var(--secondary)',
            zIndex: 20
      }}>
        {title || data.label}
      </div>

      {/* Value Stack - Top Right (Absolute to match others) */}
      <div style={{
          position: 'absolute',
          top: '16px',
          right: '20px',
          textAlign: 'right'
      }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#007AFF' }}>
              {value}
          </div>
          <span style={{ fontSize: '11px', fontWeight: '500', color: '#8E8E93', display: 'block' }}>
              / {max} {unit}
          </span>
      </div>

      {/* Bar Container */}
      <div style={{ width: '100%', marginTop: '4px' }}>
          <div style={{
              height: '24px', // Thicker track
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              overflow: 'hidden'
          }}>
              <div style={{
                  height: '100%',
                  width: `${percent}%`,
                  borderRadius: '12px',
                  backgroundColor: color || '#007AFF',
                  transition: 'width 0.5s ease-out'
              }} />
          </div>
      </div>
    </div>
  );
};
