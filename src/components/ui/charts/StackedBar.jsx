// src/components/ui/StackedBar.jsx
import React, { useState, useEffect } from 'react';

/**
 * StackedBar
 * iOS-style horizontal stacked bars for multiple categories
 *
 * Props:
 * - data: array of { label: string, values: { [category]: number } }
 * - colors: { [category]: colorString }
 * - maxValue: optional max value for scaling (auto-calculated if omitted)
 * - width: chart width (default 400)
 * - height: chart height (default 220)
 */
export const StackedBar = ({
  data = [],
  colors = {},
  maxValue,
  width = 400,
  height = 220,
}) => {
  const [state, setState] = useState({
    cats: {},
    max: 0,
    total: 0,
    avg: 0,
    sel: null,
  });

  useEffect(() => {
    init();
  }, [data]);

  const init = () => {
    let cats = {};
    let grandSum = 0;
    let maxDaily = 0;

    data.forEach(day => {
      let dSum = 0;
      for (let [k, v] of Object.entries(day.values)) {
        if (!cats[k]) cats[k] = { sum: 0, col: colors[k] || '#8E8E93' };
        cats[k].sum += v;
        dSum += v;
      }
      day.sum = dSum;
      grandSum += dSum;
      if (dSum > maxDaily) maxDaily = dSum;
    });

    const computedMax = maxValue || Math.max(4, Math.ceil(maxDaily / 2) * 2);

    setState({
      cats,
      max: computedMax,
      total: grandSum,
      avg: grandSum / data.length,
      sel: null,
    });
  };

  const handleSelect = (idx) => {
    setState(prev => ({
      ...prev,
      sel: prev.sel === idx ? null : idx,
    }));
  };

  return (
    <div style={{ width, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: 12, borderRadius: 22, background: 'var(--c-card-bg, #FFF)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Activity</div>
        <div style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)', fontWeight: 500 }}>Last 7 Days</div>
      </div>

      {/* CHART AREA */}
      <div style={{ display: 'flex', height, position: 'relative' }}>
        <div style={{ flex: 1, borderRadius: 10, overflow: 'hidden', display: 'flex', justifyContent: 'space-between', position: 'relative', marginRight: 10 }}>
          
          {/* Horizontal Grid */}
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ position: 'absolute', top: `${i*25}%`, left: 0, right: 0, height: 1, background: 'rgba(60,60,67,0.18)' }} />
          ))}

          {/* Vertical Grid */}
          {data.map((_, i) => (
            <div key={i} style={{ position: 'absolute', left: `${(i / data.length) * 100}%`, top: 0, bottom: 0, width: 1, background: 'rgba(60,60,67,0.18)' }} />
          ))}

          {/* AVG LINE */}
          <div style={{
            position: 'absolute',
            bottom: `${(state.avg / state.max) * 100}%`,
            left: 0,
            right: 0,
            borderTop: '2px dashed #30D158',
            zIndex: 50,
            pointerEvents: 'none'
          }}>
            <div style={{ position: 'absolute', right: 4, top: -15, fontSize: 10, fontWeight: 700, color: '#30D158', background: 'var(--c-card-bg, #FFF)', padding: '0 4px', borderRadius: 4 }}>
              AVG {state.avg.toFixed(1)}
            </div>
          </div>

          {/* BARS */}
          {data.map((day, idx) => {
            const isSelected = state.sel === idx;
            const opacity = state.sel !== null && !isSelected ? 0.2 : 1;
            const transform = isSelected ? 'scaleY(1.02)' : 'scaleY(1)';
            return (
              <div key={idx} onClick={() => handleSelect(idx)} style={{ flex: 1, height: '100%', cursor: 'pointer', display: 'flex', justifyContent: 'center', position: 'relative', opacity, transform, transition: '0.2s' }}>
                <div style={{ width: '55%', maxWidth: 36, height: '100%', display: 'flex', flexDirection: 'column-reverse' }}>
                  {Object.entries(day.values).map(([cat, val], i, arr) => {
                    const h = (val / state.max) * 100;
                    const isTop = i === arr.length - 1;
                    const isBottom = i === 0;
                    return (
                      <div key={cat} style={{
                        height: `${h}%`,
                        width: '100%',
                        backgroundColor: state.cats[cat].col,
                        borderTopLeftRadius: isTop ? 4 : 0,
                        borderTopRightRadius: isTop ? 4 : 0,
                        borderBottomLeftRadius: isBottom ? 2 : 0,
                        borderBottomRightRadius: isBottom ? 2 : 0,
                        marginTop: 1,
                        transition: 'height 0.6s cubic-bezier(0.33,1,0.68,1)',
                      }} />
                    );
                  })}
                </div>

                {/* X Label */}
                <div style={{ position: 'absolute', bottom: -24, width: '100%', textAlign: 'center', fontSize: 11, color: 'rgba(60,60,67,0.6)', fontWeight: 500 }}>
                  {day.label.split(' ')[1] || day.label[0]}
                </div>
              </div>
            );
          })}

        </div>

        {/* Y Axis */}
        <div style={{ width: 26, display: 'flex', flexDirection: 'column-reverse', justifyContent: 'space-between' }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{ fontSize: 11, color: 'rgba(60,60,67,0.3)', fontWeight: 500, height: 10, lineHeight: '10px', position: 'relative', top: i===0?0:5 }}>
              {Math.round((state.max / 4) * i) || ''}
            </div>
          ))}
        </div>
      </div>

      {/* LEGEND */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: 12 }}>
        {Object.keys(state.cats).sort((a,b) => state.cats[b].sum - state.cats[a].sum).map(cat => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(60,60,67,0.6)', fontWeight: 500 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: state.cats[cat].col }} />
            <span>{cat}</span>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: '0.5px solid rgba(60,60,67,0.36)', paddingTop: 14, marginTop: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)', fontWeight: 500 }}>Total Duration</div>
        <div style={{ fontSize: 26, fontWeight: 700 }}>{state.total.toFixed(1)}h</div>
      </div>
    </div>
  );
};
