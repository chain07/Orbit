// src/App.jsx
import React, { useState } from 'react';
import { StorageProvider } from './context/StorageContext';
import { Horizon } from './views/Horizon';
import { Logger } from './views/Logger';
import { Intel } from './views/Intel';
import { System } from './views/System';
import { BottomNav } from './components/ui/BottomNav';

export const App = () => {
  const [activeTab, setActiveTab] = useState('Horizon');

  const renderTab = () => {
    switch(activeTab) {
      case 'Horizon': return <Horizon />;
      case 'Logger': return <Logger />;
      case 'Intel': return <Intel />;
      case 'System': return <System />;
      default: return <Horizon />;
    }
  };

  return (
    <StorageProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {renderTab()}
        </div>
        <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      </div>
    </StorageProvider>
  );
};
