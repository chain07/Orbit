// src/components/ui/Glass.jsx
import React from 'react';

/**
 * Glass
 * Reusable glassmorphic container
 *
 * Props:
 * - children: content inside the glass card
 * - className: optional additional styling
 * - style: optional inline styles
 */
export const Glass = ({ children, className = '', style = {} }) => {
  return (
    <div
      className={`
        bg-white/20 dark:bg-gray-900/30
        backdrop-blur-md
        border border-white/30 dark:border-gray-700/30
        rounded-2xl
        shadow-md
        p-4
        ${className}
      `}
      style={style}
    >
      {children}
    </div>
  );
};
