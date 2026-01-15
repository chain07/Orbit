import React from 'react';

export const Layout = ({ children, header = null, footer = null, className = '' }) => {
  return (
    <div className={`flex flex-col min-h-screen bg-page p-4 gap-4 ${className}`}>
      {header && <div>{header}</div>}
      <div className="flex-1">
        {children}
      </div>
      {footer && <div>{footer}</div>}
    </div>
  );
};
