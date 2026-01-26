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
        padding: '16px 20px', // Strict padding
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        justifyContent: 'flex-end',
        minHeight: '120px' // Reduced min-height
    }}>

      {/* Atomic Header Fix */}
      <div style={{
            position: 'absolute',
            top: '16px',
            left: '20px',
            margin: 0,
            fontSize: '15px',
            fontWeight: '600',
            color: 'var(--text-secondary)', // #8E8E93
            zIndex: 10,
            letterSpacing: '-0.3px'
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
      <div style={{ width: '100%', marginTop: '40px' }}>
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
