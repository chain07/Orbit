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
      if (!value) return 'rgba(0,0,0,0.05)'; // Empty
      // Active - #34C759
      // Logic: if it's > 0, it's green. We can add opacity for intensity if needed,
      // but spec says "Active: #34C759". I'll use opacity for gradients if strictly needed,
      // otherwise simple boolean logic or mapped intensity.
      // Assuming simple active/inactive for strict visual fidelity to "Active/Empty" spec.
      return '#34C759';
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignContent: 'center', justifyContent: 'center', height: '100%' }}>
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
  );
};
