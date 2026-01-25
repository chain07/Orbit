import React, { useMemo } from 'react';

/**
 * CompoundBarWidget
 * Use Case: For Select metrics.
 * Visual: Single bar, multi-colored segments. Legend below.
 * Reference: compoundbar.html
 */
export const CompoundBarWidget = ({ data }) => {
  if (!data || !data.breakdown) return null;

  const { breakdown = [] } = data;

  // Configuration - iOS Data Colors
  // We can cycle these or match if data has color
  const palette = [
    '#007AFF', // Blue
    '#AF52DE', // Purple
    '#FF9500', // Orange
    '#FF2D55', // Pink
    '#34C759', // Green
    '#5AC8FA', // Teal
    '#FFCC00', // Yellow
    '#C7C7CC', // Gray
  ];

  const segments = useMemo(() => {
    // Sort by value desc
    const sorted = [...breakdown].sort((a, b) => b.value - a.value);
    const total = sorted.reduce((sum, item) => sum + item.value, 0);

    return sorted.map((item, idx) => ({
      ...item,
      color: palette[idx % palette.length], // Assign color from palette
      percent: total > 0 ? (item.value / total) * 100 : 0
    })).filter(s => s.percent > 0);
  }, [breakdown]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', padding: '16px' }}>
        <div style={{
            fontSize: '11px',
            fontWeight: '700',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            position: 'absolute',
            top: '12px',
            left: '14px',
            zIndex: 2
        }}>
            {data.label || 'Breakdown'}
        </div>

        {/* Bar Container */}
        <div style={{ width: '100%', marginTop: '24px' }}>
            <div style={{
                display: 'flex',
                width: '100%',
                height: '12px',
                background: 'rgba(0,0,0,0.05)',
                borderRadius: '6px',
                overflow: 'hidden'
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
        </div>

        {/* Legend */}
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '16px'
        }}>
            {segments.map((seg, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', flexShrink: 0, backgroundColor: seg.color }} />
                    <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' }}>{seg.label}</span>
                </div>
            ))}
        </div>
    </div>
  );
};
