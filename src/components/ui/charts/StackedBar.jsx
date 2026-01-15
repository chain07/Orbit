import React, { useState, useEffect } from 'react';

/**
 * StackedBar
 * iOS-style horizontal stacked bars for multiple categories.
 * Renders bars vertically over time (e.g., last 7 days).
 *
 * Props:
 * - data: array of { label: string, values: { [category]: number } }
 * - colors: { [category]: colorString }
 * - maxValue: optional max value for scaling (auto-calculated if omitted)
 * - width: chart width (ignored in responsive layout, typically controlled by container)
 * - height: chart height (default 220)
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
      // day.values is { "Sleep": 7, "Work": 8 }
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
    <div className="flex flex-col gap-3 w-full" style={{ height: 'auto' }}>
      
      {/* HEADER */}
      <div className="flex justify-between items-baseline">
        <div className="text-sm font-bold text-secondary uppercase tracking-wide">Activity</div>
        <div className="text-xs text-secondary font-medium">Last {data.length} Days</div>
      </div>

      {/* CHART AREA */}
      <div className="flex relative" style={{ height }}>
        <div className="flex-1 rounded-lg overflow-hidden flex justify-between relative mr-2">
          
          {/* Horizontal Grid Lines */}
          {[...Array(5)].map((_, i) => (
            <div 
                key={i} 
                className="absolute left-0 right-0 h-px bg-separator opacity-20" 
                style={{ top: `${i*25}%` }} 
            />
          ))}

          {/* Vertical Separators (optional, usually subtle) */}
          {data.map((_, i) => (
            <div 
                key={i} 
                className="absolute top-0 bottom-0 w-px bg-separator opacity-10" 
                style={{ left: `${(i / data.length) * 100}%` }} 
            />
          ))}

          {/* AVG LINE */}
          {state.avg > 0 && (
            <div 
              className="absolute left-0 right-0 z-10 pointer-events-none border-t-2 border-dashed border-green"
              style={{ bottom: `${Math.min(100, (state.avg / state.max) * 100)}%` }}
            >
              <div className="absolute right-1 -top-4 text-[10px] font-bold text-green bg-card px-1 rounded shadow-sm">
                AVG {state.avg.toFixed(1)}
              </div>
            </div>
          )}

          {/* BARS */}
          {data.map((day, idx) => {
            const isSelected = state.sel === idx;
            const opacity = state.sel !== null && !isSelected ? 0.3 : 1;
            const transform = isSelected ? 'scaleY(1.02)' : 'scaleY(1)';
            
            return (
              <div 
                key={idx} 
                onClick={() => handleSelect(idx)} 
                className="flex-1 h-full cursor-pointer flex justify-center relative transition-all duration-300 ease-out"
                style={{ opacity, transform }}
              >
                {/* The Stack */}
                <div className="w-[65%] max-w-[40px] h-full flex flex-col-reverse justify-start">
                  {Object.entries(day.values).map(([cat, val], i, arr) => {
                    if (val <= 0) return null;
                    const h = (val / state.max) * 100;
                    
                    // Rounding logic: Only round top corners of top segment, bottom of bottom
                    const isTop = i === arr.length - 1;
                    const isBottom = i === 0;
                    const borderRadius = `${isTop ? '4px' : '1px'} ${isTop ? '4px' : '1px'} ${isBottom ? '2px' : '1px'} ${isBottom ? '2px' : '1px'}`;
                    
                    return (
                      <div 
                        key={cat} 
                        style={{ 
                            height: `${h}%`, 
                            width: '100%', 
                            backgroundColor: state.cats[cat]?.col || '#ccc', 
                            borderRadius: borderRadius,
                            marginBottom: 1, 
                            transition: 'height 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)'
                        }} 
                      />
                    );
                  })}
                </div>
                
                {/* X Label */}
                <div className={`absolute -bottom-6 text-[10px] text-center whitespace-nowrap ${isSelected ? 'font-bold text-primary' : 'text-secondary font-medium'}`}>
                    {day.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Y Axis Labels */}
        <div className="w-6 flex flex-col-reverse justify-between py-1">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="text-[10px] text-secondary font-medium h-2 relative">
              <span className="absolute top-0 right-0 transform -translate-y-1/2">
                  {Math.round((state.max / 4) * i) || '0'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* LEGEND */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-2 border-t border-separator border-opacity-20">
        {Object.keys(state.cats).sort((a,b) => state.cats[b].sum - state.cats[a].sum).map(cat => (
          <div key={cat} className="flex items-center gap-1.5 text-xs font-medium text-secondary">
            <div 
                className="w-2.5 h-2.5 rounded-full shadow-sm" 
                style={{ backgroundColor: state.cats[cat].col }} 
            />
            <span className={state.sel !== null && !data[state.sel].values[cat] ? "opacity-30" : ""}>{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
