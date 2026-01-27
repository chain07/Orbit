import React, { useMemo, useState } from 'react';

/**
 * StackedBar Chart
 * * Refactored Phase 4.16: Full Inline Styles Implementation (No external CSS).
 * * Supports dynamic scaling and flexible layout.
 */
export const StackedBar = ({ data = [], colors = {}, height = 200 }) => {
  const [selectedIdx, setSelectedIdx] = useState(null);

  // --- Memoized Calculations ---
  const calculated = useMemo(() => {
    if (!data || data.length === 0) {
      return { processedData: [], max: 4, total: 0, avg: 0, categories: [] };
    }

    const calculatedTotal = data.reduce((sum, day) => {
        const dayTotal = Object.values(day.values || {}).reduce((a, b) => a + b, 0);
        return sum + dayTotal;
    }, 0);

    let maxDaily = 0;
    const cats = new Set();

    const proc = data.map(day => {
      let dSum = 0;
      const dayValues = {};
      Object.entries(day.values || {}).forEach(([k, v]) => {
        if (v > 0) {
          dayValues[k] = v;
          cats.add(k);
          dSum += v;
        }
      });
      if (dSum > maxDaily) maxDaily = dSum;

      return { ...day, values: dayValues, sum: dSum };
    });

    // Dynamic Scale: Nearest even number, minimum 4
    const computedMax = Math.max(4, Math.ceil(maxDaily / 2) * 2);
    const computedAvg = data.length ? calculatedTotal / data.length : 0;

    const catArray = Array.from(cats).map(k => {
       const sum = proc.reduce((acc, d) => acc + (d.values[k] || 0), 0);
       return { key: k, sum, color: colors[k] || '#8E8E93' }; // Fallback color
    }).sort((a, b) => b.sum - a.sum);

    return {
      processedData: proc,
      max: computedMax,
      total: calculatedTotal,
      avg: computedAvg,
      categories: catArray
    };
  }, [data, colors]);

  const { processedData, max, total, categories } = calculated;

  const handleTap = (idx) => {
    setSelectedIdx(selectedIdx === idx ? null : idx);
  };

  // --- Render ---
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      
      {/* Chart Frame - Relative Container */}
      <div style={{ position: 'relative', width: '100%', height: `${height}px`, marginBottom: '16px' }}>

           {/* 1. Horizontal Grid Lines (Bottom Layer) */}
           <div style={{
               position: 'absolute',
               left: '30px',
               right: 0,
               top: 0,
               bottom: '20px',
               display: 'flex',
               flexDirection: 'column-reverse',
               justifyContent: 'space-between',
               zIndex: 0
            }}>
              {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} style={{ width: '100%', height: '1px', backgroundColor: 'rgba(128, 128, 128, 0.1)' }} />
              ))}
           </div>

           {/* 2. Y-Axis Labels (Left) */}
           <div style={{
               position: 'absolute',
               left: 0,
               top: 0,
               bottom: '20px',
               width: '24px',
               display: 'flex',
               flexDirection: 'column-reverse',
               justifyContent: 'space-between',
               fontSize: '10px',
               color: 'var(--text-secondary)',
               textAlign: 'right',
               zIndex: 1
            }}>
               {[0, 1, 2, 3, 4].map(i => {
                   const val = Math.round((max / 4) * i);
                   return <div key={i} style={{ lineHeight: '0' }}>{val}</div>;
               })}
           </div>

           {/* 3. Bars Container (Interactive Layer) */}
           <div style={{
               position: 'absolute',
               left: '30px',
               right: 0,
               top: 0,
               bottom: '20px',
               display: 'flex',
               alignItems: 'flex-end',
               justifyContent: 'space-between',
               zIndex: 2
            }}>
               {processedData.map((day, idx) => {
                   // Calculate bar segments
                   // We need to stack them. Since we use flex-col-reverse, the first item is at bottom.
                   const segments = Object.entries(day.values).map(([key, val]) => {
                       return { key, val, h: (val / max) * 100 };
                   });

                   return (
                       <div
                           key={idx}
                           onClick={() => handleTap(idx)}
                           style={{
                               flex: 1,
                               height: '100%',
                               display: 'flex',
                               flexDirection: 'column', // Normal column direction
                               justifyContent: 'flex-end', // Align items to bottom
                               alignItems: 'center',
                               cursor: 'pointer',
                               opacity: selectedIdx !== null && selectedIdx !== idx ? 0.4 : 1,
                               transition: 'opacity 0.2s ease',
                               position: 'relative'
                           }}
                       >
                           {/* The Stack Column */}
                           <div style={{
                               width: '60%',
                               height: '100%',
                               display: 'flex',
                               flexDirection: 'column-reverse', // Stack from bottom up
                               justifyContent: 'flex-start',
                               alignItems: 'center'
                           }}>
                               {segments.map((seg, i) => {
                                   const isTop = i === segments.length - 1;
                                   const isBottom = i === 0;

                                   return (
                                       <div
                                           key={seg.key}
                                           style={{
                                               height: `${seg.h}%`,
                                               backgroundColor: colors[seg.key] || '#8E8E93',
                                               width: '100%',
                                               borderTopLeftRadius: isTop ? '4px' : 0,
                                               borderTopRightRadius: isTop ? '4px' : 0,
                                               borderBottomLeftRadius: isBottom ? '4px' : 0,
                                               borderBottomRightRadius: isBottom ? '4px' : 0,
                                               marginBottom: '1px', // Gap
                                               minHeight: '2px' // Ensure visibility
                                           }}
                                       />
                                   );
                               })}
                           </div>

                           {/* X Label */}
                           <div style={{
                               position: 'absolute',
                               bottom: '-20px',
                               fontSize: '10px',
                               fontWeight: '600',
                               color: selectedIdx === idx ? 'var(--text-primary)' : 'var(--text-secondary)',
                               width: '100%',
                               textAlign: 'center',
                               textTransform: 'uppercase'
                           }}>
                               {day.label}
                           </div>
                       </div>
                   );
               })}
           </div>
      </div>

      {/* Legend & Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Legend Grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
              {categories.map(cat => {
                  const val = selectedIdx !== null && processedData[selectedIdx].values[cat.key]
                      ? processedData[selectedIdx].values[cat.key]
                      : null;

                  const isDim = selectedIdx !== null && (!val);

                  return (
                      <div key={cat.key} style={{ display: 'flex', alignItems: 'center', fontSize: '11px', color: isDim ? 'var(--text-secondary)' : 'var(--text-primary)', opacity: isDim ? 0.5 : 1 }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.color, marginRight: '6px' }} />
                          <span style={{ marginRight: '4px', fontWeight: '500' }}>{cat.key}</span>
                          {val !== null && <span style={{ fontWeight: '700' }}>{val.toFixed(1)}</span>}
                      </div>
                  );
              })}
          </div>

          {/* Total Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--separator)', paddingTop: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  {selectedIdx === null ? "Total Logs" : `Total for ${processedData[selectedIdx].label}`}
              </span>
              <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
                  {selectedIdx === null ? Math.round(total) : processedData[selectedIdx].sum.toFixed(1)}
              </span>
          </div>
      </div>
    </div>
  );
};
