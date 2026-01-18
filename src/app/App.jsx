import React, { useState, useContext, useEffect } from 'react';
import '../styles/tokens.css';
import '../styles/motion.css';

import { StorageProvider, StorageContext } from '../context/StorageContext';
import { NavigationProvider, NavigationContext } from '../context/NavigationContext';
import { Horizon } from '../views/Horizon';
import { Logger } from '../views/Logger';
import { Intel } from '../views/Intel';
import { System } from '../views/System';
import BottomNav from '../components/ui/BottomNav';
import { OnboardingWizard } from '../components/system/OnboardingWizard';

const AppContent = () => {
  const { activeTab, setActiveTab, navigationParams, setNavigationParams, tabs } = useContext(NavigationContext);
  const { onboardingComplete, completeOnboarding } = useContext(StorageContext);
  const [showWizard, setShowWizard] = useState(false);

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

  const renderTab = () => {
    switch (activeTab) {
      case 'Horizon': return <Horizon />;
      case 'Logger':
        // Pass params if active tab matches logic, otherwise null
        // (Though technically we just want to pass it once or check if tab is logger)
        return <Logger initialMetricId={navigationParams?.metricId} />;
      case 'Intel': return <Intel />;
      case 'System': return <System />;
      default: return <Horizon />;
    }
  };

  // Find active index from activeTab ID
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  // Handler that receives index and converts to ID
  const handleTabChange = (index) => {
    const selectedTab = tabs[index];
    if (selectedTab) {
      setActiveTab(selectedTab.id);
      // Clear navigation params on manual tab switch to prevent stuck state
      setNavigationParams(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-bg-color font-system text-primary relative">
      {/* Main Content Area - Native Scroll */}
      <main className="flex-1 w-full layout-padding">
        {renderTab()}
      </main>
      
      {/* Navigation - Fixed Bottom */}
      <BottomNav
        tabs={tabs}
        activeIndex={activeIndex}
        onChange={handleTabChange}
      />

      {/* Onboarding Overlay - Fixed & Scrollable */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-bg-color animate-fade-in overflow-y-auto">
          <OnboardingWizard onComplete={handleOnboardingFinish} />
        </div>
      )}
    </div>
  );
};

export const App = () => {
  return (
    <StorageProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </StorageProvider>
  );
};
