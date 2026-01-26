import React, { useMemo } from 'react';

/**
 * ConsistencyHeatmap Widget
 * * Displays a contribution-graph style heatmap for the current month.
 * * Refactored Phase 4.13: Global Color Fix.
 */
export const ConsistencyHeatmap = ({ data, title }) => {
  if (!data || !data.values) return null;

  const today = new Date();

  const days = useMemo(() => {
    const arr = [];
    // Start of current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    // End is today
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Iterate from startOfMonth to today (inclusive)
    const current = new Date(startOfMonth);
    while (current <= end) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        const iso = `${year}-${month}-${day}`;

        arr.push({
            date: iso,
            value: data.values[iso] || 0
        });
        current.setDate(current.getDate() + 1);
    }
    return arr;
  }, [data.values]);

  const getColor = (value) => {
      // 0-100 logic
      if (value >= 100) return '#34C759'; // Full Green
      if (value >= 75) return 'rgba(52, 199, 89, 0.75)';
      if (value >= 50) return 'rgba(52, 199, 89, 0.5)';
      if (value > 0) return 'rgba(52, 199, 89, 0.25)';
      return 'var(--bg-secondary)'; // Visible Empty Slots
  };

  const monthName = today.toLocaleString('default', { month: 'long' });
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const startDayIndex = new Date(days[0].date).getDay(); // Index of first day of month (0=Sun)
  const offsetSlots = Array.from({ length: startDayIndex });

  return (
    <div style={{
        position: 'relative',
        height: 'auto',
        minHeight: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
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
            {title || data.label || 'Consistency'}
        </div>

        {/* Date Range Label - Top Right */}
        <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            zIndex: 20
        }}>
            {monthName}
        </div>

        {/* Content Wrapper */}
        <div style={{
            padding: '40px 20px 20px 20px',
            boxSizing: 'border-box',
            width: '100%'
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
                            backgroundColor: getColor(day.value),
                            // Ensure visibility for empty states
                            boxShadow: day.value === 0 ? 'inset 0 0 0 1px rgba(0,0,0,0.03)' : 'none'
                        }}
                        title={`${day.date}: ${day.value}`}
                    />
                ))}
            </div>

            {/* Week Labels */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '4px',
                marginTop: '6px'
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
