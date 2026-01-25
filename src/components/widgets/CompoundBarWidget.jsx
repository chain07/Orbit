import React, { useMemo } from 'react';

/**
 * CompoundBarWidget
 * Use Case: For Select metrics.
 * Visual: Single bar, multi-colored segments. Legend below.
 */
export const CompoundBarWidget = ({ data }) => {
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', padding: '16px' }}>
        {/* Standard Header */}
        <div style={{
            fontSize: '11px',
            fontWeight: '700',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            position: 'absolute',
            top: '14px',
            left: '16px',
            zIndex: 10
        }}>
            {data.label || 'Breakdown'}
        </div>

        {/* Inset Card Container */}
        <div style={{
            backgroundColor: 'rgba(0,0,0,0.03)',
            borderRadius: '16px',
            padding: '20px',
            marginTop: '32px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
            {/* Bar */}
            <div style={{
                display: 'flex',
                width: '100%',
                height: '16px',
                background: 'rgba(0,0,0,0.05)',
                borderRadius: '8px',
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

            {/* Legend */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
            }}>
                {segments.map((seg, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', flexShrink: 0, backgroundColor: seg.color }} />
                        <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' }}>
                           {seg.label} <span style={{ opacity: 0.5 }}>({seg.value})</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
