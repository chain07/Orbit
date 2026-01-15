// src/components/ui/Layout.jsx
import React from 'react';

export const Layout = ({ children, header = null, footer = null, style = {} }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: 'var(--c-bg-page, transparent)',
      padding: 16,
      gap: 16,
      ...style
    }}>
      {header && <div>{header}</div>}
      <div style={{ flex: 1 }}>
        {children}
      </div>
      {footer && <div>{footer}</div>}
    </div>
  );
};
