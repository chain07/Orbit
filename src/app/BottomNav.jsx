// src/components/ui/BottomNav.jsx
import React from 'react';

export const BottomNav = ({ activeTab, onChange }) => {
  const tabs = [
    { key: 'Horizon', label: 'Horizon' },
    { key: 'Logger', label: 'Logger' },
    { key: 'Intel', label: 'Intel' },
    { key: 'System', label: 'System' }
  ];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-around',
      padding: 10,
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      boxShadow: '0 -2px 8px rgba(0,0,0,0.08)'
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <div
            key={tab.key}
            onClick={() => onChange(tab.key)}
            style={{
              flex: 1,
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              padding: 6,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#4f46e5' : 'rgba(60,60,67,0.6)'
            }}
          >
            {tab.label}
            {isActive && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 30,
                height: 3,
                borderRadius: 2,
                background: '#4f46e5',
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};
