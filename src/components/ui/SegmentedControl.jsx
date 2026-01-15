// src/components/ui/SegmentedControl.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * SegmentedControl
 * Animated pill-style toggle component
 *
 * Props:
 * - options: array of { label, value }
 * - value: current selected value
 * - onChange: callback when selection changes
 * - className: optional additional styling
 */
export const SegmentedControl = ({ options = [], value, onChange, className = '' }) => {
  const [selected, setSelected] = useState(value || (options[0] && options[0].value));

  useEffect(() => {
    if (value !== undefined) setSelected(value);
  }, [value]);

  const handleSelect = (val) => {
    setSelected(val);
    if (onChange) onChange(val);
  };

  return (
    <div
      className={`relative inline-flex rounded-full bg-gray-200 dark:bg-gray-700 p-1 ${className}`}
    >
      {options.map((option) => (
        <div key={option.value} className="relative z-10 flex-1">
          <button
            onClick={() => handleSelect(option.value)}
            className={`relative w-full text-center py-1 px-3 rounded-full font-medium
              ${
                selected === option.value
                  ? 'text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
          >
            {option.label}
          </button>
        </div>
      ))}

      {/* Animated selection indicator */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 left-1 h-[calc(100%-0.5rem)] rounded-full bg-indigo-500"
        style={{
          width: `${100 / options.length}%`,
          transform: `translateX(${options.findIndex(o => o.value === selected) * 100}%)`,
        }}
      />
    </div>
  );
};
