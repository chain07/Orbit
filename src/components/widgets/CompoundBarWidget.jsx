import React, { useMemo } from 'react';

/**
 * CompoundBarWidget
 * Use Case: For Select metrics.
 * Refactor Phase 4.12: Atomic Visual Fixes (Padding Removal).
 */
export const CompoundBarWidget = ({ data, title }) => {
  if (!data || !data.breakdown) return null;

  const { breakdown = [] } = data;

  // Extended iOS Palette (12 Colors)
  const palette = [
    '#007AFF', // Blue
    '#AF52DE', // Purple
    '#FF2D55', // Pink
    '#FF3B30', // Red
    '#FF9500', // Orange
    '#FFCC00', // Yellow
    '#34C759', // Green
    '#5AC8FA', // Teal
    '#32ADE6', // Cyan
    '#5856D6', // Indigo
    '#A2845E', // Brown
    '#8E8E93'  // Gray
  ];

  const segments = useMemo(() => {
    // Sort by value desc
    const sorted = [...breakdown].sort((a, b) => b.value - a.value);
    const total = sorted.reduce((sum, item) => sum + item.value, 0);

    return sorted.map((item, idx) => ({
      ...item,
      color: palette[idx % palette.length],
      percent: total > 0 ? (item.value / total) * 100 : 0
    })).filter(s => s.percent > 0);
  }, [breakdown]);

  return (
    <div style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        // No outer padding
    }}>
        {/* Atomic Header Fix: Strict Positioning */}
        <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            margin: 0,
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: 'var(--secondary)',
            zIndex: 20
        }}>
            {title || data.label || 'Breakdown'}
        </div>

        {/* Total Value - Top Right */}
        <div style={{
            position: 'absolute',
            top: '16px',
            right: '20px',
            textAlign: 'right',
            zIndex: 20
        }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#007AFF' }}>
                {segments.reduce((sum, s) => sum + s.value, 0)}
            </div>
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#8E8E93', display: 'block' }}>
                Total
            </span>
        </div>

        {/* Inner Content Wrapper */}
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            width: '100%',
            height: '100%',
            padding: '0 20px 16px 20px',
            boxSizing: 'border-box'
        }}>
            {/* Hero Bar (Segmented) */}
            <div style={{
                display: 'flex',
                width: '100%',
                height: '18px',
                borderRadius: '9px',
                overflow: 'hidden',
                gap: '1px',
                marginBottom: '16px',
                marginTop: '40px' // Space for absolute header
            }}>
                {segments.map((seg, i) => (
                    <div key={i} style={{
                        height: '100%',
                        width: `${seg.percent}%`,
                        backgroundColor: seg.color,
                        transition: 'width 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
                    }} />
                ))}
            </div>

            {/* Legend Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px 12px',
                width: '100%'
            }}>
                {segments.map((seg, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: seg.color,
                            marginRight: '8px',
                            flexShrink: 0
                        }} />
                        <span style={{ fontSize: '12px', color: '#8E8E93', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {seg.label}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '600', marginLeft: 'auto', color: 'var(--text-primary)' }}>
                            {seg.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
