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
      <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', zIndex: 2 }}>
        {label}
      </div>

      {/* Bar Container */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
          <div style={{ flex: 1, height: '16px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{
                  height: '100%',
                  width: `${percent}%`,
                  backgroundColor: color || 'var(--blue)',
                  transition: 'width 0.5s ease-out'
              }} />
          </div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            {value} / {max} {unit}
          </div>
      </div>
    </div>
  );
};
