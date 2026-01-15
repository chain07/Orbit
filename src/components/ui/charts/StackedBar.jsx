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

  // Main Container
  return (
    <div 
        className="card flex flex-col gap-3 p-3 w-full" 
        style={{ maxWidth: '100%' }}
    >
      
      {/* HEADER */}
      <div className="flex justify-between items-baseline">
        <div className="text-lg font-bold">Activity</div>
        <div className="text-sm text-secondary font-medium">Last 7 Days</div>
      </div>

      {/* CHART AREA */}
      <div className="flex relative" style={{ height }}>
        <div className="flex-1 rounded-lg overflow-hidden flex justify-between relative mr-2">
          
          {/* Horizontal Grid */}
          {[...Array(5)].map((_, i) => (
            <div 
                key={i} 
                className="absolute left-0 right-0 h-px bg-separator opacity-20" 
                style={{ top: `${i*25}%` }} 
            />
          ))}

          {/* Vertical Grid */}
          {data.map((_, i) => (
            <div 
                key={i} 
                className="absolute top-0 bottom-0 w-px bg-separator opacity-20" 
                style={{ left: `${(i / data.length) * 100}%` }} 
            />
          ))}

          {/* AVG LINE */}
          <div 
            className="absolute left-0 right-0 z-10 pointer-events-none border-t-2 border-dashed border-green"
            style={{ bottom: `${(state.avg / state.max) * 100}%` }}
          >
            <div className="absolute right-1 -top-4 text-xs font-bold text-green bg-card px-1 rounded">
              AVG {state.avg.toFixed(1)}
            </div>
          </div>

          {/* BARS */}
          {data.map((day, idx) => {
            const isSelected = state.sel === idx;
            const opacity = state.sel !== null && !isSelected ? 0.2 : 1;
            const transform = isSelected ? 'scaleY(1.02)' : 'scaleY(1)';
            
            return (
              <div 
                key={idx} 
                onClick={() => handleSelect(idx)} 
                className="flex-1 h-full cursor-pointer flex justify-center relative transition-all duration-200"
                style={{ opacity, transform }}
              >
                <div className="w-[55%] max-w-[36px] h-full flex flex-col-reverse">
                  {Object.entries(day.values).map(([cat, val], i, arr) => {
                    const h = (val / state.max) * 100;
                    const isTop = i === arr.length - 1;
                    const isBottom = i === 0;
                    // Note: Conditional rounding logic kept inline as it depends on loop index
                    const borderRadius = `${isTop ? '4px' : '0'} ${isTop ? '4px' : '0'} ${isBottom ? '2px' : '0'} ${isBottom ? '2px' : '0'}`;
                    
                    return (
                      <div 
                        key={cat} 
                        style={{ 
                            height: `${h}%`, 
                            width: '100%', 
                            backgroundColor: state.cats[cat].col, 
                            borderRadius: borderRadius,
                            marginTop: 1, 
                            transition: 'height 0.6s cubic-bezier(0.33,1,0.68,1)'
                        }} 
                      />
                    );
                  })}
                </div>
                
                {/* X Label */}
                <div className={`absolute -bottom-6 text-xs text-center whitespace-nowrap ${isSelected ? 'font-bold text-primary' : 'text-secondary font-medium'}`}>
                    {day.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Y Axis */}
        <div className="w-6 flex flex-col-reverse justify-between">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="text-xs text-secondary font-medium h-2.5 relative">
              <span className="absolute top-0 right-0 transform -translate-y-1/2">
                  {Math.round((state.max / 4) * i) || ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* LEGEND */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
        {Object.keys(state.cats).sort((a,b) => state.cats[b].sum - state.cats[a].sum).map(cat => (
          <div key={cat} className="flex items-center gap-1.5 text-xs font-medium text-secondary">
            <div 
                className="w-2 h-2 rounded-sm" 
                style={{ backgroundColor: state.cats[cat].col }} 
            />
            <span>{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
