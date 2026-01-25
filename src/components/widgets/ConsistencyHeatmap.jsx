import React, { useMemo } from 'react';
import { dateUtils } from '../../lib/dateUtils';

/**
 * ConsistencyHeatmap Widget
 * * Displays a contribution-graph style heatmap.
 * Expected data structure:
 * {
 * values: { [date]: number }, // 0-1 values
 * startDate: string (YYYY-MM-DD),
 * endDate: string (YYYY-MM-DD),
 * color: string
 * }
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
      if (!value) return '#E5E5EA';
      return '#34C759';
  };

  const startMonth = new Date(days[0].date).toLocaleString('default', { month: 'short' });
  const endMonth = new Date(days[days.length-1].date).toLocaleString('default', { month: 'short' });
  const monthRange = startMonth === endMonth ? startMonth : `${startMonth} - ${endMonth}`;

  // Weekday labels (S, M, T, W, T, F, S)
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Calculate start day offset (0 = Sunday, ... 6 = Saturday)
  const startDayIndex = new Date(days[0].date).getDay();
  const offsetSlots = Array.from({ length: startDayIndex });

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px' }}>

        {/* Standard Header */}
        <div style={{ position: 'absolute', top: '14px', left: '16px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', zIndex: 10 }}>
            {data.label || title || 'Consistency'}
        </div>

        {/* Context Label (Top Right) */}
        <div style={{ position: 'absolute', top: '14px', right: '16px', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '500', zIndex: 10 }}>
            {monthRange}
        </div>

        {/* Grid Container */}
        <div style={{
            marginTop: '32px',
            width: '100%',
            maxWidth: '240px' // Limit width to keep squares reasonable
        }}>
            {/* Calendar Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '4px',
                width: '100%'
            }}>
                {/* Empty slots for offset */}
                {offsetSlots.map((_, i) => <div key={`empty-${i}`} />)}

                {/* Day Cells */}
                {days.map(day => (
                    <div
                        key={day.date}
                        style={{
                            aspectRatio: '1/1',
                            borderRadius: '4px',
                            backgroundColor: getColor(day.value)
                        }}
                        title={day.date}
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
