import React, { useMemo } from 'react';

/**
 * ConsistencyHeatmap Widget
 * * Displays a contribution-graph style heatmap for the current month.
 * * Refactored Phase 4.9.4: Current Month Logic & Visual Calibration.
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
        // Handle timezone offset issues by using local values for ISO string construction manually or just ensuring date parts match
        // Using string manipulation to ensure "YYYY-MM-DD" matches local date
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
        // No outer padding
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
            color: 'var(--secondary)',
            zIndex: 20
        }}>
            {title || data.label || 'Consistency'}
        </div>

        {/* Content Wrapper */}
        <div style={{
            padding: '40px 20px 20px 20px',
            boxSizing: 'border-box',
            width: '100%'
        }}>
            {/* Month Label */}
            <div style={{
                textAlign: 'right',
                fontSize: '13px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '12px'
            }}>
                {monthName}
            </div>

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
