// src/components/ui/Card.jsx
import React from 'react';

/**
 * Card
 * Reusable card component for ORBIT
 *
 * Props:
 * - children: main content of the card
 * - className: optional additional styling
 * - header: optional header content
 * - footer: optional footer content
 * - style: optional inline styles
 */
export const Card = ({ children, className = '', header = null, footer = null, style = {} }) => {
  return (
    <div
      className={`
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        rounded-2xl
        shadow-md
        p-4
        flex flex-col
        ${className}
      `}
      style={style}
    >
      {header && (
        <div className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
          {header}
        </div>
      )}

      <div className="flex-1">{children}</div>

      {footer && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {footer}
        </div>
      )}
    </div>
  );
};
