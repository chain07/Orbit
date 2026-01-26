import React, { useMemo } from 'react';

/**
 * ConsistencyHeatmap Widget
 * * Displays a contribution-graph style heatmap.
 * * Refactored Phase 4.9.2: Atomic Visual Fixes (Overflow, Header).
 */
export const ConsistencyHeatmap = ({ data, title }) => {
  if (!data || !data.values) return null;

  const days = useMemo(() => {
    const arr = [];
    const end = new Date();
    // Exactly 30 days
    for (let i = 29; i >= 0; i--) {
        const d = new Date(end);
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().split('T')[0];
        arr.push({
            date: iso,
            value: data.values[iso] || 0
        });
    }
    return arr;
  }, [data.values]);

  const getColor = (value) => {
      // 0-100 logic
      if (value >= 100) return '#34C759'; // Full Green
      if (value >= 75) return 'rgba(52, 199, 89, 0.75)';
      if (value >= 50) return 'rgba(52, 199, 89, 0.5)';
      if (value > 0) return 'rgba(52, 199, 89, 0.25)';
      return 'var(--bg-secondary)'; // Dynamic Empty Color
  };

  const startMonth = new Date(days[0].date).toLocaleString('default', { month: 'short' });
  const endMonth = new Date(days[days.length-1].date).toLocaleString('default', { month: 'short' });
  const monthRange = startMonth === endMonth ? startMonth : `${startMonth} - ${endMonth}`;

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const startDayIndex = new Date(days[0].date).getDay();
  const offsetSlots = Array.from({ length: startDayIndex });

  return (
    <div style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        paddingBottom: '40px' // Increased padding as requested
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
            {title || data.label || 'Consistency'}
        </div>

        {/* Month Label (Top Right) */}
        <div style={{
            position: 'absolute',
            top: '16px',
            right: '20px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontWeight: '700',
            zIndex: 10
        }}>
            {monthRange}
        </div>

        {/* Grid Container - Expanded */}
        <div style={{
            marginTop: '32px',
            width: '100%',
        }}>
            {/* Calendar Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '4px',
                width: '100%'
            }}>
                {offsetSlots.map((_, i) => <div key={`empty-${i}`} />)}
                {days.map(day => (
                    <div
                        key={day.date}
                        style={{
                            aspectRatio: '1/1',
                            borderRadius: '4px',
                            backgroundColor: getColor(day.value)
                        }}
                        title={`${day.date}: ${day.value}`}
                    />
                ))}
            </div>

            {/* Sticky Day Labels */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '4px',
                marginTop: '8px'
            }}>
                {weekDays.map((d, i) => (
                    <div key={i} style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        {d}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
