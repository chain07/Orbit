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
    <div style={{ position: 'relative', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', top: '12px', left: '14px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', zIndex: 2 }}>
        {label}
      </div>

      <div style={{ position: 'absolute', top: '12px', right: '14px', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', zIndex: 2 }}>
        {value} <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>{unit}</span>
      </div>

      <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '6px', overflow: 'hidden', marginTop: '32px' }}>
          <div style={{
              height: '100%',
              width: `${percent}%`,
              backgroundColor: color || 'var(--blue)',
              transition: 'width 0.5s ease-out'
          }} />
      </div>
    </div>
  );
};
