// src/components/ui/HeatMap.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { dateUtils } from '../../lib/dateUtils';

/**
 * HeatMap
 * Calendar-style heatmap for daily metric values
 *
 * Props:
 * - data: object { 'YYYY-MM-DD': value } (0–1 for normalized, or boolean 0/1)
 * - startDate: first date to display (YYYY-MM-DD)
 * - endDate: last date to display (YYYY-MM-DD)
 * - size: width/height of each cell (default 16px)
 * - className: optional additional styling
 * - colorScale: function(value) => color string
 */
export const HeatMap = ({
  data = {},
  startDate,
  endDate,
  size = 16,
  className = '',
  colorScale = (v) => {
    if (v === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (v <= 0.25) return 'bg-green-200 dark:bg-green-700';
    if (v <= 0.5) return 'bg-green-400 dark:bg-green-500';
    if (v <= 0.75) return 'bg-green-600 dark:bg-green-400';
    return 'bg-green-800 dark:bg-green-300';
  },
}) => {
  const dates = dateUtils.dateRange(startDate, endDate);

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {dates.map((date) => {
        const value = data[date] ?? 0;
        return (
          <motion.div
            key={date}
            className={`rounded-sm ${colorScale(value)}`}
            style={{ width: size, height: size }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            title={`${date}: ${value}`}
          />
        );
      })}
    </div>
  );
};
