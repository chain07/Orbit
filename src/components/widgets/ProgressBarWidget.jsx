import React from 'react';

/**
 * ProgressBarWidget
 * * Restored "Normal" Progress Bar.
 * * Refactored Phase 4.13: Global Color Fix, Empty Guard.
 */
export const ProgressBarWidget = ({ data, title }) => {
  // Guard Clause: Allow empty/0 but prevent crash if undefined object
  // But render 0% if data is missing but expected
  const value = data?.value || 0;
  const max = data?.max || 100;
  const unit = data?.unit || '';
  const color = data?.color || '#007AFF';

  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '20px',
        boxSizing: 'border-box',
        position: 'relative'
    }}>
        {/* Strict Header */}
        <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            margin: 0,
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)', // Global Fix
            zIndex: 20
        }}>
            {title || data?.label}
        </div>

        {/* Labels above bar */}
        <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'baseline',
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-secondary)'
        }}>
            <span style={{ color: 'var(--text-primary)', fontSize: '20px', marginRight: '4px' }}>{value}</span>
            <span style={{ opacity: 0.6 }}>/ {max} {unit}</span>
        </div>

        {/* Track */}
        <div style={{
            height: '16px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
            marginTop: '0',
            width: '100%',
            overflow: 'hidden'
        }}>
            {/* Fill */}
            <div style={{
                height: '100%',
                width: `${percent}%`,
                backgroundColor: color,
                borderRadius: '8px',
                transition: 'width 0.5s ease-out',
                minWidth: percent > 0 ? '6px' : '0'
            }} />
        </div>
    </div>
  );
};
