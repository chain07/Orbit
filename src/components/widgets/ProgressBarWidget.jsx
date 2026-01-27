import React from 'react';

/**
 * ProgressBarWidget
 * * Restored "Normal" Progress Bar.
 * * Refactored Phase 4.15: Thinner Bar, Visible Track, Reduced Whitespace.
 */
export const ProgressBarWidget = ({ data, title }) => {
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
        justifyContent: 'center', // Centered vertically
        padding: '16px 20px', // Reduced vertical padding
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
            color: 'var(--text-secondary)',
            zIndex: 20
        }}>
            {title || data?.label}
        </div>

        {/* Labels above bar */}
        <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'baseline',
            marginBottom: '6px', // Tighter spacing
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginTop: '16px' // Clear header
        }}>
            <span style={{ color: 'var(--text-primary)', fontSize: '20px', marginRight: '4px' }}>{value}</span>
            <span style={{ opacity: 0.6 }}>/ {max} {unit}</span>
        </div>

        {/* Track */}
        <div style={{
            height: '8px', // Thinner bar
            borderRadius: '4px',
            backgroundColor: 'rgba(128, 128, 128, 0.2)', // Visible Grey Track
            marginTop: '0',
            width: '100%',
            overflow: 'hidden'
        }}>
            {/* Fill */}
            <div style={{
                height: '100%',
                width: `${percent}%`,
                backgroundColor: color,
                borderRadius: '4px',
                transition: 'width 0.5s ease-out',
                minWidth: percent > 0 ? '4px' : '0'
            }} />
        </div>
    </div>
  );
};
