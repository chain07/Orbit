import React, { useMemo } from 'react';
import { HeatMap } from '../ui/charts/Heatmap';
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
export const ConsistencyHeatmap = ({ data }) => {
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

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', padding: '10px' }}>
        {/* Month Label */}
        <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '500' }}>
            {monthRange}
        </div>

        {/* Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', marginTop: '16px' }}>
            {days.map(day => (
                <div
                    key={day.date}
                    style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        backgroundColor: getColor(day.value)
                    }}
                    title={day.date}
                />
            ))}
        </div>

        {/* Weekday Row (Decorative bottom) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '8px' }}>
            {weekDays.map((d, i) => (
                <div key={i} style={{ width: '18px', textAlign: 'center', fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    {d}
                </div>
            ))}
        </div>
    </div>
  );
};
