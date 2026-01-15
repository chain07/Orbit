import React, { useState } from 'react';
/* 🔗 Global design system */
import '../styles/tokens.css';
import '../styles/motion.css';
/* import '../styles/index.css'; <-- Ensure this is imported here or in main.jsx */
import { StorageProvider } from '../context/StorageContext';
import { Horizon } from '../views/Horizon';
import { Logger } from '../views/Logger';
import { Intel } from '../views/Intel';
import { System } from '../views/System';
import { BottomNav } from '../components/ui/BottomNav';

export const App = () => {
  const [activeTab, setActiveTab] = useState('Horizon');

  const renderTab = () => {
    switch (activeTab) {
      case 'Horizon': return <Horizon />;
      case 'Logger': return <Logger />;
      case 'Intel': return <Intel />;
      case 'System': return <System />;
      default: return <Horizon />;
    }
  };

  return (
    <StorageProvider>
      <div className="flex flex-col h-full bg-page font-system text-primary">
        <div className="flex-1 overflow-y-auto">
          {renderTab()}
        </div>
        <BottomNav
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>
    </StorageProvider>
  );
};
