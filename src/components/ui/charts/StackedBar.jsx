import React, { useMemo, useState, useEffect } from 'react';

/**
 * StackedBar Chart
 * Ported from WeeklyBarChartV3.html
 *
 * Props:
 * - data: Array of objects { label: string, values: { [category]: number } }
 * - colors: Object mapping category names to hex colors
 * - title: string
 * - subtitle: string
 */
export const StackedBar = ({ data = [], colors = {}, title = "Activity", subtitle = "Last 7 Days" }) => {
  const [selectedIdx, setSelectedIdx] = useState(null);

  // Memoized Calculations
  const { processedData, max, total, avg, categories } = useMemo(() => {
    if (!data || data.length === 0) {
      return { processedData: [], max: 0, total: 0, avg: 0, categories: [] };
    }

    // Calculate total from data unconditionally as per requirement
    const calculatedTotal = data.reduce((sum, day) => {
        const dayTotal = Object.values(day.values || {}).reduce((a, b) => a + b, 0);
        return sum + dayTotal;
    }, 0);

    let grandSum = 0;
    let maxDaily = 0;
    const cats = new Set();

    const proc = data.map(day => {
      let dSum = 0;
      // Filter out zero values and collect categories
      const dayValues = {};
      Object.entries(day.values || {}).forEach(([k, v]) => {
        if (v > 0) {
          dayValues[k] = v;
          cats.add(k);
          dSum += v;
        }
      });
      grandSum += dSum;
      if (dSum > maxDaily) maxDaily = dSum;

      return { ...day, values: dayValues, sum: dSum };
    });

    // Smart Scale: Round up to nearest even number, minimum 4
    const computedMax = Math.max(4, Math.ceil(maxDaily / 2) * 2);
    const computedTotal = calculatedTotal; // Use strict total calculation
    const computedAvg = data.length ? calculatedTotal / data.length : 0;

    // Convert Set to Array and Sort by Total Sum Descending for Legend
    const catArray = Array.from(cats).map(k => {
       const sum = proc.reduce((acc, d) => acc + (d.values[k] || 0), 0);
       return { key: k, sum, color: colors[k] || '#8E8E93' };
    }).sort((a, b) => b.sum - a.sum);

    return {
      processedData: proc,
      max: computedMax,
      total: computedTotal,
      avg: computedAvg,
      categories: catArray
    };
  }, [data, colors]);

  // Handle Tap
  const handleTap = (idx) => {
    if (selectedIdx === idx) {
      setSelectedIdx(null);
    } else {
      setSelectedIdx(idx);
    }
  };

  // UI Values based on Selection
  // Requirement: "Total Logs" and Math.round(total)
  const footerLabel = selectedIdx === null ? "Total Logs" : `Total for ${processedData[selectedIdx]?.label}`;
  const footerValue = selectedIdx === null
    ? Math.round(total)
    : `${processedData[selectedIdx]?.sum.toFixed(1)}h`;

  return (
    <div className={`chart-interactive w-full ${selectedIdx !== null ? 'has-select' : ''}`}>
      
      {/* Chart Wrapper */}
      <div className="chart-wrapper">
        <div className="chart-frame">
           {/* Grids */}
           <div className="grid-lines-bg">
              {[0, 1, 2, 3, 4].map(i => <div key={i} className="h-line" />)}
           </div>

           {/* Vertical Grid Lines (Background) */}
           <div className="absolute inset-0 flex justify-between pointer-events-none z-0" style={{ paddingLeft: '10px', paddingRight: '10px' }}>
             {Array.from({ length: (processedData && processedData.length > 0) ? processedData.length : 7 }).map((_, i) => (
               <div
                 key={i}
                 style={{ width: '1px', height: '100%', backgroundColor: 'rgba(128, 128, 128, 0.1)' }}
               />
             ))}
           </div>

           {/* Avg Line */}
           <div
             className="avg-line"
             style={{ bottom: `${(avg / max) * 100}%` }}
           >
             <div className="avg-tag">AVG</div>
           </div>

           {/* Bars */}
           {processedData.map((day, idx) => (
             <div
               key={idx}
               className={`col-group ${selectedIdx === idx ? 'active' : ''}`}
               onClick={() => handleTap(idx)}
             >
                <div className="bar-stack">
                  {Object.entries(day.values).map(([key, val], i, arr) => {
                     const h = (val / max) * 100;
                     const isTop = i === arr.length - 1;
                     const isBottom = i === 0;
                     return (
                       <div
                         key={key}
                         className={`bar-seg ${isTop ? 'is-top' : ''} ${isBottom ? 'is-bottom' : ''}`}
                         style={{
                           height: `${h}%`,
                           backgroundColor: colors[key] || '#8E8E93'
                         }}
                       />
                     );
                  })}
                </div>
                <div className="x-lbl">
                  {/* Assumption: Label is "Mon", "Tue" or date. Use first letter or short value */}
                  {day.label.length > 3 ? day.label.slice(0, 3) : day.label}
                </div>
             </div>
           ))}
        </div>

        {/* Y Axis */}
        <div className="y-axis-col">
           {[0, 1, 2, 3, 4].map(i => {
             const val = Math.round((max / 4) * i);
             return <div key={i} className="y-lbl">{val === 0 ? "" : val}</div>
           })}
        </div>
      </div>

      {/* Legend */}
      <div className="legend">
        {categories.map(cat => {
           const isDim = selectedIdx !== null && (!processedData[selectedIdx].values[cat.key]);
           const val = selectedIdx !== null && processedData[selectedIdx].values[cat.key]
             ? processedData[selectedIdx].values[cat.key]
             : 0;

           return (
             <div key={cat.key} className={`leg-item ${isDim ? 'dim' : ''}`}>
               <div className="leg-dot" style={{ backgroundColor: cat.color }}></div>
               <span>{cat.key}</span>
               <span className="leg-val">{val.toFixed(1)}h</span>
             </div>
           )
        })}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end mt-4 border-t pt-3" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {footerLabel}
          </span>
          <span style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {footerValue}
          </span>
      </div>

    </div>
  );
};
