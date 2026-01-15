// src/components/ui/BottomNav.jsx
import React from 'react';
import { motion } from 'framer-motion';

/**
 * BottomNav
 * Fixed pill-shaped bottom navigation bar
 *
 * Props:
 * - items: array of { label, icon: JSX, value }
 * - value: current selected value
 * - onChange: callback when user selects a nav item
 * - className: optional additional styling
 */
export const BottomNav = ({ items = [], value, onChange, className = '' }) => {
  const selectedIndex = items.findIndex(item => item.value === value) || 0;

  return (
    <div
      className={`
        fixed bottom-4 left-1/2 transform -translate-x-1/2
        flex justify-between bg-white/30 dark:bg-gray-900/30
        backdrop-blur-md rounded-full p-1 shadow-md
        w-11/12 max-w-lg z-50
        ${className}
      `}
    >
      {items.map((item, index) => (
        <button
          key={item.value}
          onClick={() => onChange && onChange(item.value)}
          className="flex-1 relative z-10 flex flex-col items-center justify-center py-2"
        >
          {item.icon}
          <span className="text-xs text-gray-700 dark:text-gray-300 mt-1">
            {item.label}
          </span>
        </button>
      ))}

      {/* Animated pill indicator */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 left-1 h-[calc(100%-0.25rem)] w-[calc(100% / var(--nav-count))] rounded-full bg-indigo-500"
        style={{ '--nav-count': items.length, transform: `translateX(${selectedIndex * 100}%)` }}
      />
    </div>
  );
};
