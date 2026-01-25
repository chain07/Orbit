import React from 'react';

/**
 * ProgressBarWidget
 * Use Case: Duration or Range metrics.
 * Visual: Simple track (grey) and fill (blue). Label Top-Left. Value Top-Right.
 */
export const ProgressBarWidget = ({ data }) => {
  if (!data) return null;

  const { value = 0, max = 100, label = '', unit = '', color = '#007AFF' } = data;

  // Calculate percentage
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>

      {/* Standard Header */}
      <div style={{ position: 'absolute', top: '14px', left: '16px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', zIndex: 10 }}>
        {label}
      </div>

      {/* Top Right Value */}
      <div style={{ position: 'absolute', top: '14px', right: '16px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', zIndex: 10 }}>
        {value} / {max} {unit}
      </div>

      {/* Bar Container */}
      <div style={{ marginTop: '40px', width: '100%' }}>
          <div style={{ height: '24px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{
                  height: '100%',
                  width: `${percent}%`,
                  borderRadius: '12px',
                  backgroundColor: color || 'var(--blue)',
                  transition: 'width 0.5s ease-out'
              }} />
          </div>
      </div>
    </div>
  );
};
