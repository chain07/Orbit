import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * HeatMap
 * GitHub-style contribution graph.
 * Rows = Days of Week (Sun-Sat)
 * Cols = Weeks
 * * Props:
 * - data: object { 'YYYY-MM-DD': value } (0–1 normalized)
 * - startDate: 'YYYY-MM-DD'
 * - endDate: 'YYYY-MM-DD'
 * - size: cell size in px
 */
export const HeatMap = ({
  data = {},
  startDate,
  endDate,
  size = 10,
  className = '',
  // Default color scale (GitHub Green-ish)
  colorScale = (v) => {
    if (v === 0 || v === undefined) return 'bg-separator opacity-20'; // Empty/None
    if (v <= 0.25) return 'bg-green opacity-40';
    if (v <= 0.50) return 'bg-green opacity-60';
    if (v <= 0.75) return 'bg-green opacity-80';
    return 'bg-green'; // Full
  },
}) => {
  // 1. Structure Data into Weeks
  const { weeks, months } = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const weeksArr = [];
    const monthsArr = [];
    
    let current = new Date(start);
    // Align start to Sunday
    const startDay = current.getDay(); 
    current.setDate(current.getDate() - startDay);

    let currentWeek = [];
    let lastMonth = -1;

    // Loop until we pass the end date
    while (current <= end || currentWeek.length > 0) {
      // Check for Month Label (if first week of new month)
      if (current.getDay() === 0) {
        const m = current.getMonth();
        if (m !== lastMonth) {
          monthsArr.push({ index: weeksArr.length, label: current.toLocaleString('default', { month: 'short' }) });
          lastMonth = m;
        }
      }

      // Add day to week
      const dateStr = current.toISOString().split('T')[0];
      // Only mark as "in range" if it's within actual start/end
      const inRange = current >= new Date(startDate) && current <= end;
      
      currentWeek.push({
        date: dateStr,
        val: inRange ? data[dateStr] : null, // null indicates padding/out of range
        inRange
      });

      // Advance
      current.setDate(current.getDate() + 1);

      // Push Week
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
        // Stop if we've gone past end date and finished the week
        if (current > end) break;
      }
    }
    return { weeks: weeksArr, months: monthsArr };
  }, [startDate, endDate, data]);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Month Labels */}
      <div className="flex relative h-4 w-full">
        {/* Spacer for Day Labels */}
        <div className="w-8 shrink-0"></div> 
        <div className="flex-1 relative">
           {months.map((m, i) => (
             <div 
                key={i} 
                className="absolute text-[9px] text-secondary font-bold uppercase"
                style={{ left: `${m.index * (size + 2)}px` }} // size + gap
             >
               {m.label}
             </div>
           ))}
        </div>
      </div>

      <div className="flex">
        {/* Day Labels (Mon, Wed, Fri) */}
        <div className="flex flex-col justify-between py-[2px] pr-2 w-8 shrink-0 text-[9px] text-secondary font-medium text-right">
           <div className="h-[10px] invisible">Sun</div>
           <div className="h-[10px]">Mon</div>
           <div className="h-[10px] invisible">Tue</div>
           <div className="h-[10px]">Wed</div>
           <div className="h-[10px] invisible">Thu</div>
           <div className="h-[10px]">Fri</div>
           <div className="h-[10px] invisible">Sat</div>
        </div>

        {/* The Grid */}
        <div className="flex gap-[2px]">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-[2px]">
              {week.map((day, dIdx) => (
                <motion.div
                  key={dIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: (wIdx * 0.02) + (dIdx * 0.005) }}
                  className={`rounded-xs ${day.val !== null ? colorScale(day.val) : 'bg-transparent'}`}
                  style={{ 
                    width: size, 
                    height: size,
                  }}
                  title={day.inRange ? `${day.date}: ${day.val || 0}` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
