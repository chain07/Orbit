import React, { useState, useEffect } from 'react';

/**
 * StackedBar
 * iOS-style horizontal stacked bars for multiple categories.
 * Renders bars vertically over time (e.g., last 7 days).
 */
export const StackedBar = ({
  data = [],
  colors = {},
  maxValue,
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
  }, [data, maxValue]);

  const init = () => {
    let cats = {};
    let grandSum = 0;
    let maxDaily = 0;

    data.forEach(day => {
      let dSum = 0;
      if (day.values) {
        for (let [k, v] of Object.entries(day.values)) {
          if (!cats[k]) cats[k] = { sum: 0, col: colors[k] || '#8E8E93' };
          cats[k].sum += v;
          dSum += v;
        }
      }
      day.sum = dSum;
      grandSum += dSum;
      if (dSum > maxDaily) maxDaily = dSum;
    });

    // Calculate dynamic max with 10% headroom
    // Ensure min of 10 if data is empty/low
    const computedMax = maxValue || (maxDaily > 0 ? Math.ceil(maxDaily * 1.1) : 10);

    setState({
      cats,
      max: computedMax,
      total: grandSum,
      avg: data.length ? grandSum / data.length : 0,
      sel: null,
    });
  };

  const handleSelect = (idx) => {
    setState(prev => ({
      ...prev,
      sel: prev.sel === idx ? null : idx,
    }));
  };

  if (!data || data.length === 0) return null;

  return (
    <div className="flex flex-col w-full select-none">
      
      {/* HEADER */}
      <div className="flex justify-between items-baseline mb-4">
        <div className="text-sm font-bold text-secondary uppercase tracking-wide">Activity</div>
        <div className="text-xs text-secondary font-medium">Last {data.length} Days</div>
      </div>

      <div className="flex flex-row" style={{ height }}>
        
        {/* CHART BODY */}
        <div className="flex-1 relative mr-2">
            {/* Grid Lines (Dashed, Proper Opacity) */}
            {[0, 1, 2, 3, 4].map((i) => (
                <div 
                    key={i}
                    className="absolute left-0 right-0 border-t border-dashed border-separator opacity-30"
                    style={{ top: `${i * 25}%` }} 
                />
            ))}

            {/* Average Line */}
            {state.avg > 0 && (
                <div 
                  className="absolute left-0 right-0 z-10 pointer-events-none border-t-2 border-dashed border-green opacity-80"
                  style={{ bottom: `${(state.avg / state.max) * 100}%` }}
                >
                  <div className="absolute right-0 -top-5 text-[9px] font-bold text-green bg-bg-color px-1.5 py-0.5 rounded shadow-sm border border-separator/20">
                    AVG {state.avg.toFixed(1)}
                  </div>
                </div>
            )}

            {/* Bars Container */}
            <div className="absolute inset-0 flex items-end justify-between px-2">
                {data.map((day, idx) => {
                    const isSelected = state.sel === idx;
                    const opacity = state.sel !== null && !isSelected ? 0.4 : 1;
                    
                    return (
                        <div 
                            key={idx}
                            onClick={() => handleSelect(idx)}
                            className="flex-1 h-full flex flex-col justify-end items-center cursor-pointer group"
                            style={{ opacity, transition: 'opacity 0.2s' }}
                        >
                            {/* Bar Stack */}
                            <div className="w-[70%] max-w-[32px] flex flex-col-reverse relative transition-transform duration-200"
                                 style={{ height: '100%', transform: isSelected ? 'scaleX(1.05)' : 'none' }}>
                                
                                {Object.entries(day.values || {}).map(([cat, val], i, arr) => {
                                    if (val <= 0) return null;
                                    const hPercent = (val / state.max) * 100;
                                    
                                    // Border Radius Logic: 
                                    // Only round the very top corners of the top segment 
                                    // and very bottom of the bottom segment.
                                    const isBottom = i === 0;
                                    const isTop = i === arr.length - 1;
                                    
                                    const radiusClass = arr.length === 1 ? 'rounded' :
                                                        isBottom ? 'rounded-b' :
                                                        isTop ? 'rounded-t' :
                                                        'rounded-none';

                                    return (
                                        <div
                                            key={cat}
                                            className={radiusClass}
                                            style={{
                                                height: `${hPercent}%`,
                                                backgroundColor: state.cats[cat]?.col || '#8E8E93',
                                                width: '100%',
                                                marginBottom: '1px' // 1px separator
                                            }}
                                        />
                                    );
                                })}
                            </div>

                            {/* X Label (Positioned Below) */}
                            <div className={`absolute -bottom-6 text-[10px] font-medium whitespace-nowrap ${isSelected ? 'text-primary font-bold' : 'text-secondary'}`}>
                                {day.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Y-Axis Labels (Right Side) */}
        <div className="flex flex-col justify-between h-full py-0 w-8 text-right">
             {[4, 3, 2, 1, 0].map(i => (
                 <div key={i} className="text-[9px] text-secondary font-mono h-0 flex items-center justify-end">
                     {Math.round((state.max / 4) * i)}
                 </div>
             ))}
        </div>

      </div>
      
      {/* Spacer for X-labels to prevent clipping */}
      <div className="h-6"></div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 pt-3 border-t border-separator border-opacity-20">
        {Object.keys(state.cats).sort((a,b) => state.cats[b].sum - state.cats[a].sum).map(cat => (
          <div key={cat} className="flex items-center gap-1.5 text-xs font-medium text-secondary">
            <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: state.cats[cat].col }} 
            />
            <span className={state.sel !== null && (!data[state.sel].values || !data[state.sel].values[cat]) ? "opacity-30" : ""}>
                {cat}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
