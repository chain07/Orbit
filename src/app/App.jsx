import React, { useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { LayoutDashboard, PenTool, Radio, Settings } from 'lucide-react';
import '../styles/tokens.css';
import '../styles/motion.css';

import { StorageProvider, StorageContext } from '../context/StorageContext';
import { Horizon } from '../views/Horizon';
import { Logger } from '../views/Logger';
import { Intel } from '../views/Intel';
import { System } from '../views/System';
import BottomNav from '../components/ui/BottomNav';
import { OnboardingWizard } from '../components/system/OnboardingWizard';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('Horizon');
  const { onboardingComplete, completeOnboarding } = useContext(StorageContext);
  const [showWizard, setShowWizard] = useState(false);

  // Define Tab Configuration for Navigation
  const tabs = useMemo(() => [
    { id: 'Horizon', label: 'Horizon', icon: <LayoutDashboard size={24} /> },
    { id: 'Logger', label: 'Logger', icon: <PenTool size={24} /> },
    { id: 'Intel', label: 'Intel', icon: <Radio size={24} /> },
    { id: 'System', label: 'System', icon: <Settings size={24} /> }
  ], []);

  // Onboarding Logic:
  // 1. If onboardingComplete is FALSE (new user), show wizard.
  // 2. If it turns TRUE (loaded from storage or finished), hide wizard.
  useEffect(() => {
    if (onboardingComplete === false) {
      setShowWizard(true);
    } else if (onboardingComplete === true) {
      setShowWizard(false);
    }
  }, [onboardingComplete]);

  const handleOnboardingFinish = () => {
    completeOnboarding();
    // Local state update provides instant feedback while Context saves async
    setShowWizard(false);
  };

  const handleGoToSystem = useCallback(() => {
    setActiveTab('System');
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'Horizon': return <Horizon onGoToSystem={handleGoToSystem} />;
      case 'Logger': return <Logger />;
      case 'Intel': return <Intel />;
      case 'System': return <System />;
      default: return <Horizon onGoToSystem={handleGoToSystem} />;
    }
  };

  // Find active index from activeTab ID
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  // Handler that receives index and converts to ID
  const handleTabChange = (index) => {
    const selectedTab = tabs[index];
    if (selectedTab) {
      setActiveTab(selectedTab.id);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-bg-color font-system text-primary overflow-hidden relative">
      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden safe-bottom pb-24">
        {renderTab()}
      </main>
      
      {/* Navigation - Fixed Bottom */}
      <BottomNav
        tabs={tabs}
        activeIndex={activeIndex}
        onChange={handleTabChange}
      />

      {/* Onboarding Overlay */}
      {showWizard && (
        <div className="absolute inset-0 z-50 bg-bg-color animate-fade-in">
          <OnboardingWizard onComplete={handleOnboardingFinish} />
        </div>
      )}
    </div>
  );
};

export const App = () => {
  return (
    <StorageProvider>
      <AppContent />
    </StorageProvider>
  );
};
